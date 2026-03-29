import { Router } from "express";
import * as rc from "../controllers/report.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/tender-summary", authorize("PROCUREMENT_OFFICER"), rc.getTenderSummary);
router.get("/bid-evaluation/:tenderId", rc.getBidEvaluationReport);
router.get("/procurement-activity", authorize("PROCUREMENT_OFFICER"), rc.getProcurementActivity);
router.get("/bidder-participation", authorize("PROCUREMENT_OFFICER"), rc.getBidderParticipation);
router.get("/bid-opening/:tenderId", rc.getBidOpeningRecord);
router.get("/audit-trail", authorize("ADMIN"), rc.getAuditTrail);

export default router;
