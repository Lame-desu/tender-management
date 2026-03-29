import { Prisma, Role } from "@prisma/client";
import prisma from "../config/db";
import { ApiError } from "../utils/ApiError";

// ─── BID OPENING ──────────────────────────────────────────────────────────────

export async function openBids(tenderId: number, officerId: number) {
  const tender = await prisma.tender.findUnique({
    where: { id: tenderId },
    include: {
      bids: {
        where: { status: "SUBMITTED" },
        include: {
          bidOwner: { select: { fullName: true, bidderProfile: { select: { organizationName: true } } } },
          _count: { select: { documents: true } },
        },
      },
    },
  });

  if (!tender) throw new ApiError(404, "Tender not found");
  if (tender.createdBy !== officerId) throw new ApiError(403, "Access denied");
  if (tender.status !== "PUBLISHED") throw new ApiError(400, "Tender must be in PUBLISHED status");
  if (new Date() <= tender.submissionDeadline) throw new ApiError(400, "Submission deadline has not passed yet");
  if (tender.bids.length === 0) throw new ApiError(400, "No bids have been submitted");

  await prisma.bid.updateMany({
    where: { tenderId, status: "SUBMITTED" },
    data: { status: "OPENED" },
  });

  await prisma.tender.update({
    where: { id: tenderId },
    data: { status: "UNDER_EVALUATION" },
  });

  const bidDetails = tender.bids.map((b) => ({
    bidderName: b.bidOwner.bidderProfile?.organizationName || b.bidOwner.fullName,
    bidAmount: b.bidAmount,
    bidSecurityProvided: !!b.bidSecurityInfo,
    submissionDate: b.submissionDate,
    documentCount: b._count.documents,
  }));

  await prisma.auditLog.create({
    data: {
      action: "Opened bids for tender",
      entityType: "Tender",
      entityId: tenderId,
      performedBy: officerId,
      details: JSON.stringify(bidDetails),
    },
  });

  const bidderIds = tender.bids.map((b) => b.bidderId);
  if (bidderIds.length > 0) {
    await prisma.notification.createMany({
      data: bidderIds.map((uid) => ({
        userId: uid,
        message: `Bids for ${tender.title} have been opened`,
        notificationType: "BIDS_OPENED",
        entityType: "Tender",
        entityId: tenderId,
      })),
    });
  }

  return prisma.bid.findMany({
    where: { tenderId },
    include: {
      bidOwner: { select: { id: true, fullName: true, bidderProfile: { select: { organizationName: true } } } },
      _count: { select: { documents: true } },
    },
    orderBy: { submissionDate: "asc" },
  });
}

export async function getBidOpeningRecord(tenderId: number, userId: number, userRole: Role) {
  const tender = await prisma.tender.findUnique({
    where: { id: tenderId },
    include: {
      bids: {
        include: {
          bidOwner: { select: { id: true, fullName: true, bidderProfile: { select: { organizationName: true } } } },
          _count: { select: { documents: true } },
        },
        orderBy: { submissionDate: "asc" },
      },
    },
  });

  if (!tender) throw new ApiError(404, "Tender not found");

  if (userRole === "PROCUREMENT_OFFICER" && tender.createdBy !== userId) {
    throw new ApiError(403, "Access denied");
  }
  if (userRole === "BIDDER") {
    const hasBid = tender.bids.some((b) => b.bidderId === userId);
    if (!hasBid) throw new ApiError(403, "Access denied");
  }
  if (userRole === "EVALUATOR") {
    const assigned = await prisma.evaluationCommitteeAssignment.findFirst({
      where: { tenderId, userId },
    });
    if (!assigned) throw new ApiError(403, "Access denied");
  }

  const openingLog = await prisma.auditLog.findFirst({
    where: { action: "Opened bids for tender", entityType: "Tender", entityId: tenderId },
    orderBy: { timestamp: "desc" },
  });

  return {
    tenderTitle: tender.title,
    openingDate: openingLog?.timestamp || null,
    bids: tender.bids.map((b) => ({
      bidderName: b.bidOwner.bidderProfile?.organizationName || b.bidOwner.fullName,
      bidAmount: b.bidAmount,
      bidSecurityStatus: b.bidSecurityInfo ? "Provided" : "Not provided",
      submissionDate: b.submissionDate,
      documentCount: b._count.documents,
    })),
  };
}

// ─── EVALUATION COMMITTEE ─────────────────────────────────────────────────────

export async function assignCommittee(tenderId: number, officerId: number, memberIds: number[]) {
  const tender = await prisma.tender.findUnique({ where: { id: tenderId } });
  if (!tender) throw new ApiError(404, "Tender not found");
  if (tender.createdBy !== officerId) throw new ApiError(403, "Access denied");
  if (tender.status !== "UNDER_EVALUATION") throw new ApiError(400, "Tender must be under evaluation");
  if (memberIds.length < 3) throw new ApiError(400, "At least 3 committee members required");

  const uniqueIds = [...new Set(memberIds)];
  const evaluators = await prisma.user.findMany({
    where: { id: { in: uniqueIds }, role: "EVALUATOR", status: "ACTIVE" },
  });
  if (evaluators.length !== uniqueIds.length) {
    throw new ApiError(400, "All members must be active evaluators");
  }

  const existing = await prisma.evaluationCommitteeAssignment.findMany({
    where: { tenderId },
  });
  if (existing.length > 0) {
    throw new ApiError(400, "Committee has already been assigned for this tender");
  }

  await prisma.evaluationCommitteeAssignment.createMany({
    data: uniqueIds.map((uid) => ({
      tenderId,
      userId: uid,
      assignedBy: officerId,
    })),
  });

  await prisma.notification.createMany({
    data: uniqueIds.map((uid) => ({
      userId: uid,
      message: `You have been assigned to evaluate: ${tender.title}`,
      notificationType: "COMMITTEE_ASSIGNED",
      entityType: "Tender",
      entityId: tenderId,
    })),
  });

  return prisma.evaluationCommitteeAssignment.findMany({
    where: { tenderId },
    include: { user: { select: { id: true, fullName: true, email: true } } },
  });
}

export async function getCommittee(tenderId: number) {
  const members = await prisma.evaluationCommitteeAssignment.findMany({
    where: { tenderId },
    include: { user: { select: { id: true, fullName: true, email: true } } },
  });

  const evaluations = await prisma.evaluation.findMany({
    where: { bid: { tenderId }, evaluationType: "TECHNICAL" },
    select: { evaluatorId: true },
    distinct: ["evaluatorId"],
  });
  const completedIds = new Set(evaluations.map((e) => e.evaluatorId));

  return members.map((m) => ({
    ...m,
    hasCompletedEvaluation: completedIds.has(m.userId),
  }));
}

// ─── TECHNICAL EVALUATION ─────────────────────────────────────────────────────

export async function getTechnicalEvaluationData(tenderId: number, evaluatorId: number) {
  const assignment = await prisma.evaluationCommitteeAssignment.findFirst({
    where: { tenderId, userId: evaluatorId },
  });
  if (!assignment) throw new ApiError(403, "You are not assigned to this tender's committee");

  const tender = await prisma.tender.findUnique({
    where: { id: tenderId },
    select: {
      id: true, title: true,
      evaluationCriteria: true,
      minimumTechnicalScore: true,
      status: true,
    },
  });
  if (!tender) throw new ApiError(404, "Tender not found");

  const bids = await prisma.bid.findMany({
    where: { tenderId, status: { in: ["OPENED", "TECHNICALLY_QUALIFIED", "TECHNICALLY_DISQUALIFIED", "EVALUATED"] } },
    include: {
      bidOwner: { select: { id: true, fullName: true, bidderProfile: { select: { organizationName: true } } } },
      documents: { where: { documentCategory: "TECHNICAL" } },
    },
    orderBy: { submissionDate: "asc" },
  });

  // Hide financial info: map out bidAmount
  const sanitizedBids = bids.map((b) => ({
    id: b.id,
    bidderName: b.bidOwner.bidderProfile?.organizationName || b.bidOwner.fullName,
    technicalProposal: b.technicalProposal,
    bidSecurityInfo: b.bidSecurityInfo,
    documents: b.documents,
    submissionDate: b.submissionDate,
  }));

  const myEvaluations = await prisma.evaluation.findMany({
    where: { evaluatorId, evaluationType: "TECHNICAL", bid: { tenderId } },
    select: { bidId: true, criteriaScores: true, totalScore: true, remarks: true },
  });

  return {
    tender: {
      id: tender.id,
      title: tender.title,
      evaluationCriteria: tender.evaluationCriteria,
      minimumTechnicalScore: tender.minimumTechnicalScore,
    },
    bids: sanitizedBids,
    myEvaluations,
  };
}

export async function submitTechnicalEvaluation(
  tenderId: number,
  evaluatorId: number,
  evaluations: { bidId: number; criteriaScores: { criteriaName: string; score: number }[]; remarks?: string }[]
) {
  const assignment = await prisma.evaluationCommitteeAssignment.findFirst({
    where: { tenderId, userId: evaluatorId },
  });
  if (!assignment) throw new ApiError(403, "You are not assigned to this tender's committee");

  const tender = await prisma.tender.findUnique({
    where: { id: tenderId },
    select: { evaluationCriteria: true },
  });
  if (!tender) throw new ApiError(404, "Tender not found");

  const criteria = tender.evaluationCriteria as { name: string; weight: number }[];

  const allBids = await prisma.bid.findMany({
    where: { tenderId, status: { in: ["OPENED", "TECHNICALLY_QUALIFIED", "TECHNICALLY_DISQUALIFIED", "EVALUATED"] } },
    select: { id: true },
  });

  const allBidIds = new Set(allBids.map((b) => b.id));

  if (evaluations.length !== allBidIds.size) {
    throw new ApiError(400, `Must provide scores for all ${allBidIds.size} bids`);
  }

  for (const ev of evaluations) {
    if (!allBidIds.has(ev.bidId)) {
      throw new ApiError(400, `Invalid bid ID: ${ev.bidId}`);
    }

    for (const cs of ev.criteriaScores) {
      const criterion = criteria.find((c) => c.name === cs.criteriaName);
      if (!criterion) throw new ApiError(400, `Unknown criterion: ${cs.criteriaName}`);
      if (cs.score < 0 || cs.score > criterion.weight) {
        throw new ApiError(400, `Score for ${cs.criteriaName} must be between 0 and ${criterion.weight}`);
      }
    }
  }

  for (const ev of evaluations) {
    const totalScore = ev.criteriaScores.reduce((sum, cs) => sum + cs.score, 0);

    await prisma.evaluation.upsert({
      where: {
        bidId_evaluatorId_evaluationType: {
          bidId: ev.bidId,
          evaluatorId,
          evaluationType: "TECHNICAL",
        },
      },
      create: {
        bidId: ev.bidId,
        evaluatorId,
        evaluationType: "TECHNICAL",
        criteriaScores: ev.criteriaScores as unknown as Prisma.JsonArray,
        totalScore,
        remarks: ev.remarks || null,
      },
      update: {
        criteriaScores: ev.criteriaScores as unknown as Prisma.JsonArray,
        totalScore,
        remarks: ev.remarks || null,
        evaluationDate: new Date(),
      },
    });
  }

  return { message: "Technical evaluation submitted" };
}

export async function getTechnicalEvaluationStatus(tenderId: number, userId: number, userRole: Role) {
  const tender = await prisma.tender.findUnique({ where: { id: tenderId } });
  if (!tender) throw new ApiError(404, "Tender not found");

  if (userRole === "PROCUREMENT_OFFICER" && tender.createdBy !== userId) {
    throw new ApiError(403, "Access denied");
  }
  if (userRole === "EVALUATOR") {
    const assigned = await prisma.evaluationCommitteeAssignment.findFirst({
      where: { tenderId, userId },
    });
    if (!assigned) throw new ApiError(403, "Access denied");
  }

  const committee = await prisma.evaluationCommitteeAssignment.findMany({
    where: { tenderId },
    include: { user: { select: { id: true, fullName: true } } },
  });
  const totalMembers = committee.length;

  const bids = await prisma.bid.findMany({
    where: { tenderId, status: { in: ["OPENED", "TECHNICALLY_QUALIFIED", "TECHNICALLY_DISQUALIFIED", "EVALUATED"] } },
    include: {
      bidOwner: { select: { fullName: true, bidderProfile: { select: { organizationName: true } } } },
      evaluations: {
        where: { evaluationType: "TECHNICAL" },
        include: { evaluator: { select: { id: true, fullName: true } } },
      },
      evaluationSummary: true,
    },
  });

  const evaluatorCompletions = new Map<number, boolean>();
  for (const m of committee) {
    const hasAllScores = bids.every((b) =>
      b.evaluations.some((e) => e.evaluatorId === m.userId)
    );
    evaluatorCompletions.set(m.userId, hasAllScores);
  }

  const completedMembers = [...evaluatorCompletions.values()].filter(Boolean).length;
  const isComplete = totalMembers > 0 && completedMembers === totalMembers;

  const bidResults = bids.map((b) => {
    const evaluatorScores = isComplete
      ? b.evaluations.map((e) => ({
          evaluatorName: e.evaluator.fullName,
          evaluatorId: e.evaluator.id,
          totalScore: e.totalScore,
        }))
      : [];

    const avgScore = isComplete && b.evaluations.length > 0
      ? b.evaluations.reduce((sum, e) => sum + e.totalScore, 0) / b.evaluations.length
      : null;

    return {
      bidId: b.id,
      bidderName: b.bidOwner.bidderProfile?.organizationName || b.bidOwner.fullName,
      evaluatorScores,
      avgScore,
      isQualified: b.evaluationSummary?.isTechnicallyQualified ?? null,
      status: b.status,
    };
  });

  return {
    totalMembers,
    completedMembers,
    isComplete,
    committeeMembers: committee.map((m) => ({
      id: m.userId,
      name: m.user.fullName,
      completed: evaluatorCompletions.get(m.userId) ?? false,
    })),
    bids: bidResults,
  };
}

export async function finalizeTechnicalEvaluation(tenderId: number, officerId: number) {
  const tender = await prisma.tender.findUnique({ where: { id: tenderId } });
  if (!tender) throw new ApiError(404, "Tender not found");
  if (tender.createdBy !== officerId) throw new ApiError(403, "Access denied");
  if (tender.status !== "UNDER_EVALUATION") throw new ApiError(400, "Tender must be under evaluation");

  const status = await getTechnicalEvaluationStatus(tenderId, officerId, "PROCUREMENT_OFFICER");
  if (!status.isComplete) throw new ApiError(400, "Not all evaluators have completed their evaluations");

  const bids = await prisma.bid.findMany({
    where: { tenderId, status: "OPENED" },
    include: {
      evaluations: { where: { evaluationType: "TECHNICAL" } },
    },
  });

  for (const bid of bids) {
    const avgTechnicalScore =
      bid.evaluations.reduce((sum, e) => sum + e.totalScore, 0) / bid.evaluations.length;
    const isQualified = avgTechnicalScore >= tender.minimumTechnicalScore;

    await prisma.bid.update({
      where: { id: bid.id },
      data: { status: isQualified ? "TECHNICALLY_QUALIFIED" : "TECHNICALLY_DISQUALIFIED" },
    });

    await prisma.evaluationSummary.upsert({
      where: { bidId: bid.id },
      create: {
        bidId: bid.id,
        tenderId,
        avgTechnicalScore,
        isTechnicallyQualified: isQualified,
      },
      update: {
        avgTechnicalScore,
        isTechnicallyQualified: isQualified,
      },
    });
  }

  const committee = await prisma.evaluationCommitteeAssignment.findMany({
    where: { tenderId },
    select: { userId: true },
  });
  if (committee.length > 0) {
    await prisma.notification.createMany({
      data: committee.map((m) => ({
        userId: m.userId,
        message: `Technical evaluation finalized for: ${tender.title}. Financial evaluation can begin.`,
        notificationType: "TECH_EVAL_FINALIZED",
        entityType: "Tender",
        entityId: tenderId,
      })),
    });
  }

  return { message: "Technical evaluation finalized" };
}

// ─── FINANCIAL EVALUATION ─────────────────────────────────────────────────────

export async function getFinancialEvaluationData(tenderId: number, userId: number, userRole: Role) {
  const tender = await prisma.tender.findUnique({ where: { id: tenderId } });
  if (!tender) throw new ApiError(404, "Tender not found");

  if (userRole === "PROCUREMENT_OFFICER" && tender.createdBy !== userId) {
    throw new ApiError(403, "Access denied");
  }
  if (userRole === "EVALUATOR") {
    const assigned = await prisma.evaluationCommitteeAssignment.findFirst({
      where: { tenderId, userId },
    });
    if (!assigned) throw new ApiError(403, "Access denied");
  }

  const hasFinalized = await prisma.evaluationSummary.findFirst({
    where: { tenderId, isTechnicallyQualified: true },
  });
  if (!hasFinalized) throw new ApiError(400, "Technical evaluation has not been finalized yet");

  const qualifiedBids = await prisma.bid.findMany({
    where: { tenderId, status: { in: ["TECHNICALLY_QUALIFIED", "EVALUATED"] } },
    include: {
      bidOwner: { select: { fullName: true, bidderProfile: { select: { organizationName: true } } } },
      evaluationSummary: true,
    },
    orderBy: { bidAmount: "asc" },
  });

  if (qualifiedBids.length === 0) {
    return {
      tender: { technicalWeight: tender.technicalWeight, financialWeight: tender.financialWeight },
      bids: [],
    };
  }

  const lowestBidAmount = Math.min(...qualifiedBids.map((b) => b.bidAmount));

  const ranked = qualifiedBids.map((b) => {
    const financialScore = (lowestBidAmount / b.bidAmount) * 100;
    const avgTechScore = b.evaluationSummary?.avgTechnicalScore ?? 0;
    const combinedScore =
      (tender.technicalWeight / 100) * avgTechScore +
      (tender.financialWeight / 100) * financialScore;

    return {
      bidId: b.id,
      bidderName: b.bidOwner.bidderProfile?.organizationName || b.bidOwner.fullName,
      avgTechnicalScore: avgTechScore,
      bidAmount: b.bidAmount,
      financialScore: Math.round(financialScore * 100) / 100,
      combinedScore: Math.round(combinedScore * 100) / 100,
      rank: 0,
    };
  });

  ranked.sort((a, b) => b.combinedScore - a.combinedScore);
  ranked.forEach((r, i) => { r.rank = i + 1; });

  for (const r of ranked) {
    await prisma.evaluationSummary.update({
      where: { bidId: r.bidId },
      data: {
        avgFinancialScore: r.financialScore,
        combinedScore: r.combinedScore,
        rank: r.rank,
      },
    });
  }

  return {
    tender: { technicalWeight: tender.technicalWeight, financialWeight: tender.financialWeight },
    bids: ranked,
  };
}

export async function finalizeFinancialEvaluation(tenderId: number, officerId: number) {
  const tender = await prisma.tender.findUnique({ where: { id: tenderId } });
  if (!tender) throw new ApiError(404, "Tender not found");
  if (tender.createdBy !== officerId) throw new ApiError(403, "Access denied");
  if (tender.status !== "UNDER_EVALUATION") throw new ApiError(400, "Tender must be under evaluation");

  const qualified = await prisma.bid.findMany({
    where: { tenderId, status: "TECHNICALLY_QUALIFIED" },
    include: { evaluationSummary: true },
  });

  if (qualified.length === 0) throw new ApiError(400, "No technically qualified bids to finalize");

  const hasAllScores = qualified.every((b) => b.evaluationSummary?.combinedScore != null);
  if (!hasAllScores) throw new ApiError(400, "Financial scores have not been calculated yet");

  await prisma.bid.updateMany({
    where: { tenderId, status: "TECHNICALLY_QUALIFIED" },
    data: { status: "EVALUATED" },
  });

  return { message: "Financial evaluation finalized" };
}

// ─── AWARD ────────────────────────────────────────────────────────────────────

export async function awardTender(tenderId: number, officerId: number, winningBidId: number) {
  const tender = await prisma.tender.findUnique({ where: { id: tenderId } });
  if (!tender) throw new ApiError(404, "Tender not found");
  if (tender.createdBy !== officerId) throw new ApiError(403, "Access denied");
  if (tender.status !== "UNDER_EVALUATION") throw new ApiError(400, "Tender must be under evaluation");

  const evaluatedBids = await prisma.bid.findMany({
    where: { tenderId, status: "EVALUATED" },
    include: { evaluationSummary: true },
  });
  if (evaluatedBids.length === 0) throw new ApiError(400, "Financial evaluation has not been finalized");

  const winningBid = evaluatedBids.find((b) => b.id === winningBidId);
  if (!winningBid) throw new ApiError(400, "Winning bid must be an evaluated bid for this tender");
  if (!winningBid.evaluationSummary || winningBid.evaluationSummary.rank !== 1) {
    throw new ApiError(400, "Winning bid must be the rank 1 bid");
  }

  await prisma.bid.update({
    where: { id: winningBidId },
    data: { status: "SELECTED" },
  });
  await prisma.evaluationSummary.update({
    where: { bidId: winningBidId },
    data: { isWinner: true },
  });

  const otherBidIds = evaluatedBids.filter((b) => b.id !== winningBidId).map((b) => b.id);
  if (otherBidIds.length > 0) {
    await prisma.bid.updateMany({
      where: { id: { in: otherBidIds } },
      data: { status: "NOT_SELECTED" },
    });
  }

  return prisma.tender.update({
    where: { id: tenderId },
    data: { status: "AWARDED" },
  });
}

export async function publishResults(tenderId: number, officerId: number) {
  const tender = await prisma.tender.findUnique({
    where: { id: tenderId },
    include: {
      bids: {
        include: { bidOwner: { select: { id: true } } },
      },
    },
  });
  if (!tender) throw new ApiError(404, "Tender not found");
  if (tender.createdBy !== officerId) throw new ApiError(403, "Access denied");
  if (tender.status !== "AWARDED") throw new ApiError(400, "Tender must be awarded first");

  const winnerBid = tender.bids.find((b) => b.status === "SELECTED");
  const loserBids = tender.bids.filter((b) => b.status === "NOT_SELECTED");

  const notifications = [];
  if (winnerBid) {
    notifications.push({
      userId: winnerBid.bidOwner.id,
      message: `Congratulations! Your bid for '${tender.title}' has been selected.`,
      notificationType: "BID_SELECTED",
      entityType: "Tender",
      entityId: tenderId,
    });
  }
  for (const b of loserBids) {
    notifications.push({
      userId: b.bidOwner.id,
      message: `The evaluation for '${tender.title}' is complete. Your bid was not selected. You may request a debriefing.`,
      notificationType: "BID_NOT_SELECTED",
      entityType: "Tender",
      entityId: tenderId,
    });
  }

  if (notifications.length > 0) {
    await prisma.notification.createMany({ data: notifications });
  }

  return { message: "Results published" };
}

export async function getTenderResults(tenderId: number, userId: number, userRole: Role) {
  const tender = await prisma.tender.findUnique({
    where: { id: tenderId },
    select: {
      id: true, title: true, status: true, createdBy: true,
      evaluationCriteria: true, technicalWeight: true, financialWeight: true,
      minimumTechnicalScore: true,
    },
  });
  if (!tender) throw new ApiError(404, "Tender not found");

  if (userRole === "BIDDER") {
    if (tender.status !== "AWARDED") throw new ApiError(400, "Results not available yet");

    const myBid = await prisma.bid.findFirst({
      where: { tenderId, bidderId: userId },
      include: { evaluationSummary: true },
    });

    const winnerBid = await prisma.bid.findFirst({
      where: { tenderId, status: "SELECTED" },
      include: {
        bidOwner: { select: { fullName: true, bidderProfile: { select: { organizationName: true } } } },
        evaluationSummary: true,
      },
    });

    const totalBids = await prisma.bid.count({ where: { tenderId } });

    return {
      tender: {
        title: tender.title,
        evaluationCriteria: tender.evaluationCriteria,
        technicalWeight: tender.technicalWeight,
        financialWeight: tender.financialWeight,
      },
      winner: winnerBid ? {
        bidderName: winnerBid.bidOwner.bidderProfile?.organizationName || winnerBid.bidOwner.fullName,
        bidAmount: winnerBid.bidAmount,
      } : null,
      myBid: myBid ? {
        bidId: myBid.id,
        status: myBid.status,
        bidAmount: myBid.bidAmount,
        avgTechnicalScore: myBid.evaluationSummary?.avgTechnicalScore ?? null,
        avgFinancialScore: myBid.evaluationSummary?.avgFinancialScore ?? null,
        combinedScore: myBid.evaluationSummary?.combinedScore ?? null,
        rank: myBid.evaluationSummary?.rank ?? null,
      } : null,
      totalBids,
    };
  }

  // Officer or Evaluator: full results
  if (userRole === "PROCUREMENT_OFFICER" && tender.createdBy !== userId) {
    throw new ApiError(403, "Access denied");
  }
  if (userRole === "EVALUATOR") {
    const assigned = await prisma.evaluationCommitteeAssignment.findFirst({
      where: { tenderId, userId },
    });
    if (!assigned) throw new ApiError(403, "Access denied");
  }

  const bids = await prisma.bid.findMany({
    where: { tenderId, status: { in: ["SELECTED", "NOT_SELECTED", "EVALUATED", "TECHNICALLY_QUALIFIED", "TECHNICALLY_DISQUALIFIED"] } },
    include: {
      bidOwner: { select: { fullName: true, bidderProfile: { select: { organizationName: true } } } },
      evaluationSummary: true,
      evaluations: {
        where: { evaluationType: "TECHNICAL" },
        include: { evaluator: { select: { fullName: true } } },
      },
    },
    orderBy: { bidAmount: "asc" },
  });

  return {
    tender: {
      title: tender.title,
      status: tender.status,
      evaluationCriteria: tender.evaluationCriteria,
      technicalWeight: tender.technicalWeight,
      financialWeight: tender.financialWeight,
    },
    bids: bids.map((b) => ({
      bidId: b.id,
      bidderName: b.bidOwner.bidderProfile?.organizationName || b.bidOwner.fullName,
      bidAmount: b.bidAmount,
      status: b.status,
      avgTechnicalScore: b.evaluationSummary?.avgTechnicalScore ?? null,
      avgFinancialScore: b.evaluationSummary?.avgFinancialScore ?? null,
      combinedScore: b.evaluationSummary?.combinedScore ?? null,
      rank: b.evaluationSummary?.rank ?? null,
      isWinner: b.evaluationSummary?.isWinner ?? false,
      evaluatorRemarks: b.evaluations.map((e) => ({
        evaluatorName: e.evaluator.fullName,
        remarks: e.remarks,
        totalScore: e.totalScore,
      })),
    })),
  };
}

// ─── EVALUATOR DASHBOARD ──────────────────────────────────────────────────────

export async function getEvaluatorAssignments(evaluatorId: number) {
  const assignments = await prisma.evaluationCommitteeAssignment.findMany({
    where: { userId: evaluatorId },
    include: {
      tender: {
        select: {
          id: true, title: true, category: true, status: true,
          submissionDeadline: true,
          _count: { select: { bids: true } },
        },
      },
    },
    orderBy: { assignedDate: "desc" },
  });

  const results = [];

  for (const a of assignments) {
    const myEvals = await prisma.evaluation.findMany({
      where: { evaluatorId, evaluationType: "TECHNICAL", bid: { tenderId: a.tenderId } },
      select: { bidId: true },
    });

    const totalBids = await prisma.bid.count({
      where: { tenderId: a.tenderId, status: { in: ["OPENED", "TECHNICALLY_QUALIFIED", "TECHNICALLY_DISQUALIFIED", "EVALUATED"] } },
    });

    const hasFinalized = await prisma.evaluationSummary.findFirst({
      where: { tenderId: a.tenderId, isTechnicallyQualified: true },
    });

    const allEvaluated = await prisma.bid.count({
      where: { tenderId: a.tenderId, status: "EVALUATED" },
    });

    let evalStatus: string;
    if (allEvaluated > 0) {
      evalStatus = "Evaluation Complete";
    } else if (hasFinalized) {
      evalStatus = "Financial Evaluation Available";
    } else if (myEvals.length > 0 && myEvals.length >= totalBids && totalBids > 0) {
      evalStatus = "Technical Submitted — Awaiting others";
    } else if (totalBids > 0) {
      evalStatus = "Pending Technical Evaluation";
    } else {
      evalStatus = "Awaiting Bid Opening";
    }

    results.push({
      ...a,
      evalStatus,
      myEvaluationsCount: myEvals.length,
      totalBids,
    });
  }

  return results;
}
