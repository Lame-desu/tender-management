import { Router } from "express";
import * as nc from "../controllers/notification.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/", nc.getNotifications);
router.get("/unread-count", nc.getUnreadCount);
router.patch("/read-all", nc.markAllAsRead);
router.patch("/:id/read", nc.markAsRead);
router.delete("/:id", nc.deleteNotification);

export default router;
