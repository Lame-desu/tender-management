import { Prisma, Role } from "@prisma/client";
import prisma from "../config/db";
import { ApiError } from "../utils/ApiError";

export async function getTenderSummary(
  officerId: number,
  filters: { status?: string; category?: string; startDate?: string; endDate?: string }
) {
  const where: Prisma.TenderWhereInput = { createdBy: officerId };
  if (filters.status) where.status = filters.status as Prisma.EnumTenderStatusFilter;
  if (filters.category) where.category = filters.category as Prisma.EnumTenderCategoryFilter;
  if (filters.startDate || filters.endDate) {
    where.createdAt = {};
    if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
    if (filters.endDate) where.createdAt.lte = new Date(filters.endDate + "T23:59:59Z");
  }

  const tenders = await prisma.tender.findMany({
    where,
    include: {
      createdUser: { select: { fullName: true } },
      _count: { select: { bids: true } },
      bids: {
        where: { status: "SELECTED" },
        include: { bidOwner: { select: { fullName: true, bidderProfile: { select: { organizationName: true } } } } },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const byStatus: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  for (const t of tenders) {
    byStatus[t.status] = (byStatus[t.status] || 0) + 1;
    byCategory[t.category] = (byCategory[t.category] || 0) + 1;
  }

  return {
    summary: { totalTenders: tenders.length, byStatus, byCategory },
    tenders: tenders.map((t) => {
      const winner = t.bids[0];
      return {
        id: t.id,
        title: t.title,
        category: t.category,
        status: t.status,
        publishDate: t.publishDate,
        submissionDeadline: t.submissionDeadline,
        totalBids: t._count.bids,
        winnerName: winner ? (winner.bidOwner.bidderProfile?.organizationName || winner.bidOwner.fullName) : null,
        winnerAmount: winner?.bidAmount ?? null,
        createdByName: t.createdUser.fullName,
      };
    }),
  };
}

export async function getBidEvaluationReport(tenderId: number, userId: number, userRole: Role) {
  const tender = await prisma.tender.findUnique({
    where: { id: tenderId },
    select: {
      id: true, title: true, category: true, status: true,
      publishDate: true, submissionDeadline: true,
      evaluationCriteria: true, minimumTechnicalScore: true,
      technicalWeight: true, financialWeight: true,
      createdBy: true,
    },
  });
  if (!tender) throw new ApiError(404, "Tender not found");

  if (userRole === "PROCUREMENT_OFFICER" && tender.createdBy !== userId) {
    throw new ApiError(403, "Access denied");
  }
  if (userRole === "EVALUATOR") {
    const assigned = await prisma.evaluationCommitteeAssignment.findFirst({ where: { tenderId, userId } });
    if (!assigned) throw new ApiError(403, "Access denied");
  }

  const committee = await prisma.evaluationCommitteeAssignment.findMany({
    where: { tenderId },
    include: { user: { select: { fullName: true, email: true } } },
  });

  const bids = await prisma.bid.findMany({
    where: { tenderId, status: { notIn: ["SUBMITTED"] } },
    include: {
      bidOwner: { select: { fullName: true, bidderProfile: { select: { organizationName: true } } } },
      evaluations: {
        where: { evaluationType: "TECHNICAL" },
        include: { evaluator: { select: { fullName: true } } },
      },
      evaluationSummary: true,
    },
    orderBy: { bidAmount: "asc" },
  });

  return {
    tender: {
      ...tender,
      evaluationCriteria: tender.evaluationCriteria as { name: string; weight: number }[],
    },
    committee: committee.map((c) => ({ name: c.user.fullName, email: c.user.email })),
    bids: bids.map((b) => ({
      bidId: b.id,
      bidderName: b.bidOwner.bidderProfile?.organizationName || b.bidOwner.fullName,
      bidAmount: b.bidAmount,
      status: b.status,
      technicalScores: b.evaluations.map((e) => ({
        evaluatorName: e.evaluator.fullName,
        criteriaScores: e.criteriaScores as { criteriaName: string; score: number }[],
        totalScore: e.totalScore,
        remarks: e.remarks,
      })),
      avgTechnicalScore: b.evaluationSummary?.avgTechnicalScore ?? null,
      isQualified: b.evaluationSummary?.isTechnicallyQualified ?? null,
      financialScore: b.evaluationSummary?.avgFinancialScore ?? null,
      combinedScore: b.evaluationSummary?.combinedScore ?? null,
      rank: b.evaluationSummary?.rank ?? null,
      isWinner: b.evaluationSummary?.isWinner ?? false,
    })),
  };
}

export async function getProcurementActivity(officerId: number, startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate + "T23:59:59Z");

  const tenders = await prisma.tender.findMany({
    where: { createdBy: officerId, createdAt: { gte: start, lte: end } },
    include: {
      _count: { select: { bids: true } },
      bids: {
        where: { status: "SELECTED" },
        include: { bidOwner: { select: { fullName: true, bidderProfile: { select: { organizationName: true } } } } },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const byStatus: Record<string, number> = {};
  let totalBidsReceived = 0;
  for (const t of tenders) {
    byStatus[t.status] = (byStatus[t.status] || 0) + 1;
    totalBidsReceived += t._count.bids;
  }

  return {
    period: { startDate, endDate },
    tendersCreated: tenders.length,
    tendersPublished: byStatus["PUBLISHED"] || 0,
    tendersAwarded: byStatus["AWARDED"] || 0,
    tendersCancelled: byStatus["CANCELLED"] || 0,
    totalBidsReceived,
    averageBidsPerTender: tenders.length > 0 ? Math.round((totalBidsReceived / tenders.length) * 10) / 10 : 0,
    tenders: tenders.map((t) => {
      const winner = t.bids[0];
      return {
        title: t.title,
        category: t.category,
        status: t.status,
        bidsCount: t._count.bids,
        awardedTo: winner ? (winner.bidOwner.bidderProfile?.organizationName || winner.bidOwner.fullName) : null,
        awardAmount: winner?.bidAmount ?? null,
      };
    }),
  };
}

export async function getBidderParticipation(
  officerId: number,
  filters: { startDate?: string; endDate?: string; tenderId?: number }
) {
  const bidWhere: Prisma.BidWhereInput = {
    tender: { createdBy: officerId },
  };
  if (filters.tenderId) bidWhere.tenderId = filters.tenderId;
  if (filters.startDate || filters.endDate) {
    bidWhere.submissionDate = {};
    if (filters.startDate) bidWhere.submissionDate.gte = new Date(filters.startDate);
    if (filters.endDate) bidWhere.submissionDate.lte = new Date(filters.endDate + "T23:59:59Z");
  }

  const bids = await prisma.bid.findMany({
    where: bidWhere,
    include: {
      bidOwner: {
        select: { id: true, fullName: true, bidderProfile: { select: { organizationName: true, bidderType: true } } },
      },
      tender: { select: { title: true } },
    },
    orderBy: { submissionDate: "desc" },
  });

  const bidderMap = new Map<number, {
    bidderName: string; bidderType: string; totalBids: number; wonBids: number;
    tenders: { tenderTitle: string; bidAmount: number; status: string }[];
  }>();

  for (const b of bids) {
    const id = b.bidOwner.id;
    if (!bidderMap.has(id)) {
      bidderMap.set(id, {
        bidderName: b.bidOwner.bidderProfile?.organizationName || b.bidOwner.fullName,
        bidderType: b.bidOwner.bidderProfile?.bidderType || "INDIVIDUAL",
        totalBids: 0,
        wonBids: 0,
        tenders: [],
      });
    }
    const entry = bidderMap.get(id)!;
    entry.totalBids++;
    if (b.status === "SELECTED") entry.wonBids++;
    entry.tenders.push({
      tenderTitle: b.tender.title,
      bidAmount: b.bidAmount,
      status: b.status,
    });
  }

  return { bidders: [...bidderMap.values()] };
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
    const assigned = await prisma.evaluationCommitteeAssignment.findFirst({ where: { tenderId, userId } });
    if (!assigned) throw new ApiError(403, "Access denied");
  }

  const openingLog = await prisma.auditLog.findFirst({
    where: { action: "Opened bids for tender", entityType: "Tender", entityId: tenderId },
    orderBy: { timestamp: "desc" },
  });

  return {
    tenderTitle: tender.title,
    openingDate: openingLog?.timestamp || null,
    totalBids: tender.bids.length,
    bids: tender.bids.map((b) => ({
      bidderName: b.bidOwner.bidderProfile?.organizationName || b.bidOwner.fullName,
      bidAmount: b.bidAmount,
      bidSecurityProvided: !!b.bidSecurityInfo,
      submissionDate: b.submissionDate,
      documentCount: b._count.documents,
    })),
  };
}

export async function getAuditTrail(
  filters: { startDate?: string; endDate?: string; userId?: number; action?: string },
  page: number,
  limit: number
) {
  const where: Prisma.AuditLogWhereInput = {};
  if (filters.userId) where.performedBy = filters.userId;
  if (filters.action) where.action = { contains: filters.action, mode: "insensitive" };
  if (filters.startDate || filters.endDate) {
    where.timestamp = {};
    if (filters.startDate) where.timestamp.gte = new Date(filters.startDate);
    if (filters.endDate) where.timestamp.lte = new Date(filters.endDate + "T23:59:59Z");
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { performedUser: { select: { fullName: true } } },
      orderBy: { timestamp: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs: logs.map((l) => ({
      id: l.id,
      timestamp: l.timestamp,
      userName: l.performedUser.fullName,
      action: l.action,
      entityType: l.entityType,
      entityId: l.entityId,
      details: l.details,
      ipAddress: l.ipAddress,
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}
