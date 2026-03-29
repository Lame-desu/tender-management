import { Router } from "express";
import * as dc from "../controllers/debriefing.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.use(authenticate);

router.post("/bids/:bidId/debriefing", authorize("BIDDER"), dc.requestDebriefing);
router.get("/debriefings", dc.listDebriefings);
router.patch("/debriefings/:id/respond", authorize("PROCUREMENT_OFFICER"), dc.respondToDebriefing);

export default router;
