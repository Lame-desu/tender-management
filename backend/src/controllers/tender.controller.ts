import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { TenderCategory, TenderStatus } from "@prisma/client";
import * as tenderService from "../services/tender.service";
import prisma from "../config/db";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { parsePaginationQuery } from "../utils/helpers";

// ─── VALIDATION ───────────────────────────────────────────────────────────────

const criteriaItem = z.object({ name: z.string().min(1), weight: z.number().min(0).max(100) });

const tenderSchema = z
  .object({
    title: z.string().min(10, "Title must be at least 10 characters"),
    description: z.string().min(50, "Description must be at least 50 characters"),
    category: z.nativeEnum(TenderCategory),
    eligibilityCriteria: z.string().min(1, "Eligibility criteria is required"),
    requiredDocuments: z.array(z.string()).min(1, "At least one required document"),
    evaluationCriteria: z.array(criteriaItem).min(1, "At least one evaluation criterion"),
    minimumTechnicalScore: z.number().min(0).max(100),
    technicalWeight: z.number().min(0).max(100),
    financialWeight: z.number().min(0).max(100),
    bidSecurityRequired: z.boolean(),
    bidSecurityAmount: z.number().positive().optional().nullable(),
    clarificationDeadline: z.string(),
    submissionDeadline: z.string(),
  })
  .refine((d) => d.evaluationCriteria.reduce((s, c) => s + c.weight, 0) === 100, {
    message: "Evaluation criteria weights must sum to 100",
    path: ["evaluationCriteria"],
  })
  .refine((d) => d.technicalWeight + d.financialWeight === 100, {
    message: "Technical + Financial weight must equal 100",
    path: ["technicalWeight"],
  })
  .refine((d) => new Date(d.clarificationDeadline) < new Date(d.submissionDeadline), {
    message: "Clarification deadline must be before submission deadline",
    path: ["clarificationDeadline"],
  })
  .refine((d) => new Date(d.submissionDeadline) > new Date(), {
    message: "Submission deadline must be in the future",
    path: ["submissionDeadline"],
  })
  .refine((d) => !d.bidSecurityRequired || (d.bidSecurityAmount && d.bidSecurityAmount > 0), {
    message: "Bid security amount is required when bid security is enabled",
    path: ["bidSecurityAmount"],
  });

function audit(req: Request, action: string, entityId?: number) {
  return prisma.auditLog.create({
    data: {
      action,
      entityType: "Tender",
      entityId,
      performedBy: req.user!.id,
      ipAddress: req.ip || req.socket.remoteAddress || undefined,
    },
  });
}

// ─── CONTROLLERS ──────────────────────────────────────────────────────────────

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = tenderSchema.safeParse(req.body);
    if (!parsed.success) throw new ApiError(400, parsed.error.errors[0]?.message || "Validation failed");

    const tender = await tenderService.createTender(parsed.data, req.user!.id);
    await audit(req, "Created tender", tender.id);

    return ApiResponse.created(res, "Tender created", { tender });
  } catch (err) { next(err); }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit } = parsePaginationQuery(req.query as Record<string, string>);
    const status = req.query.status as TenderStatus | undefined;
    const category = req.query.category as TenderCategory | undefined;
    const search = req.query.search as string | undefined;

    const result = await tenderService.listTenders({
      userId: req.user!.id,
      userRole: req.user!.role,
      status,
      category,
      search,
      page,
      limit,
    });

    return ApiResponse.success(res, "Tenders retrieved", result);
  } catch (err) { next(err); }
}

export async function getDetail(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new ApiError(400, "Invalid tender ID");

    const tender = await tenderService.getTenderDetail(id, req.user!.id, req.user!.role);
    return ApiResponse.success(res, "Tender retrieved", { tender });
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new ApiError(400, "Invalid tender ID");

    const parsed = tenderSchema.safeParse(req.body);
    if (!parsed.success) throw new ApiError(400, parsed.error.errors[0]?.message || "Validation failed");

    const tender = await tenderService.updateTender(id, parsed.data, req.user!.id);
    await audit(req, "Updated tender", id);

    return ApiResponse.success(res, "Tender updated", { tender });
  } catch (err) { next(err); }
}

export async function publish(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new ApiError(400, "Invalid tender ID");

    const tender = await tenderService.publishTender(id, req.user!.id);
    await audit(req, "Published tender", id);

    return ApiResponse.success(res, "Tender published", { tender });
  } catch (err) { next(err); }
}

export async function cancel(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new ApiError(400, "Invalid tender ID");

    const tender = await tenderService.cancelTender(id, req.user!.id);
    await audit(req, "Cancelled tender", id);

    return ApiResponse.success(res, "Tender cancelled", { tender });
  } catch (err) { next(err); }
}

export async function createAddendum(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new ApiError(400, "Invalid tender ID");

    const { description, newDeadline } = req.body;
    if (!description) throw new ApiError(400, "Description is required");

    const addendum = await tenderService.issueAddendum(id, req.user!.id, description, newDeadline);
    await audit(req, "Issued addendum", id);

    return ApiResponse.created(res, "Addendum issued", { addendum });
  } catch (err) { next(err); }
}

export async function getAddenda(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new ApiError(400, "Invalid tender ID");

    const addenda = await tenderService.listAddenda(id);
    return ApiResponse.success(res, "Addenda retrieved", { addenda });
  } catch (err) { next(err); }
}

export async function askClarification(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new ApiError(400, "Invalid tender ID");

    const { question } = req.body;
    if (!question) throw new ApiError(400, "Question is required");

    const clarification = await tenderService.askClarification(id, req.user!.id, question);
    await audit(req, "Asked clarification", id);

    return ApiResponse.created(res, "Clarification submitted", { clarification });
  } catch (err) { next(err); }
}

export async function answerClarification(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new ApiError(400, "Invalid clarification ID");

    const { answer } = req.body;
    if (!answer) throw new ApiError(400, "Answer is required");

    const clarification = await tenderService.answerClarification(id, req.user!.id, answer);
    await audit(req, "Answered clarification", clarification.tenderId);

    return ApiResponse.success(res, "Clarification answered", { clarification });
  } catch (err) { next(err); }
}

export async function getClarifications(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new ApiError(400, "Invalid tender ID");

    const clarifications = await tenderService.listClarifications(id, req.user!.role);
    return ApiResponse.success(res, "Clarifications retrieved", { clarifications });
  } catch (err) { next(err); }
}

export async function getOfficerStats(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await tenderService.getOfficerStats(req.user!.id);
    return ApiResponse.success(res, "Stats retrieved", stats);
  } catch (err) { next(err); }
}
