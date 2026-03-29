import { DocumentCategory, Role } from "@prisma/client";
import prisma from "../config/db";
import { ApiError } from "../utils/ApiError";
import { moveBidFiles } from "../middleware/upload";

export interface SubmitBidInput {
  technicalProposal: string;
  bidAmount: number;
  bidSecurityInfo?: string;
}

export async function submitBid(
  tenderId: number,
  bidderId: number,
  input: SubmitBidInput,
  technicalDocs: Express.Multer.File[],
  otherDocs: Express.Multer.File[]
) {
  const tender = await prisma.tender.findUnique({ where: { id: tenderId } });
  if (!tender) throw new ApiError(404, "Tender not found");
  if (tender.status !== "PUBLISHED") throw new ApiError(400, "Tender is not open for bids");
  if (new Date() > tender.submissionDeadline) throw new ApiError(400, "Submission deadline has passed");

  const existing = await prisma.bid.findUnique({
    where: { tenderId_bidderId: { tenderId, bidderId } },
  });
  if (existing) throw new ApiError(400, "You have already submitted a bid for this tender");

  if (input.bidAmount <= 0) throw new ApiError(400, "Bid amount must be positive");
  if (!input.technicalProposal.trim()) throw new ApiError(400, "Technical proposal is required");
  if (tender.bidSecurityRequired && !input.bidSecurityInfo?.trim()) {
    throw new ApiError(400, "Bid security information is required for this tender");
  }
  if (!technicalDocs.length) throw new ApiError(400, "At least one technical document is required");

  const bid = await prisma.bid.create({
    data: {
      tenderId,
      bidderId,
      technicalProposal: input.technicalProposal,
      bidAmount: input.bidAmount,
      bidSecurityInfo: input.bidSecurityInfo || null,
      status: "SUBMITTED",
    },
  });

  const movedTechnical = moveBidFiles(bid.id, technicalDocs);
  const movedOther = moveBidFiles(bid.id, otherDocs);

  const docRecords = [
    ...movedTechnical.map((f) => ({
      bidId: bid.id,
      fileName: f.originalname,
      fileType: f.mimetype,
      filePath: f.path,
      fileSize: f.size,
      documentCategory: "TECHNICAL" as DocumentCategory,
    })),
    ...movedOther.map((f) => ({
      bidId: bid.id,
      fileName: f.originalname,
      fileType: f.mimetype,
      filePath: f.path,
      fileSize: f.size,
      documentCategory: "OTHER" as DocumentCategory,
    })),
  ];

  if (docRecords.length > 0) {
    await prisma.bidDocument.createMany({ data: docRecords });
  }

  const bidder = await prisma.user.findUnique({
    where: { id: bidderId },
    include: { bidderProfile: true },
  });
  const bidderName = bidder?.bidderProfile?.organizationName || bidder?.fullName || "A bidder";

  await prisma.notification.createMany({
    data: [
      {
        userId: tender.createdBy,
        message: `New bid submitted for: ${tender.title} by ${bidderName}`,
        notificationType: "BID_SUBMITTED",
        entityType: "Bid",
        entityId: bid.id,
      },
      {
        userId: bidderId,
        message: `Your bid for ${tender.title} has been submitted successfully`,
        notificationType: "BID_SUBMITTED",
        entityType: "Bid",
        entityId: bid.id,
      },
    ],
  });

  return prisma.bid.findUnique({
    where: { id: bid.id },
    include: {
      documents: true,
      tender: { select: { id: true, title: true } },
    },
  });
}

export async function getMyBids(bidderId: number, page: number, limit: number) {
  const where = { bidderId };

  const [bids, total] = await Promise.all([
    prisma.bid.findMany({
      where,
      include: {
        tender: {
          select: { id: true, title: true, category: true, status: true, submissionDeadline: true },
        },
        _count: { select: { documents: true } },
      },
      orderBy: { submissionDate: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.bid.count({ where }),
  ]);

  return { bids, total, page, totalPages: Math.ceil(total / limit) };
}

export async function getBidDetail(bidId: number, userId: number, userRole: Role) {
  const bid = await prisma.bid.findUnique({
    where: { id: bidId },
    include: {
      documents: true,
      tender: {
        select: {
          id: true, title: true, category: true, status: true,
          createdBy: true, submissionDeadline: true,
          bidSecurityRequired: true, bidSecurityAmount: true,
        },
      },
      bidOwner: { select: { id: true, fullName: true, bidderProfile: { select: { organizationName: true } } } },
      evaluationSummary: true,
    },
  });

  if (!bid) throw new ApiError(404, "Bid not found");

  if (userRole === "BIDDER" && bid.bidderId !== userId) {
    throw new ApiError(403, "Access denied");
  }
  if (userRole === "PROCUREMENT_OFFICER" && bid.tender.createdBy !== userId) {
    throw new ApiError(403, "Access denied");
  }
  if (userRole === "EVALUATOR") {
    const assigned = await prisma.evaluationCommitteeAssignment.findFirst({
      where: { tenderId: bid.tenderId, userId },
    });
    if (!assigned) throw new ApiError(403, "Access denied");
  }

  return bid;
}

export async function listBidsForTender(tenderId: number, officerId: number, page: number, limit: number) {
  const tender = await prisma.tender.findUnique({ where: { id: tenderId } });
  if (!tender) throw new ApiError(404, "Tender not found");
  if (tender.createdBy !== officerId) throw new ApiError(403, "Access denied");

  const where = { tenderId };

  const [bids, total] = await Promise.all([
    prisma.bid.findMany({
      where,
      include: {
        bidOwner: {
          select: { id: true, fullName: true, bidderProfile: { select: { organizationName: true } } },
        },
        _count: { select: { documents: true } },
      },
      orderBy: { submissionDate: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.bid.count({ where }),
  ]);

  return { bids, total, page, totalPages: Math.ceil(total / limit) };
}

export async function getBidderStats(bidderId: number) {
  const [activeTenders, totalBids, wonBids, recentTenders, recentBids] = await Promise.all([
    prisma.tender.count({ where: { status: "PUBLISHED" } }),
    prisma.bid.count({ where: { bidderId } }),
    prisma.bid.count({ where: { bidderId, status: "SELECTED" } }),
    prisma.tender.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishDate: "desc" },
      take: 5,
      include: {
        _count: { select: { bids: true, addenda: true } },
      },
    }),
    prisma.bid.findMany({
      where: { bidderId },
      orderBy: { submissionDate: "desc" },
      take: 5,
      include: {
        tender: { select: { id: true, title: true, category: true, status: true } },
      },
    }),
  ]);

  const pendingResults = await prisma.bid.count({
    where: { bidderId, status: { in: ["SUBMITTED", "OPENED", "TECHNICALLY_QUALIFIED", "EVALUATED"] } },
  });

  return { activeTenders, totalBids, pendingResults, wonBids, recentTenders, recentBids };
}

export async function getFileDocument(documentId: number, userId: number, userRole: Role) {
  const doc = await prisma.bidDocument.findUnique({
    where: { id: documentId },
    include: {
      bid: {
        select: {
          bidderId: true,
          tender: { select: { createdBy: true, id: true } },
        },
      },
    },
  });

  if (!doc) throw new ApiError(404, "Document not found");

  const isOwner = doc.bid.bidderId === userId;
  const isOfficer = userRole === "PROCUREMENT_OFFICER" && doc.bid.tender.createdBy === userId;
  const isAdmin = userRole === "ADMIN";

  let isEvaluator = false;
  if (userRole === "EVALUATOR") {
    const assigned = await prisma.evaluationCommitteeAssignment.findFirst({
      where: { tenderId: doc.bid.tender.id, userId },
    });
    isEvaluator = !!assigned;
  }

  if (!isOwner && !isOfficer && !isAdmin && !isEvaluator) {
    throw new ApiError(403, "Access denied");
  }

  return doc;
}

export async function checkExistingBid(tenderId: number, bidderId: number) {
  return prisma.bid.findUnique({
    where: { tenderId_bidderId: { tenderId, bidderId } },
    select: { id: true },
  });
}
