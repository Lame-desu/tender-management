import { Router } from "express";
import * as tc from "../controllers/tender.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.patch("/:id/answer", authorize("PROCUREMENT_OFFICER"), tc.answerClarification);

export default router;
