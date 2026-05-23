import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authenticate, authController.logout);
router.get("/me", authenticate, authController.getMe);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/verify-email", authController.verifyEmail);
router.post("/resend-verification", authController.resendVerification);
router.get("/invitation/:token", authController.getInvitationDetails);
router.post("/accept-invitation", authController.acceptInvitation);

export default router;
