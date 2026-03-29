-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'PROCUREMENT_OFFICER', 'EVALUATOR', 'BIDDER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING');

-- CreateEnum
CREATE TYPE "BidderType" AS ENUM ('ORGANIZATION', 'INDIVIDUAL');

-- CreateEnum
CREATE TYPE "TenderCategory" AS ENUM ('GOODS', 'WORKS', 'CONSULTING');

-- CreateEnum
CREATE TYPE "TenderStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'UNDER_EVALUATION', 'AWARDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BidStatus" AS ENUM ('SUBMITTED', 'OPENED', 'TECHNICALLY_QUALIFIED', 'TECHNICALLY_DISQUALIFIED', 'EVALUATED', 'SELECTED', 'NOT_SELECTED');

-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('TECHNICAL', 'FINANCIAL', 'BID_SECURITY', 'OTHER');

-- CreateEnum
CREATE TYPE "EvaluationType" AS ENUM ('TECHNICAL', 'FINANCIAL');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'BIDDER',
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bidders" (
    "id" SERIAL NOT NULL,
    "bidder_type" "BidderType" NOT NULL,
    "organization_name" TEXT,
    "tin_number" TEXT NOT NULL,
    "trade_license_number" TEXT,
    "contact_person" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "bidders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procurement_officers" (
    "id" SERIAL NOT NULL,
    "department" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "organization_name" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "procurement_officers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenders" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "TenderCategory" NOT NULL,
    "eligibility_criteria" TEXT NOT NULL,
    "required_documents" TEXT[],
    "evaluation_criteria" JSONB NOT NULL,
    "minimum_technical_score" DOUBLE PRECISION NOT NULL DEFAULT 70,
    "technical_weight" DOUBLE PRECISION NOT NULL DEFAULT 80,
    "financial_weight" DOUBLE PRECISION NOT NULL DEFAULT 20,
    "bid_security_required" BOOLEAN NOT NULL DEFAULT false,
    "bid_security_amount" DOUBLE PRECISION,
    "publish_date" TIMESTAMP(3),
    "clarification_deadline" TIMESTAMP(3) NOT NULL,
    "submission_deadline" TIMESTAMP(3) NOT NULL,
    "status" "TenderStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER NOT NULL,

    CONSTRAINT "tenders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tender_addenda" (
    "id" SERIAL NOT NULL,
    "addendum_number" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "new_deadline" TIMESTAMP(3),
    "issued_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tender_id" INTEGER NOT NULL,
    "issued_by" INTEGER NOT NULL,

    CONSTRAINT "tender_addenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clarifications" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT,
    "asked_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "answered_date" TIMESTAMP(3),
    "tender_id" INTEGER NOT NULL,
    "asked_by" INTEGER NOT NULL,
    "answered_by" INTEGER,

    CONSTRAINT "clarifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bids" (
    "id" SERIAL NOT NULL,
    "technical_proposal" TEXT NOT NULL,
    "bid_amount" DOUBLE PRECISION NOT NULL,
    "bid_security_info" TEXT,
    "submission_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "BidStatus" NOT NULL DEFAULT 'SUBMITTED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tender_id" INTEGER NOT NULL,
    "bidder_id" INTEGER NOT NULL,

    CONSTRAINT "bids_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bid_documents" (
    "id" SERIAL NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "document_category" "DocumentCategory" NOT NULL,
    "upload_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bid_id" INTEGER NOT NULL,

    CONSTRAINT "bid_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluation_committee_assignments" (
    "id" SERIAL NOT NULL,
    "assigned_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tender_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "assigned_by" INTEGER NOT NULL,

    CONSTRAINT "evaluation_committee_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluations" (
    "id" SERIAL NOT NULL,
    "criteria_scores" JSONB NOT NULL,
    "total_score" DOUBLE PRECISION NOT NULL,
    "remarks" TEXT,
    "evaluation_type" "EvaluationType" NOT NULL,
    "evaluation_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bid_id" INTEGER NOT NULL,
    "evaluator_id" INTEGER NOT NULL,

    CONSTRAINT "evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluation_summaries" (
    "id" SERIAL NOT NULL,
    "avg_technical_score" DOUBLE PRECISION NOT NULL,
    "avg_financial_score" DOUBLE PRECISION,
    "combined_score" DOUBLE PRECISION,
    "rank" INTEGER,
    "is_technically_qualified" BOOLEAN NOT NULL,
    "is_winner" BOOLEAN NOT NULL DEFAULT false,
    "bid_id" INTEGER NOT NULL,
    "tender_id" INTEGER NOT NULL,

    CONSTRAINT "evaluation_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "debriefing_requests" (
    "id" SERIAL NOT NULL,
    "request_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "response" TEXT,
    "responded_date" TIMESTAMP(3),
    "bid_id" INTEGER NOT NULL,
    "bidder_id" INTEGER NOT NULL,
    "responded_by" INTEGER,

    CONSTRAINT "debriefing_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "notification_type" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "entity_type" TEXT,
    "entity_id" INTEGER,
    "sent_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" SERIAL NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "entity_type" TEXT,
    "entity_id" INTEGER,
    "ip_address" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "performed_by" INTEGER NOT NULL,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "bidders_user_id_key" ON "bidders"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "procurement_officers_user_id_key" ON "procurement_officers"("user_id");

-- CreateIndex
CREATE INDEX "tenders_status_idx" ON "tenders"("status");

-- CreateIndex
CREATE INDEX "tenders_created_by_idx" ON "tenders"("created_by");

-- CreateIndex
CREATE INDEX "tenders_category_idx" ON "tenders"("category");

-- CreateIndex
CREATE INDEX "tender_addenda_tender_id_idx" ON "tender_addenda"("tender_id");

-- CreateIndex
CREATE INDEX "clarifications_tender_id_idx" ON "clarifications"("tender_id");

-- CreateIndex
CREATE INDEX "bids_tender_id_idx" ON "bids"("tender_id");

-- CreateIndex
CREATE INDEX "bids_bidder_id_idx" ON "bids"("bidder_id");

-- CreateIndex
CREATE UNIQUE INDEX "bids_tender_id_bidder_id_key" ON "bids"("tender_id", "bidder_id");

-- CreateIndex
CREATE INDEX "bid_documents_bid_id_idx" ON "bid_documents"("bid_id");

-- CreateIndex
CREATE INDEX "evaluation_committee_assignments_tender_id_idx" ON "evaluation_committee_assignments"("tender_id");

-- CreateIndex
CREATE UNIQUE INDEX "evaluation_committee_assignments_tender_id_user_id_key" ON "evaluation_committee_assignments"("tender_id", "user_id");

-- CreateIndex
CREATE INDEX "evaluations_bid_id_idx" ON "evaluations"("bid_id");

-- CreateIndex
CREATE INDEX "evaluations_evaluator_id_idx" ON "evaluations"("evaluator_id");

-- CreateIndex
CREATE UNIQUE INDEX "evaluations_bid_id_evaluator_id_evaluation_type_key" ON "evaluations"("bid_id", "evaluator_id", "evaluation_type");

-- CreateIndex
CREATE UNIQUE INDEX "evaluation_summaries_bid_id_key" ON "evaluation_summaries"("bid_id");

-- CreateIndex
CREATE INDEX "evaluation_summaries_tender_id_idx" ON "evaluation_summaries"("tender_id");

-- CreateIndex
CREATE UNIQUE INDEX "debriefing_requests_bid_id_key" ON "debriefing_requests"("bid_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "audit_logs_performed_by_idx" ON "audit_logs"("performed_by");

-- CreateIndex
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- AddForeignKey
ALTER TABLE "bidders" ADD CONSTRAINT "bidders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procurement_officers" ADD CONSTRAINT "procurement_officers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenders" ADD CONSTRAINT "tenders_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tender_addenda" ADD CONSTRAINT "tender_addenda_tender_id_fkey" FOREIGN KEY ("tender_id") REFERENCES "tenders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tender_addenda" ADD CONSTRAINT "tender_addenda_issued_by_fkey" FOREIGN KEY ("issued_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clarifications" ADD CONSTRAINT "clarifications_tender_id_fkey" FOREIGN KEY ("tender_id") REFERENCES "tenders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clarifications" ADD CONSTRAINT "clarifications_asked_by_fkey" FOREIGN KEY ("asked_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clarifications" ADD CONSTRAINT "clarifications_answered_by_fkey" FOREIGN KEY ("answered_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bids" ADD CONSTRAINT "bids_tender_id_fkey" FOREIGN KEY ("tender_id") REFERENCES "tenders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bids" ADD CONSTRAINT "bids_bidder_id_fkey" FOREIGN KEY ("bidder_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bid_documents" ADD CONSTRAINT "bid_documents_bid_id_fkey" FOREIGN KEY ("bid_id") REFERENCES "bids"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_committee_assignments" ADD CONSTRAINT "evaluation_committee_assignments_tender_id_fkey" FOREIGN KEY ("tender_id") REFERENCES "tenders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_committee_assignments" ADD CONSTRAINT "evaluation_committee_assignments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_committee_assignments" ADD CONSTRAINT "evaluation_committee_assignments_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_bid_id_fkey" FOREIGN KEY ("bid_id") REFERENCES "bids"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_evaluator_id_fkey" FOREIGN KEY ("evaluator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_summaries" ADD CONSTRAINT "evaluation_summaries_bid_id_fkey" FOREIGN KEY ("bid_id") REFERENCES "bids"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_summaries" ADD CONSTRAINT "evaluation_summaries_tender_id_fkey" FOREIGN KEY ("tender_id") REFERENCES "tenders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debriefing_requests" ADD CONSTRAINT "debriefing_requests_bid_id_fkey" FOREIGN KEY ("bid_id") REFERENCES "bids"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debriefing_requests" ADD CONSTRAINT "debriefing_requests_bidder_id_fkey" FOREIGN KEY ("bidder_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debriefing_requests" ADD CONSTRAINT "debriefing_requests_responded_by_fkey" FOREIGN KEY ("responded_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
