import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as evalService from "../services/evaluation.service";
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

// ─── BID OPENING ──────────────────────────────────────────────────────────────

export async function openBids(req: Request, res: Response, next: NextFunction) {
  try {
    const tenderId = parseInt(req.params.tenderId, 10);
    if (isNaN(tenderId)) throw new ApiError(400, "Invalid tender ID");

    const bids = await evalService.openBids(tenderId, req.user!.id);
    return ApiResponse.success(res, "Bids opened successfully", { bids });
  } catch (err) { next(err); }
}

export async function getBidOpeningRecord(req: Request, res: Response, next: NextFunction) {
  try {
    const tenderId = parseInt(req.params.tenderId, 10);
    if (isNaN(tenderId)) throw new ApiError(400, "Invalid tender ID");

    const record = await evalService.getBidOpeningRecord(tenderId, req.user!.id, req.user!.role);
    return ApiResponse.success(res, "Bid opening record retrieved", record);
  } catch (err) { next(err); }
}

// ─── COMMITTEE ────────────────────────────────────────────────────────────────

const committeeSchema = z.object({
  memberIds: z.array(z.number().int().positive()).min(3, "At least 3 members required"),
});

export async function assignCommittee(req: Request, res: Response, next: NextFunction) {
  try {
    const tenderId = parseInt(req.params.tenderId, 10);
    if (isNaN(tenderId)) throw new ApiError(400, "Invalid tender ID");

    const parsed = committeeSchema.safeParse(req.body);
    if (!parsed.success) throw new ApiError(400, parsed.error.errors[0]?.message || "Validation failed");

    const committee = await evalService.assignCommittee(tenderId, req.user!.id, parsed.data.memberIds);
    await audit(req, "Assigned evaluation committee", "Tender", tenderId);

    return ApiResponse.created(res, "Committee assigned", { committee });
  } catch (err) { next(err); }
}

export async function getCommittee(req: Request, res: Response, next: NextFunction) {
  try {
    const tenderId = parseInt(req.params.tenderId, 10);
    if (isNaN(tenderId)) throw new ApiError(400, "Invalid tender ID");

    const committee = await evalService.getCommittee(tenderId);
    return ApiResponse.success(res, "Committee retrieved", { committee });
  } catch (err) { next(err); }
}

// ─── TECHNICAL EVALUATION ─────────────────────────────────────────────────────

export async function getTechnicalEvaluationData(req: Request, res: Response, next: NextFunction) {
  try {
    const tenderId = parseInt(req.params.tenderId, 10);
    if (isNaN(tenderId)) throw new ApiError(400, "Invalid tender ID");

    const data = await evalService.getTechnicalEvaluationData(tenderId, req.user!.id);
    return ApiResponse.success(res, "Technical evaluation data retrieved", data);
  } catch (err) { next(err); }
}

const technicalEvalSchema = z.object({
  evaluations: z.array(z.object({
    bidId: z.number().int().positive(),
    criteriaScores: z.array(z.object({
      criteriaName: z.string().min(1),
      score: z.number().min(0),
    })).min(1),
    remarks: z.string().optional(),
  })).min(1),
});

export async function submitTechnicalEvaluation(req: Request, res: Response, next: NextFunction) {
  try {
    const tenderId = parseInt(req.params.tenderId, 10);
    if (isNaN(tenderId)) throw new ApiError(400, "Invalid tender ID");

    const parsed = technicalEvalSchema.safeParse(req.body);
    if (!parsed.success) throw new ApiError(400, parsed.error.errors[0]?.message || "Validation failed");

    const result = await evalService.submitTechnicalEvaluation(tenderId, req.user!.id, parsed.data.evaluations);
    await audit(req, "Submitted technical evaluation", "Tender", tenderId);

    return ApiResponse.success(res, result.message);
  } catch (err) { next(err); }
}

export async function getTechnicalEvaluationStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const tenderId = parseInt(req.params.tenderId, 10);
    if (isNaN(tenderId)) throw new ApiError(400, "Invalid tender ID");

    const status = await evalService.getTechnicalEvaluationStatus(tenderId, req.user!.id, req.user!.role);
    return ApiResponse.success(res, "Technical evaluation status retrieved", status);
  } catch (err) { next(err); }
}

export async function finalizeTechnicalEvaluation(req: Request, res: Response, next: NextFunction) {
  try {
    const tenderId = parseInt(req.params.tenderId, 10);
    if (isNaN(tenderId)) throw new ApiError(400, "Invalid tender ID");

    const result = await evalService.finalizeTechnicalEvaluation(tenderId, req.user!.id);
    await audit(req, "Finalized technical evaluation", "Tender", tenderId);

    return ApiResponse.success(res, result.message);
  } catch (err) { next(err); }
}

// ─── FINANCIAL EVALUATION ─────────────────────────────────────────────────────

export async function getFinancialEvaluationData(req: Request, res: Response, next: NextFunction) {
  try {
    const tenderId = parseInt(req.params.tenderId, 10);
    if (isNaN(tenderId)) throw new ApiError(400, "Invalid tender ID");

    const data = await evalService.getFinancialEvaluationData(tenderId, req.user!.id, req.user!.role);
    return ApiResponse.success(res, "Financial evaluation data retrieved", data);
  } catch (err) { next(err); }
}

export async function finalizeFinancialEvaluation(req: Request, res: Response, next: NextFunction) {
  try {
    const tenderId = parseInt(req.params.tenderId, 10);
    if (isNaN(tenderId)) throw new ApiError(400, "Invalid tender ID");

    const result = await evalService.finalizeFinancialEvaluation(tenderId, req.user!.id);
    await audit(req, "Finalized financial evaluation", "Tender", tenderId);

    return ApiResponse.success(res, result.message);
  } catch (err) { next(err); }
}

// ─── AWARD & RESULTS ──────────────────────────────────────────────────────────

const awardSchema = z.object({
  winningBidId: z.number().int().positive(),
});

export async function awardTender(req: Request, res: Response, next: NextFunction) {
  try {
    const tenderId = parseInt(req.params.tenderId, 10);
    if (isNaN(tenderId)) throw new ApiError(400, "Invalid tender ID");

    const parsed = awardSchema.safeParse(req.body);
    if (!parsed.success) throw new ApiError(400, parsed.error.errors[0]?.message || "Validation failed");

    const tender = await evalService.awardTender(tenderId, req.user!.id, parsed.data.winningBidId);
    await audit(req, "Awarded tender", "Tender", tenderId);

    return ApiResponse.success(res, "Tender awarded", { tender });
  } catch (err) { next(err); }
}

export async function publishResults(req: Request, res: Response, next: NextFunction) {
  try {
    const tenderId = parseInt(req.params.tenderId, 10);
    if (isNaN(tenderId)) throw new ApiError(400, "Invalid tender ID");

    const result = await evalService.publishResults(tenderId, req.user!.id);
    await audit(req, "Published tender results", "Tender", tenderId);

    return ApiResponse.success(res, result.message);
  } catch (err) { next(err); }
}

export async function getTenderResults(req: Request, res: Response, next: NextFunction) {
  try {
    const tenderId = parseInt(req.params.tenderId, 10);
    if (isNaN(tenderId)) throw new ApiError(400, "Invalid tender ID");

    const results = await evalService.getTenderResults(tenderId, req.user!.id, req.user!.role);
    return ApiResponse.success(res, "Results retrieved", results);
  } catch (err) { next(err); }
}

// ─── AVAILABLE EVALUATORS ─────────────────────────────────────────────────────

export async function getAvailableEvaluators(req: Request, res: Response, next: NextFunction) {
  try {
    const evaluators = await prisma.user.findMany({
      where: { role: "EVALUATOR", status: "ACTIVE" },
      select: { id: true, fullName: true, email: true },
      orderBy: { fullName: "asc" },
    });
    return ApiResponse.success(res, "Evaluators retrieved", { evaluators });
  } catch (err) { next(err); }
}

// ─── EVALUATOR DASHBOARD ──────────────────────────────────────────────────────

export async function getEvaluatorAssignments(req: Request, res: Response, next: NextFunction) {
  try {
    const assignments = await evalService.getEvaluatorAssignments(req.user!.id);
    return ApiResponse.success(res, "Assignments retrieved", { assignments });
  } catch (err) { next(err); }
}
