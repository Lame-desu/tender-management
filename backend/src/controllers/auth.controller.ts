import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { BidderType, Role } from "@prisma/client";
import * as authService from "../services/auth.service";
import prisma from "../config/db";
import {
  generateAccessToken,
  generateRefreshToken,
  setTokenCookies,
  clearTokenCookies,
  JwtPayload,
} from "../middleware/auth";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";

// ─── VALIDATION SCHEMAS ───────────────────────────────────────────────────────

const registerSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    fullName: z.string().min(2, "Full name is required"),
    bidderType: z.nativeEnum(BidderType),
    organizationName: z.string().optional(),
    tinNumber: z.string().min(1, "TIN number is required"),
    tradeLicenseNumber: z.string().optional(),
    contactPerson: z.string().min(1, "Contact person is required"),
    phoneNumber: z.string().min(1, "Phone number is required"),
    address: z.string().min(1, "Address is required"),
  })
  .refine(
    (data) => {
      if (data.bidderType === "ORGANIZATION") {
        return !!data.organizationName && data.organizationName.length > 0;
      }
      return true;
    },
    { message: "Organization name is required", path: ["organizationName"] }
  );

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  role: z.nativeEnum(Role).optional(),
});

// ─── CONTROLLERS ──────────────────────────────────────────────────────────────

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message || "Validation failed";
      throw new ApiError(400, firstError);
    }

    const newUser = await authService.registerBidder(parsed.data);

    await prisma.auditLog.create({
      data: {
        action: "User registered",
        entityType: "User",
        entityId: newUser.id,
        performedBy: newUser.id,
        ipAddress: req.ip || req.socket.remoteAddress || undefined,
      },
    });

    return ApiResponse.created(
      res,
      "Registration submitted. Your account is pending admin verification."
    );
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message || "Validation failed";
      throw new ApiError(400, firstError);
    }

    const user = await authService.loginUser(parsed.data.email, parsed.data.password, parsed.data.role);

    const payload: JwtPayload = { id: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(user.id);
    setTokenCookies(res, accessToken, refreshToken);

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "User logged in",
        entityType: "User",
        entityId: user.id,
        performedBy: user.id,
        ipAddress: req.ip || req.socket.remoteAddress || undefined,
      },
    });

    return ApiResponse.success(res, "Login successful", {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.user) {
      await prisma.auditLog.create({
        data: {
          action: "User logged out",
          entityType: "User",
          entityId: req.user.id,
          performedBy: req.user.id,
          ipAddress: req.ip || req.socket.remoteAddress || undefined,
        },
      });
    }

    clearTokenCookies(res);
    return ApiResponse.success(res, "Logged out successfully");
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      throw new ApiError(401, "Authentication required");
    }

    const user = await authService.getCurrentUser(req.user.id);
    return ApiResponse.success(res, "User retrieved", { user });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const schema = z.object({
      email: z.string().email("Invalid email address"),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message || "Validation failed";
      throw new ApiError(400, firstError);
    }

    const result = await authService.requestPasswordReset(parsed.data.email);

    // Return the preview URL so the frontend can show it (test/demo mode)
    return ApiResponse.success(res, "If an account with that email exists, a reset link has been sent.", {
      previewUrl: result.previewUrl,
    });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const schema = z.object({
      token: z.string().min(1, "Reset token is required"),
      newPassword: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message || "Validation failed";
      throw new ApiError(400, firstError);
    }

    await authService.resetPassword(parsed.data.token, parsed.data.newPassword);

    return ApiResponse.success(res, "Password has been reset successfully. You can now log in with your new password.");
  } catch (err) {
    next(err);
  }
}

export async function verifyEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const schema = z.object({
      token: z.string().min(1, "Verification token is required"),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message || "Validation failed";
      throw new ApiError(400, firstError);
    }

    const result = await authService.verifyEmail(parsed.data.token);

    return ApiResponse.success(res, "Email verified successfully. Your account is now pending admin approval.", result);
  } catch (err) {
    next(err);
  }
}

export async function resendVerification(req: Request, res: Response, next: NextFunction) {
  try {
    const schema = z.object({
      email: z.string().email("Invalid email address"),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message || "Validation failed";
      throw new ApiError(400, firstError);
    }

    await authService.resendVerificationEmail(parsed.data.email);

    return ApiResponse.success(res, "Verification email has been resent. Please check your inbox.");
  } catch (err) {
    next(err);
  }
}

export async function getInvitationDetails(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.params.token;
    if (!token) throw new ApiError(400, "Invitation token is required");

    const result = await authService.getInvitationDetails(token);

    return ApiResponse.success(res, "Invitation details retrieved", result);
  } catch (err) {
    next(err);
  }
}

export async function acceptInvitation(req: Request, res: Response, next: NextFunction) {
  try {
    const schema = z.object({
      token: z.string().min(1, "Invitation token is required"),
      newPassword: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message || "Validation failed";
      throw new ApiError(400, firstError);
    }

    const result = await authService.acceptInvitation(parsed.data.token, parsed.data.newPassword);

    return ApiResponse.success(res, "Account has been set up successfully. You can now log in.", result);
  } catch (err) {
    next(err);
  }
}
