import { Prisma, TenderStatus, TenderCategory, Role } from "@prisma/client";
import prisma from "../config/db";
import { ApiError } from "../utils/ApiError";

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface CreateTenderInput {
  title: string;
  description: string;
  category: TenderCategory;
  eligibilityCriteria: string;
  requiredDocuments: string[];
  evaluationCriteria: { name: string; weight: number }[];
  minimumTechnicalScore: number;
  technicalWeight: number;
  financialWeight: number;
  bidSecurityRequired: boolean;
  bidSecurityAmount?: number;
  clarificationDeadline: string;
  submissionDeadline: string;
}

export interface ListTendersParams {
  userId: number;
  userRole: Role;
  status?: TenderStatus;
  category?: TenderCategory;
  search?: string;
  page: number;
  limit: number;
}

// ─── CREATE ───────────────────────────────────────────────────────────────────

export async function createTender(input: CreateTenderInput, userId: number) {
  return prisma.tender.create({
    data: {
      title: input.title,
      description: input.description,
      category: input.category,
      eligibilityCriteria: input.eligibilityCriteria,
      requiredDocuments: input.requiredDocuments,
      evaluationCriteria: input.evaluationCriteria as unknown as Prisma.JsonArray,
      minimumTechnicalScore: input.minimumTechnicalScore,
      technicalWeight: input.technicalWeight,
      financialWeight: input.financialWeight,
      bidSecurityRequired: input.bidSecurityRequired,
      bidSecurityAmount: input.bidSecurityAmount ?? null,
      clarificationDeadline: new Date(input.clarificationDeadline),
      submissionDeadline: new Date(input.submissionDeadline),
      status: "DRAFT",
      createdBy: userId,
    },
    include: { createdUser: { select: { id: true, fullName: true } } },
  });
}

// ─── LIST ─────────────────────────────────────────────────────────────────────

export async function listTenders(params: ListTendersParams) {
  const { userId, userRole, status, category, search, page, limit } = params;

  const where: Prisma.TenderWhereInput = {};

  if (userRole === "PROCUREMENT_OFFICER") {
    where.createdBy = userId;
  } else if (userRole === "BIDDER") {
    where.status = { in: ["PUBLISHED", "UNDER_EVALUATION", "AWARDED"] };
  } else if (userRole === "EVALUATOR") {
    where.committeeAssignments = { some: { userId } };
  }
  // ADMIN sees all

  if (status) where.status = status;
  if (category) where.category = category;
  if (search) where.title = { contains: search, mode: "insensitive" };

  const [tenders, total] = await Promise.all([
    prisma.tender.findMany({
      where,
      include: {
        createdUser: { select: { id: true, fullName: true } },
        _count: { select: { bids: true, addenda: true, clarifications: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.tender.count({ where }),
  ]);

  const enriched = tenders.map((t) => ({
    ...t,
    isExpired: t.status === "PUBLISHED" && new Date() > t.submissionDeadline,
  }));

  return { tenders: enriched, total, page, totalPages: Math.ceil(total / limit) };
}

// ─── GET DETAIL ───────────────────────────────────────────────────────────────

export async function getTenderDetail(tenderId: number, userId: number, userRole: Role) {
  const tender = await prisma.tender.findUnique({
    where: { id: tenderId },
    include: {
      createdUser: { select: { id: true, fullName: true } },
      addenda: { orderBy: { addendumNumber: "asc" }, include: { issuedUser: { select: { fullName: true } } } },
      clarifications: {
        orderBy: { askedDate: "desc" },
        include: {
          askedUser: { select: { id: true, fullName: true } },
          answeredUser: { select: { fullName: true } },
        },
      },
      _count: { select: { bids: true, addenda: true, clarifications: true } },
    },
  });

  if (!tender) throw new ApiError(404, "Tender not found");

  // Access control
  if (userRole === "PROCUREMENT_OFFICER" && tender.createdBy !== userId) {
    throw new ApiError(403, "Access denied");
  }
  if (userRole === "BIDDER" && tender.status === "DRAFT") {
    throw new ApiError(403, "Access denied");
  }
  if (userRole === "EVALUATOR") {
    const assigned = await prisma.evaluationCommitteeAssignment.findFirst({
      where: { tenderId, userId },
    });
    if (!assigned) throw new ApiError(403, "Access denied");
  }

  // Hide clarification asker identity for bidders
  if (userRole === "BIDDER") {
    tender.clarifications = tender.clarifications.map((c) => ({
      ...c,
      askedUser: { id: 0, fullName: "Anonymous Bidder" },
      askedBy: 0,
    }));
  }

  return tender;
}

// ─── UPDATE (DRAFT ONLY) ─────────────────────────────────────────────────────

export async function updateTender(tenderId: number, input: CreateTenderInput, userId: number) {
  const tender = await prisma.tender.findUnique({ where: { id: tenderId } });
  if (!tender) throw new ApiError(404, "Tender not found");
  if (tender.createdBy !== userId) throw new ApiError(403, "Access denied");
  if (tender.status !== "DRAFT") throw new ApiError(400, "Only draft tenders can be edited");

  return prisma.tender.update({
    where: { id: tenderId },
    data: {
      title: input.title,
      description: input.description,
      category: input.category,
      eligibilityCriteria: input.eligibilityCriteria,
      requiredDocuments: input.requiredDocuments,
      evaluationCriteria: input.evaluationCriteria as unknown as Prisma.JsonArray,
      minimumTechnicalScore: input.minimumTechnicalScore,
      technicalWeight: input.technicalWeight,
      financialWeight: input.financialWeight,
      bidSecurityRequired: input.bidSecurityRequired,
      bidSecurityAmount: input.bidSecurityAmount ?? null,
      clarificationDeadline: new Date(input.clarificationDeadline),
      submissionDeadline: new Date(input.submissionDeadline),
    },
    include: { createdUser: { select: { id: true, fullName: true } } },
  });
}

// ─── PUBLISH ──────────────────────────────────────────────────────────────────

export async function publishTender(tenderId: number, userId: number) {
  const tender = await prisma.tender.findUnique({ where: { id: tenderId } });
  if (!tender) throw new ApiError(404, "Tender not found");
  if (tender.createdBy !== userId) throw new ApiError(403, "Access denied");
  if (tender.status !== "DRAFT") throw new ApiError(400, "Only draft tenders can be published");

  const updated = await prisma.tender.update({
    where: { id: tenderId },
    data: { status: "PUBLISHED", publishDate: new Date() },
  });

  // Notify all active bidders
  const bidders = await prisma.user.findMany({
    where: { role: "BIDDER", status: "ACTIVE" },
    select: { id: true },
  });
  if (bidders.length > 0) {
    await prisma.notification.createMany({
      data: bidders.map((b) => ({
        userId: b.id,
        message: `New tender published: ${tender.title}`,
        notificationType: "TENDER_PUBLISHED",
        entityType: "Tender",
        entityId: tenderId,
      })),
    });
  }

  return updated;
}

// ─── CANCEL ───────────────────────────────────────────────────────────────────

export async function cancelTender(tenderId: number, userId: number) {
  const tender = await prisma.tender.findUnique({
    where: { id: tenderId },
    include: { bids: { select: { bidderId: true } } },
  });
  if (!tender) throw new ApiError(404, "Tender not found");
  if (tender.createdBy !== userId) throw new ApiError(403, "Access denied");
  if (!["DRAFT", "PUBLISHED"].includes(tender.status)) {
    throw new ApiError(400, "Only draft or published tenders can be cancelled");
  }

  const updated = await prisma.tender.update({
    where: { id: tenderId },
    data: { status: "CANCELLED" },
  });

  // Notify bidders who submitted bids
  if (tender.status === "PUBLISHED" && tender.bids.length > 0) {
    await prisma.notification.createMany({
      data: tender.bids.map((b) => ({
        userId: b.bidderId,
        message: `Tender cancelled: ${tender.title}`,
        notificationType: "TENDER_CANCELLED",
        entityType: "Tender",
        entityId: tenderId,
      })),
    });
  }

  return updated;
}

// ─── ADDENDUM ─────────────────────────────────────────────────────────────────

export async function issueAddendum(
  tenderId: number,
  userId: number,
  description: string,
  newDeadline?: string
) {
  const tender = await prisma.tender.findUnique({ where: { id: tenderId } });
  if (!tender) throw new ApiError(404, "Tender not found");
  if (tender.createdBy !== userId) throw new ApiError(403, "Access denied");
  if (tender.status !== "PUBLISHED") throw new ApiError(400, "Addenda can only be issued for published tenders");

  // Get next addendum number
  const lastAddendum = await prisma.tenderAddendum.findFirst({
    where: { tenderId },
    orderBy: { addendumNumber: "desc" },
  });
  const addendumNumber = (lastAddendum?.addendumNumber ?? 0) + 1;

  const parsedDeadline = newDeadline ? new Date(newDeadline) : null;

  const addendum = await prisma.tenderAddendum.create({
    data: {
      tenderId,
      addendumNumber,
      description,
      newDeadline: parsedDeadline,
      issuedBy: userId,
    },
    include: { issuedUser: { select: { fullName: true } } },
  });

  // Update submission deadline if new one is later
  if (parsedDeadline && parsedDeadline > tender.submissionDeadline) {
    await prisma.tender.update({
      where: { id: tenderId },
      data: { submissionDeadline: parsedDeadline },
    });
  }

  // Notify all active bidders
  const bidders = await prisma.user.findMany({
    where: { role: "BIDDER", status: "ACTIVE" },
    select: { id: true },
  });
  if (bidders.length > 0) {
    await prisma.notification.createMany({
      data: bidders.map((b) => ({
        userId: b.id,
        message: `Addendum #${addendumNumber} issued for: ${tender.title}`,
        notificationType: "ADDENDUM_ISSUED",
        entityType: "Tender",
        entityId: tenderId,
      })),
    });
  }

  return addendum;
}

export async function listAddenda(tenderId: number) {
  return prisma.tenderAddendum.findMany({
    where: { tenderId },
    orderBy: { addendumNumber: "asc" },
    include: { issuedUser: { select: { fullName: true } } },
  });
}

// ─── CLARIFICATIONS ───────────────────────────────────────────────────────────

export async function askClarification(tenderId: number, userId: number, question: string) {
  const tender = await prisma.tender.findUnique({ where: { id: tenderId } });
  if (!tender) throw new ApiError(404, "Tender not found");
  if (tender.status !== "PUBLISHED") throw new ApiError(400, "Tender is not open for clarifications");
  if (new Date() > tender.clarificationDeadline) {
    throw new ApiError(400, "Clarification period has ended");
  }

  const clarification = await prisma.clarification.create({
    data: { tenderId, question, askedBy: userId },
  });

  // Notify the tender's officer
  await prisma.notification.create({
    data: {
      userId: tender.createdBy,
      message: `New clarification question on: ${tender.title}`,
      notificationType: "CLARIFICATION_ASKED",
      entityType: "Tender",
      entityId: tenderId,
    },
  });

  return clarification;
}

export async function answerClarification(clarificationId: number, userId: number, answer: string) {
  const clarification = await prisma.clarification.findUnique({
    where: { id: clarificationId },
    include: { tender: true },
  });
  if (!clarification) throw new ApiError(404, "Clarification not found");
  if (clarification.tender.createdBy !== userId) throw new ApiError(403, "Access denied");

  const updated = await prisma.clarification.update({
    where: { id: clarificationId },
    data: { answer, answeredBy: userId, answeredDate: new Date() },
    include: {
      askedUser: { select: { id: true, fullName: true } },
      answeredUser: { select: { fullName: true } },
    },
  });

  // Notify all active bidders
  const bidders = await prisma.user.findMany({
    where: { role: "BIDDER", status: "ACTIVE" },
    select: { id: true },
  });
  if (bidders.length > 0) {
    await prisma.notification.createMany({
      data: bidders.map((b) => ({
        userId: b.id,
        message: `Clarification answered on: ${clarification.tender.title}`,
        notificationType: "CLARIFICATION_ANSWERED",
        entityType: "Tender",
        entityId: clarification.tenderId,
      })),
    });
  }

  return updated;
}

export async function listClarifications(tenderId: number, userRole: Role) {
  const clarifications = await prisma.clarification.findMany({
    where: { tenderId },
    orderBy: { askedDate: "desc" },
    include: {
      askedUser: { select: { id: true, fullName: true } },
      answeredUser: { select: { fullName: true } },
    },
  });

  if (userRole === "BIDDER") {
    return clarifications.map((c) => ({
      ...c,
      askedUser: { id: 0, fullName: "Anonymous Bidder" },
      askedBy: 0,
    }));
  }

  return clarifications;
}

// ─── OFFICER STATS ────────────────────────────────────────────────────────────

export async function getOfficerStats(userId: number) {
  const counts = await prisma.tender.groupBy({
    by: ["status"],
    where: { createdBy: userId },
    _count: { id: true },
  });

  const statusMap: Record<string, number> = {};
  let total = 0;
  for (const c of counts) {
    statusMap[c.status] = c._count.id;
    total += c._count.id;
  }

  const recentTenders = await prisma.tender.findMany({
    where: { createdBy: userId },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { _count: { select: { bids: true } } },
  });

  return { total, byStatus: statusMap, recentTenders };
}
