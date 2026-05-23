import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/", userController.listUsers);
router.get("/stats", userController.getStats);
router.get("/:id", userController.getUser);
router.post("/", userController.createUser);
router.patch("/:id/status", userController.updateStatus);
router.patch("/:id/role", userController.updateRole);
router.post("/:id/resend-invitation", userController.resendInvitation);
router.delete("/:id", userController.deleteUser);

export default router;
