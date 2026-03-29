import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { Role, UserStatus } from "@prisma/client";
import * as userService from "../services/user.service";
import prisma from "../config/db";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { parsePaginationQuery } from "../utils/helpers";

// ─── LIST USERS ───────────────────────────────────────────────────────────────

export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit } = parsePaginationQuery(req.query as Record<string, string>);
    const role = req.query.role as Role | undefined;
    const status = req.query.status as UserStatus | undefined;
    const search = req.query.search as string | undefined;

    const result = await userService.listUsers({ role, status, search, page, limit });
    return ApiResponse.success(res, "Users retrieved", result);
  } catch (err) {
    next(err);
  }
}

// ─── GET USER ─────────────────────────────────────────────────────────────────

export async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new ApiError(400, "Invalid user ID");

    const user = await userService.getUserById(id);
    return ApiResponse.success(res, "User retrieved", { user });
  } catch (err) {
    next(err);
  }
}

// ─── CREATE INTERNAL USER ─────────────────────────────────────────────────────

const createUserSchema = z
  .object({
    email: z.string().email("Invalid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    fullName: z.string().min(2, "Full name is required"),
    role: z.enum(["ADMIN", "PROCUREMENT_OFFICER", "EVALUATOR"]),
    department: z.string().optional(),
    position: z.string().optional(),
    organizationName: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.role === "PROCUREMENT_OFFICER") {
        return !!data.department && !!data.position;
      }
      return true;
    },
    { message: "Department and position are required for Procurement Officer", path: ["department"] }
  );

export async function createUser(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.errors[0]?.message || "Validation failed");
    }

    const user = await userService.createInternalUser(parsed.data);

    await prisma.auditLog.create({
      data: {
        action: "Created user account",
        entityType: "User",
        entityId: user.id,
        performedBy: req.user!.id,
        ipAddress: req.ip || req.socket.remoteAddress || undefined,
      },
    });

    return ApiResponse.created(res, "User created successfully", { user });
  } catch (err) {
    next(err);
  }
}

// ─── UPDATE STATUS ────────────────────────────────────────────────────────────

const statusSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

export async function updateStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new ApiError(400, "Invalid user ID");

    const parsed = statusSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.errors[0]?.message || "Validation failed");
    }

    const user = await userService.updateUserStatus(id, parsed.data.status, req.user!.id);

    const actionLabel = parsed.data.status === "ACTIVE" ? "Activated" : "Deactivated";
    await prisma.auditLog.create({
      data: {
        action: `${actionLabel} user account`,
        entityType: "User",
        entityId: id,
        performedBy: req.user!.id,
        ipAddress: req.ip || req.socket.remoteAddress || undefined,
      },
    });

    return ApiResponse.success(res, `User ${actionLabel.toLowerCase()} successfully`, { user });
  } catch (err) {
    next(err);
  }
}

// ─── UPDATE ROLE ──────────────────────────────────────────────────────────────

const roleSchema = z.object({
  role: z.nativeEnum(Role),
  department: z.string().optional(),
  position: z.string().optional(),
  organizationName: z.string().optional(),
});

export async function updateRole(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new ApiError(400, "Invalid user ID");

    const parsed = roleSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.errors[0]?.message || "Validation failed");
    }

    const { role, ...officerData } = parsed.data;
    const user = await userService.updateUserRole(id, role, req.user!.id, officerData);

    await prisma.auditLog.create({
      data: {
        action: "Changed user role",
        entityType: "User",
        entityId: id,
        performedBy: req.user!.id,
        ipAddress: req.ip || req.socket.remoteAddress || undefined,
        details: `Changed to ${role}`,
      },
    });

    return ApiResponse.success(res, "User role updated successfully", { user });
  } catch (err) {
    next(err);
  }
}

// ─── ADMIN STATS ──────────────────────────────────────────────────────────────

export async function getStats(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await userService.getAdminStats();
    return ApiResponse.success(res, "Stats retrieved", stats);
  } catch (err) {
    next(err);
  }
}
