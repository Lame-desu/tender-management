import { Router } from "express";
import * as bc from "../controllers/bid.controller";
import { authenticate, authorize } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = Router();

router.use(authenticate);

router.post(
  "/tenders/:tenderId/bids",
  authorize("BIDDER"),
  upload.fields([
    { name: "technicalDocs", maxCount: 10 },
    { name: "otherDocs", maxCount: 10 },
  ]),
  bc.submitBid
);

router.get("/tenders/:tenderId/bids", authorize("PROCUREMENT_OFFICER"), bc.listBidsForTender);
router.get("/tenders/:tenderId/bids/check", authorize("BIDDER"), bc.checkExistingBid);
router.get("/bids/my-bids", authorize("BIDDER"), bc.getMyBids);
router.get("/bids/stats", authorize("BIDDER"), bc.getBidderStats);
router.get("/bids/:id", bc.getBidDetail);
router.get("/files/:documentId", bc.downloadFile);

export default router;
