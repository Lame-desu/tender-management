import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as debriefingService from "../services/debriefing.service";
import prisma from "../config/db";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";

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

export async function requestDebriefing(req: Request, res: Response, next: NextFunction) {
  try {
    const bidId = parseInt(req.params.bidId, 10);
    if (isNaN(bidId)) throw new ApiError(400, "Invalid bid ID");

    const request = await debriefingService.requestDebriefing(bidId, req.user!.id);
    await audit(req, "Requested debriefing", "DebriefingRequest", request.id);

    return ApiResponse.created(res, "Debriefing requested", { request });
  } catch (err) { next(err); }
}

export async function listDebriefings(req: Request, res: Response, next: NextFunction) {
  try {
    const debriefings = await debriefingService.listDebriefings(req.user!.id, req.user!.role);
    return ApiResponse.success(res, "Debriefings retrieved", { debriefings });
  } catch (err) { next(err); }
}

const respondSchema = z.object({
  response: z.string().min(1, "Response is required"),
});

export async function respondToDebriefing(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new ApiError(400, "Invalid debriefing ID");

    const parsed = respondSchema.safeParse(req.body);
    if (!parsed.success) throw new ApiError(400, parsed.error.errors[0]?.message || "Validation failed");

    const updated = await debriefingService.respondToDebriefing(id, req.user!.id, parsed.data.response);
    await audit(req, "Responded to debriefing", "DebriefingRequest", id);

    return ApiResponse.success(res, "Debriefing response sent", { debriefing: updated });
  } catch (err) { next(err); }
}
