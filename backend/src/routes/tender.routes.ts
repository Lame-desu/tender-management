import { Router } from "express";
import * as tc from "../controllers/tender.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.use(authenticate);

// Tender CRUD
router.post("/", authorize("PROCUREMENT_OFFICER"), tc.create);
router.get("/", tc.list);
router.get("/officer-stats", authorize("PROCUREMENT_OFFICER"), tc.getOfficerStats);
router.get("/:id", tc.getDetail);
router.put("/:id", authorize("PROCUREMENT_OFFICER"), tc.update);
router.patch("/:id/publish", authorize("PROCUREMENT_OFFICER"), tc.publish);
router.patch("/:id/cancel", authorize("PROCUREMENT_OFFICER"), tc.cancel);

// Addenda
router.post("/:id/addenda", authorize("PROCUREMENT_OFFICER"), tc.createAddendum);
router.get("/:id/addenda", tc.getAddenda);

// Clarifications
router.post("/:id/clarifications", authorize("BIDDER"), tc.askClarification);
router.get("/:id/clarifications", tc.getClarifications);

export default router;
