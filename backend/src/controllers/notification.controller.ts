import { Request, Response, NextFunction } from "express";
import * as notifService from "../services/notification.service";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { parsePaginationQuery } from "../utils/helpers";

export async function getNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit } = parsePaginationQuery(req.query as Record<string, string>);
    const isReadParam = req.query.isRead as string | undefined;
    const isRead = isReadParam === "true" ? true : isReadParam === "false" ? false : undefined;

    const result = await notifService.getUserNotifications(req.user!.id, page, limit, isRead);
    return ApiResponse.success(res, "Notifications retrieved", result);
  } catch (err) { next(err); }
}

export async function getUnreadCount(req: Request, res: Response, next: NextFunction) {
  try {
    const count = await notifService.getUnreadCount(req.user!.id);
    return ApiResponse.success(res, "Unread count retrieved", { count });
  } catch (err) { next(err); }
}

export async function markAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new ApiError(400, "Invalid notification ID");

    await notifService.markAsRead(id, req.user!.id);
    return ApiResponse.success(res, "Marked as read");
  } catch (err) { next(err); }
}

export async function markAllAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    await notifService.markAllAsRead(req.user!.id);
    return ApiResponse.success(res, "All notifications marked as read");
  } catch (err) { next(err); }
}

export async function deleteNotification(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new ApiError(400, "Invalid notification ID");

    await notifService.deleteNotification(id, req.user!.id);
    return ApiResponse.success(res, "Notification deleted");
  } catch (err) { next(err); }
}
