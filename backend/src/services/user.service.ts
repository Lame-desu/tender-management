import bcrypt from "bcryptjs";
import { Role, UserStatus, Prisma } from "@prisma/client";
import prisma from "../config/db";
import { ApiError } from "../utils/ApiError";

export interface ListUsersParams {
  role?: Role;
  status?: UserStatus;
  search?: string;
  page: number;
  limit: number;
}

export async function listUsers(params: ListUsersParams) {
  const { role, status, search, page, limit } = params;

  const where: Prisma.UserWhereInput = {};
  if (role) where.role = role;
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: { bidderProfile: true, officerProfile: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      omit: { password: true },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total, page, totalPages: Math.ceil(total / limit) };
}

export async function getUserById(id: number) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: { bidderProfile: true, officerProfile: true },
    omit: { password: true },
  });
  if (!user) throw new ApiError(404, "User not found");
  return user;
}

export interface CreateInternalUserInput {
  email: string;
  password: string;
  fullName: string;
  role: "ADMIN" | "PROCUREMENT_OFFICER" | "EVALUATOR";
  department?: string;
  position?: string;
  organizationName?: string;
}

export async function createInternalUser(input: CreateInternalUserInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new ApiError(409, "An account with this email already exists");

  const hashedPassword = await bcrypt.hash(input.password, 12);

  const user = await prisma.user.create({
    data: {
      fullName: input.fullName,
      email: input.email,
      password: hashedPassword,
      role: input.role,
      status: "ACTIVE",
      ...(input.role === "PROCUREMENT_OFFICER" && {
        officerProfile: {
          create: {
            department: input.department || "",
            position: input.position || "",
            organizationName: input.organizationName || "",
          },
        },
      }),
    },
    include: { officerProfile: true },
    omit: { password: true },
  });

  return user;
}

export async function updateUserStatus(
  userId: number,
  newStatus: "ACTIVE" | "INACTIVE",
  adminId: number
) {
  if (userId === adminId) throw new ApiError(400, "You cannot change your own status");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(404, "User not found");

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { status: newStatus },
    omit: { password: true },
  });

  // Create notification for affected user
  await prisma.notification.create({
    data: {
      userId,
      message:
        newStatus === "ACTIVE"
          ? "Your account has been activated. You can now log in."
          : "Your account has been deactivated.",
      notificationType: "ACCOUNT_STATUS",
      entityType: "User",
      entityId: userId,
    },
  });

  return updated;
}

export async function updateUserRole(
  userId: number,
  newRole: Role,
  adminId: number,
  officerData?: { department?: string; position?: string; organizationName?: string }
) {
  if (userId === adminId) throw new ApiError(400, "You cannot change your own role");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { officerProfile: true },
  });
  if (!user) throw new ApiError(404, "User not found");

  // If changing to PROCUREMENT_OFFICER and no profile exists, create one
  if (newRole === "PROCUREMENT_OFFICER" && !user.officerProfile) {
    if (!officerData?.department || !officerData?.position) {
      throw new ApiError(400, "Department and position are required for Procurement Officer role");
    }
    await prisma.procurementOfficer.create({
      data: {
        userId,
        department: officerData.department,
        position: officerData.position,
        organizationName: officerData.organizationName || "",
      },
    });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
    omit: { password: true },
  });

  return updated;
}

export async function deleteUser(userId: number, adminId: number) {
  if (userId === adminId) throw new ApiError(400, "You cannot delete your own account");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(404, "User not found");

  // Check for related records that would prevent deletion
  const [tenderCount, bidCount, evaluationCount, committeeCount] = await Promise.all([
    prisma.tender.count({ where: { createdBy: userId } }),
    prisma.bid.count({ where: { bidderId: userId } }),
    prisma.evaluation.count({ where: { evaluatorId: userId } }),
    prisma.evaluationCommitteeAssignment.count({ where: { userId } }),
  ]);

  if (tenderCount > 0) {
    throw new ApiError(400, `Cannot delete user: they have ${tenderCount} tender(s) in the system`);
  }
  if (bidCount > 0) {
    throw new ApiError(400, `Cannot delete user: they have ${bidCount} bid(s) in the system`);
  }
  if (evaluationCount > 0) {
    throw new ApiError(400, `Cannot delete user: they have ${evaluationCount} evaluation(s) in the system`);
  }
  if (committeeCount > 0) {
    throw new ApiError(400, `Cannot delete user: they are assigned to ${committeeCount} evaluation committee(s)`);
  }

  // Delete related records that cascade or can be safely removed
  await prisma.notification.deleteMany({ where: { userId } });
  await prisma.bidder.deleteMany({ where: { userId } });
  await prisma.procurementOfficer.deleteMany({ where: { userId } });

  await prisma.user.delete({ where: { id: userId } });

  return { id: userId, fullName: user.fullName };
}

export async function getAdminStats() {
  const [
    usersByRole,
    usersByStatus,
    tendersByStatus,
    totalBids,
    recentActivity,
  ] = await Promise.all([
    prisma.user.groupBy({ by: ["role"], _count: { id: true } }),
    prisma.user.groupBy({ by: ["status"], _count: { id: true } }),
    prisma.tender.groupBy({ by: ["status"], _count: { id: true } }),
    prisma.bid.count(),
    prisma.auditLog.findMany({
      take: 20,
      orderBy: { timestamp: "desc" },
      include: { performedUser: { select: { fullName: true } } },
    }),
  ]);

  const roleMap: Record<string, number> = {};
  for (const r of usersByRole) roleMap[r.role] = r._count.id;

  const statusMap: Record<string, number> = {};
  for (const s of usersByStatus) statusMap[s.status] = s._count.id;

  const tenderMap: Record<string, number> = {};
  for (const t of tendersByStatus) tenderMap[t.status] = t._count.id;

  return {
    totalUsers: Object.values(roleMap).reduce((a, b) => a + b, 0),
    usersByRole: roleMap,
    usersByStatus: statusMap,
    totalTenders: Object.values(tenderMap).reduce((a, b) => a + b, 0),
    tendersByStatus: tenderMap,
    totalBids,
    recentActivity: recentActivity.map((a) => ({
      id: a.id,
      action: a.action,
      entityType: a.entityType,
      entityId: a.entityId,
      timestamp: a.timestamp,
      ipAddress: a.ipAddress,
      userName: a.performedUser.fullName,
    })),
  };
}
