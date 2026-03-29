import { Request, Response, NextFunction } from "express";
import * as reportService from "../services/report.service";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { parsePaginationQuery } from "../utils/helpers";

export async function getTenderSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, category, startDate, endDate } = req.query as Record<string, string>;
    const data = await reportService.getTenderSummary(req.user!.id, { status, category, startDate, endDate });
    return ApiResponse.success(res, "Tender summary retrieved", data);
  } catch (err) { next(err); }
}

export async function getBidEvaluationReport(req: Request, res: Response, next: NextFunction) {
  try {
    const tenderId = parseInt(req.params.tenderId, 10);
    if (isNaN(tenderId)) throw new ApiError(400, "Invalid tender ID");

    const data = await reportService.getBidEvaluationReport(tenderId, req.user!.id, req.user!.role);
    return ApiResponse.success(res, "Bid evaluation report retrieved", data);
  } catch (err) { next(err); }
}

export async function getProcurementActivity(req: Request, res: Response, next: NextFunction) {
  try {
    const { startDate, endDate } = req.query as Record<string, string>;
    if (!startDate || !endDate) throw new ApiError(400, "startDate and endDate are required");

    const data = await reportService.getProcurementActivity(req.user!.id, startDate, endDate);
    return ApiResponse.success(res, "Procurement activity retrieved", data);
  } catch (err) { next(err); }
}

export async function getBidderParticipation(req: Request, res: Response, next: NextFunction) {
  try {
    const { startDate, endDate, tenderId } = req.query as Record<string, string>;
    const data = await reportService.getBidderParticipation(req.user!.id, {
      startDate, endDate,
      tenderId: tenderId ? parseInt(tenderId, 10) : undefined,
    });
    return ApiResponse.success(res, "Bidder participation retrieved", data);
  } catch (err) { next(err); }
}

export async function getBidOpeningRecord(req: Request, res: Response, next: NextFunction) {
  try {
    const tenderId = parseInt(req.params.tenderId, 10);
    if (isNaN(tenderId)) throw new ApiError(400, "Invalid tender ID");

    const data = await reportService.getBidOpeningRecord(tenderId, req.user!.id, req.user!.role);
    return ApiResponse.success(res, "Bid opening record retrieved", data);
  } catch (err) { next(err); }
}

export async function getAuditTrail(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit } = parsePaginationQuery(req.query as Record<string, string>);
    const { startDate, endDate, userId, action } = req.query as Record<string, string>;
    const data = await reportService.getAuditTrail(
      { startDate, endDate, userId: userId ? parseInt(userId, 10) : undefined, action },
      page,
      limit
    );
    return ApiResponse.success(res, "Audit trail retrieved", data);
  } catch (err) { next(err); }
}
