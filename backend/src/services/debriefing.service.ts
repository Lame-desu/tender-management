import { Role } from "@prisma/client";
import prisma from "../config/db";
import { ApiError } from "../utils/ApiError";

export async function requestDebriefing(bidId: number, bidderId: number) {
  const bid = await prisma.bid.findUnique({
    where: { id: bidId },
    include: { tender: { select: { id: true, title: true, createdBy: true } } },
  });
  if (!bid) throw new ApiError(404, "Bid not found");
  if (bid.bidderId !== bidderId) throw new ApiError(403, "Access denied");
  if (bid.status !== "NOT_SELECTED") throw new ApiError(400, "Debriefing can only be requested for non-selected bids");

  const existing = await prisma.debriefingRequest.findUnique({ where: { bidId } });
  if (existing) throw new ApiError(400, "A debriefing request already exists for this bid");

  const bidder = await prisma.user.findUnique({
    where: { id: bidderId },
    include: { bidderProfile: true },
  });
  const bidderName = bidder?.bidderProfile?.organizationName || bidder?.fullName || "A bidder";

  const request = await prisma.debriefingRequest.create({
    data: { bidId, bidderId },
  });

  await prisma.notification.create({
    data: {
      userId: bid.tender.createdBy,
      message: `Debriefing requested for '${bid.tender.title}' by ${bidderName}`,
      notificationType: "DEBRIEFING_REQUESTED",
      entityType: "DebriefingRequest",
      entityId: request.id,
    },
  });

  return request;
}

export async function listDebriefings(userId: number, userRole: Role) {
  if (userRole === "PROCUREMENT_OFFICER") {
    return prisma.debriefingRequest.findMany({
      where: { bid: { tender: { createdBy: userId } } },
      include: {
        bid: {
          include: {
            tender: { select: { id: true, title: true } },
            bidOwner: { select: { fullName: true, bidderProfile: { select: { organizationName: true } } } },
            evaluationSummary: {
              select: { avgTechnicalScore: true, avgFinancialScore: true, combinedScore: true, rank: true },
            },
          },
        },
        respondedUser: { select: { fullName: true } },
      },
      orderBy: { requestDate: "desc" },
    });
  }

  if (userRole === "BIDDER") {
    return prisma.debriefingRequest.findMany({
      where: { bidderId: userId },
      include: {
        bid: {
          include: {
            tender: { select: { id: true, title: true } },
            bidOwner: { select: { fullName: true, bidderProfile: { select: { organizationName: true } } } },
            evaluationSummary: {
              select: { avgTechnicalScore: true, avgFinancialScore: true, combinedScore: true, rank: true },
            },
          },
        },
        respondedUser: { select: { fullName: true } },
      },
      orderBy: { requestDate: "desc" },
    });
  }

  throw new ApiError(403, "Access denied");
}

export async function respondToDebriefing(debriefingId: number, officerId: number, response: string) {
  const request = await prisma.debriefingRequest.findUnique({
    where: { id: debriefingId },
    include: {
      bid: { include: { tender: { select: { title: true, createdBy: true } } } },
    },
  });
  if (!request) throw new ApiError(404, "Debriefing request not found");
  if (request.bid.tender.createdBy !== officerId) throw new ApiError(403, "Access denied");
  if (request.response) throw new ApiError(400, "This debriefing has already been responded to");

  const updated = await prisma.debriefingRequest.update({
    where: { id: debriefingId },
    data: {
      response,
      respondedBy: officerId,
      respondedDate: new Date(),
    },
  });

  await prisma.notification.create({
    data: {
      userId: request.bidderId,
      message: `Your debriefing request for '${request.bid.tender.title}' has been answered.`,
      notificationType: "DEBRIEFING_RESPONDED",
      entityType: "DebriefingRequest",
      entityId: debriefingId,
    },
  });

  return updated;
}
