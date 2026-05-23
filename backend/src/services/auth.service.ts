import crypto from "crypto";
import bcrypt from "bcryptjs";
import { BidderType } from "@prisma/client";
import prisma from "../config/db";
import { ApiError } from "../utils/ApiError";
import { sendPasswordResetEmail, sendEmailVerificationEmail } from "../utils/email";

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
      status: "PENDING_VERIFICATION",
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

  // Generate verification token (24 hours)
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.emailVerificationToken.create({
    data: { token, type: "VERIFICATION", expiresAt, userId: user.id },
  });

  const clientUrl = process.env.CORS_ORIGIN || "http://localhost:3000";
  const verificationUrl = `${clientUrl}/verify-email?token=${token}`;
  await sendEmailVerificationEmail(user.email, user.fullName, verificationUrl);

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
  if (user.status === "PENDING_VERIFICATION") {
    throw new ApiError(403, "Please verify your email address first. Check your inbox for the verification link.");
  }
  if (user.status === "INVITED") {
    throw new ApiError(403, "Please accept your invitation first. Check your inbox for the invitation link.");
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

export async function verifyEmail(token: string) {
  const verificationToken = await prisma.emailVerificationToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!verificationToken) throw new ApiError(400, "Invalid verification link");
  if (verificationToken.used) throw new ApiError(400, "This verification link has already been used");
  if (verificationToken.expiresAt < new Date()) throw new ApiError(400, "This verification link has expired. Please request a new one");
  if (verificationToken.type !== "VERIFICATION") throw new ApiError(400, "Invalid token type");

  await prisma.$transaction([
    prisma.user.update({
      where: { id: verificationToken.userId },
      data: { status: "PENDING" },
    }),
    prisma.emailVerificationToken.update({
      where: { id: verificationToken.id },
      data: { used: true },
    }),
  ]);

  return { email: verificationToken.user.email };
}

export async function resendVerificationEmail(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) throw new ApiError(404, "No account found with this email");
  if (user.status !== "PENDING_VERIFICATION") {
    throw new ApiError(400, "This account does not require email verification");
  }

  // Rate limit: check if a token was sent in the last 2 minutes
  const recentToken = await prisma.emailVerificationToken.findFirst({
    where: { userId: user.id, type: "VERIFICATION", createdAt: { gt: new Date(Date.now() - 2 * 60 * 1000) } },
  });
  if (recentToken) throw new ApiError(429, "Please wait before requesting another verification email");

  // Invalidate old tokens
  await prisma.emailVerificationToken.updateMany({
    where: { userId: user.id, used: false, type: "VERIFICATION" },
    data: { used: true },
  });

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.emailVerificationToken.create({
    data: { token, type: "VERIFICATION", expiresAt, userId: user.id },
  });

  const clientUrl = process.env.CORS_ORIGIN || "http://localhost:3000";
  const verificationUrl = `${clientUrl}/verify-email?token=${token}`;
  await sendEmailVerificationEmail(user.email, user.fullName, verificationUrl);
}

export async function getInvitationDetails(token: string) {
  const invitationToken = await prisma.emailVerificationToken.findUnique({
    where: { token },
    include: { user: { select: { fullName: true, email: true, role: true } } },
  });

  if (!invitationToken) throw new ApiError(400, "Invalid invitation link");
  if (invitationToken.used) throw new ApiError(400, "This invitation has already been used");
  if (invitationToken.expiresAt < new Date()) throw new ApiError(400, "This invitation link has expired. Please contact your administrator");
  if (invitationToken.type !== "INVITATION") throw new ApiError(400, "Invalid token type");

  return { user: invitationToken.user };
}

export async function acceptInvitation(token: string, newPassword: string) {
  const invitationToken = await prisma.emailVerificationToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!invitationToken) throw new ApiError(400, "Invalid invitation link");
  if (invitationToken.used) throw new ApiError(400, "This invitation has already been used");
  if (invitationToken.expiresAt < new Date()) throw new ApiError(400, "This invitation link has expired. Please contact your administrator");
  if (invitationToken.type !== "INVITATION") throw new ApiError(400, "Invalid token type");
  if (invitationToken.user.status !== "INVITED") throw new ApiError(400, "This account has already been set up");

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: invitationToken.userId },
      data: { password: hashedPassword, status: "ACTIVE" },
    }),
    prisma.emailVerificationToken.update({
      where: { id: invitationToken.id },
      data: { used: true },
    }),
  ]);

  return {
    user: {
      fullName: invitationToken.user.fullName,
      email: invitationToken.user.email,
      role: invitationToken.user.role,
    },
  };
}
