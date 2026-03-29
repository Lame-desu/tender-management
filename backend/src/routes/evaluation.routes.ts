import { Router } from "express";
import * as ec from "../controllers/evaluation.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.use(authenticate);

// Bid Opening
router.patch("/tenders/:tenderId/open-bids", authorize("PROCUREMENT_OFFICER"), ec.openBids);
router.get("/tenders/:tenderId/bid-opening-record", ec.getBidOpeningRecord);

// Evaluation Committee
router.post("/tenders/:tenderId/committee", authorize("PROCUREMENT_OFFICER"), ec.assignCommittee);
router.get("/tenders/:tenderId/committee", ec.getCommittee);

// Technical Evaluation
router.get("/tenders/:tenderId/evaluation/technical", authorize("EVALUATOR"), ec.getTechnicalEvaluationData);
router.post("/tenders/:tenderId/evaluation/technical", authorize("EVALUATOR"), ec.submitTechnicalEvaluation);
router.get("/tenders/:tenderId/evaluation/technical/status", ec.getTechnicalEvaluationStatus);
router.patch("/tenders/:tenderId/evaluation/technical/finalize", authorize("PROCUREMENT_OFFICER"), ec.finalizeTechnicalEvaluation);

// Financial Evaluation
router.get("/tenders/:tenderId/evaluation/financial", ec.getFinancialEvaluationData);
router.patch("/tenders/:tenderId/evaluation/financial/finalize", authorize("PROCUREMENT_OFFICER"), ec.finalizeFinancialEvaluation);

// Award & Results
router.patch("/tenders/:tenderId/award", authorize("PROCUREMENT_OFFICER"), ec.awardTender);
router.patch("/tenders/:tenderId/publish-results", authorize("PROCUREMENT_OFFICER"), ec.publishResults);
router.get("/tenders/:tenderId/results", ec.getTenderResults);

// Available evaluators (for committee assignment)
router.get("/evaluators/available", authorize("PROCUREMENT_OFFICER"), ec.getAvailableEvaluators);

// Evaluator Dashboard
router.get("/evaluator/assignments", authorize("EVALUATOR"), ec.getEvaluatorAssignments);

export default router;
