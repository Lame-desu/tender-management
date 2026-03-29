import prisma from "../config/db";
import { ApiError } from "../utils/ApiError";

export async function getUserNotifications(
  userId: number,
  page: number,
  limit: number,
  isRead?: boolean
) {
  const where: { userId: number; isRead?: boolean } = { userId };
  if (isRead !== undefined) where.isRead = isRead;

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { sentDate: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  return { notifications, total, page, totalPages: Math.ceil(total / limit), unreadCount };
}

export async function getUnreadCount(userId: number) {
  return prisma.notification.count({ where: { userId, isRead: false } });
}

export async function markAsRead(notificationId: number, userId: number) {
  const notif = await prisma.notification.findUnique({ where: { id: notificationId } });
  if (!notif) throw new ApiError(404, "Notification not found");
  if (notif.userId !== userId) throw new ApiError(403, "Access denied");

  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}

export async function markAllAsRead(userId: number) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}

export async function deleteNotification(notificationId: number, userId: number) {
  const notif = await prisma.notification.findUnique({ where: { id: notificationId } });
  if (!notif) throw new ApiError(404, "Notification not found");
  if (notif.userId !== userId) throw new ApiError(403, "Access denied");

  return prisma.notification.delete({ where: { id: notificationId } });
}
