import { Prisma } from "@prisma/client";
import prisma from "../config/db";

export interface ListAuditLogsParams {
  userId?: number;
  action?: string;
  entityType?: string;
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;
}

export async function listAuditLogs(params: ListAuditLogsParams) {
  const { userId, action, entityType, startDate, endDate, page, limit } = params;

  const where: Prisma.AuditLogWhereInput = {};
  if (userId) where.performedBy = userId;
  if (action) where.action = { contains: action, mode: "insensitive" };
  if (entityType) where.entityType = entityType;
  if (startDate || endDate) {
    where.timestamp = {};
    if (startDate) where.timestamp.gte = new Date(startDate);
    if (endDate) where.timestamp.lte = new Date(endDate + "T23:59:59.999Z");
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { performedUser: { select: { id: true, fullName: true, email: true } } },
      orderBy: { timestamp: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, total, page, totalPages: Math.ceil(total / limit) };
}
