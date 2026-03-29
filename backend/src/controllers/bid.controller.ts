import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as bidService from "../services/bid.service";
import prisma from "../config/db";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { parsePaginationQuery } from "../utils/helpers";

const bidSchema = z.object({
  technicalProposal: z.string().min(1, "Technical proposal is required"),
  bidAmount: z.coerce.number().positive("Bid amount must be positive"),
  bidSecurityInfo: z.string().optional(),
});

function audit(req: Request, action: string, entityType: string, entityId?: number) {
  return prisma.auditLog.create({
    data: {
      action,
      entityType,
      entityId,
      performedBy: req.user!.id,
      ipAddress: req.ip || req.socket.remoteAddress || undefined,
    },
  });
}

export async function submitBid(req: Request, res: Response, next: NextFunction) {
  try {
    const tenderId = parseInt(req.params.tenderId, 10);
    if (isNaN(tenderId)) throw new ApiError(400, "Invalid tender ID");

    const parsed = bidSchema.safeParse(req.body);
    if (!parsed.success) throw new ApiError(400, parsed.error.errors[0]?.message || "Validation failed");

    const files = req.files as { [field: string]: Express.Multer.File[] } | undefined;
    const technicalDocs = files?.technicalDocs || [];
    const otherDocs = files?.otherDocs || [];

    const bid = await bidService.submitBid(tenderId, req.user!.id, parsed.data, technicalDocs, otherDocs);
    await audit(req, "Submitted bid", "Bid", bid?.id);

    return ApiResponse.created(res, "Bid submitted successfully", { bid });
  } catch (err) { next(err); }
}

export async function getMyBids(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit } = parsePaginationQuery(req.query as Record<string, string>);
    const result = await bidService.getMyBids(req.user!.id, page, limit);
    return ApiResponse.success(res, "Bids retrieved", result);
  } catch (err) { next(err); }
}

export async function getBidDetail(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new ApiError(400, "Invalid bid ID");

    const bid = await bidService.getBidDetail(id, req.user!.id, req.user!.role);
    return ApiResponse.success(res, "Bid retrieved", { bid });
  } catch (err) { next(err); }
}

export async function listBidsForTender(req: Request, res: Response, next: NextFunction) {
  try {
    const tenderId = parseInt(req.params.tenderId, 10);
    if (isNaN(tenderId)) throw new ApiError(400, "Invalid tender ID");

    const { page, limit } = parsePaginationQuery(req.query as Record<string, string>);
    const result = await bidService.listBidsForTender(tenderId, req.user!.id, page, limit);
    return ApiResponse.success(res, "Bids retrieved", result);
  } catch (err) { next(err); }
}

export async function downloadFile(req: Request, res: Response, next: NextFunction) {
  try {
    const documentId = parseInt(req.params.documentId, 10);
    if (isNaN(documentId)) throw new ApiError(400, "Invalid document ID");

    const doc = await bidService.getFileDocument(documentId, req.user!.id, req.user!.role);

    res.download(doc.filePath, doc.fileName, (err) => {
      if (err && !res.headersSent) {
        return res.status(500).json({ success: false, message: "File download failed" });
      }
    });
  } catch (err) { next(err); }
}

export async function getBidderStats(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await bidService.getBidderStats(req.user!.id);
    return ApiResponse.success(res, "Stats retrieved", stats);
  } catch (err) { next(err); }
}

export async function checkExistingBid(req: Request, res: Response, next: NextFunction) {
  try {
    const tenderId = parseInt(req.params.tenderId, 10);
    if (isNaN(tenderId)) throw new ApiError(400, "Invalid tender ID");

    const bid = await bidService.checkExistingBid(tenderId, req.user!.id);
    return ApiResponse.success(res, "Check complete", { exists: !!bid, bidId: bid?.id || null });
  } catch (err) { next(err); }
}
