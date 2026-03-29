import { Request, Response, NextFunction } from "express";
import * as auditService from "../services/audit.service";
import { ApiResponse } from "../utils/ApiResponse";
import { parsePaginationQuery } from "../utils/helpers";

export async function listAuditLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit } = parsePaginationQuery(req.query as Record<string, string>);
    const userId = req.query.userId ? parseInt(req.query.userId as string, 10) : undefined;
    const action = req.query.action as string | undefined;
    const entityType = req.query.entityType as string | undefined;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    const result = await auditService.listAuditLogs({
      userId,
      action,
      entityType,
      startDate,
      endDate,
      page,
      limit,
    });

    return ApiResponse.success(res, "Audit logs retrieved", result);
  } catch (err) {
    next(err);
  }
}
