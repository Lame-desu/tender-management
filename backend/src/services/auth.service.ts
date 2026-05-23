import crypto from "crypto";
import bcrypt from "bcryptjs";
import { BidderType } from "@prisma/client";
import prisma from "../config/db";
import { ApiError } from "../utils/ApiError";
import { sendPasswordResetEmail } from "../utils/email";

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  bidderType: BidderType;
  organizationName?: string;
  tinNumber: string;
  tradeLicenseNumber?: string;
  contactPerson: string;
  phoneNumber: string;
  address: string;
}

export async function registerBidder(input: RegisterInput) {
  // Check email uniqueness
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(input.password, 12);

  const user = await prisma.user.create({
    data: {
      fullName: input.fullName,
      email: input.email,
      password: hashedPassword,
      role: "BIDDER",
      status: "PENDING",
      bidderProfile: {
        create: {
          bidderType: input.bidderType,
          organizationName: input.organizationName || null,
          tinNumber: input.tinNumber,
          tradeLicenseNumber: input.tradeLicenseNumber || null,
          contactPerson: input.contactPerson,
          phoneNumber: input.phoneNumber,
          address: input.address,
        },
      },
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      status: true,
    },
  });

  return user;
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      bidderProfile: true,
      officerProfile: true,
    },
  });

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (user.status === "PENDING") {
    throw new ApiError(403, "Your account is pending admin verification");
  }
  if (user.status === "INACTIVE") {
    throw new ApiError(403, "Your account has been deactivated");
  }

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function getCurrentUser(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      bidderProfile: true,
      officerProfile: true,
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const { password: _pw, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new ApiError(404, "No account found with this email address");
  }

  // Invalidate any existing unused tokens for this user
  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, used: false },
    data: { used: true },
  });

  // Generate a secure random token
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordResetToken.create({
    data: {
      token,
      expiresAt,
      userId: user.id,
    },
  });

  const resetUrl = `http://localhost:3000/forgot-password/reset?token=${token}`;
  const previewUrl = await sendPasswordResetEmail(email, resetUrl);

  return { previewUrl };
}

export async function resetPassword(token: string, newPassword: string) {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!resetToken) {
    throw new ApiError(400, "Invalid or expired reset link");
  }

  if (resetToken.used) {
    throw new ApiError(400, "This reset link has already been used");
  }

  if (resetToken.expiresAt < new Date()) {
    throw new ApiError(400, "This reset link has expired. Please request a new one");
  }

  // Hash new password and update user
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    }),
  ]);

  return { success: true };
}
