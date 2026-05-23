// ─── ENUMS ────────────────────────────────────────────────────────────────────

export enum Role {
  ADMIN = "ADMIN",
  PROCUREMENT_OFFICER = "PROCUREMENT_OFFICER",
  EVALUATOR = "EVALUATOR",
  BIDDER = "BIDDER",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  PENDING = "PENDING",
  PENDING_VERIFICATION = "PENDING_VERIFICATION",
  INVITED = "INVITED",
}

export enum BidderType {
  ORGANIZATION = "ORGANIZATION",
  INDIVIDUAL = "INDIVIDUAL",
}

export enum TenderCategory {
  GOODS = "GOODS",
  WORKS = "WORKS",
  CONSULTING = "CONSULTING",
}

export enum TenderStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  UNDER_EVALUATION = "UNDER_EVALUATION",
  AWARDED = "AWARDED",
  CANCELLED = "CANCELLED",
}

export enum BidStatus {
  SUBMITTED = "SUBMITTED",
  OPENED = "OPENED",
  TECHNICALLY_QUALIFIED = "TECHNICALLY_QUALIFIED",
  TECHNICALLY_DISQUALIFIED = "TECHNICALLY_DISQUALIFIED",
  EVALUATED = "EVALUATED",
  SELECTED = "SELECTED",
  NOT_SELECTED = "NOT_SELECTED",
}

export enum DocumentCategory {
  TECHNICAL = "TECHNICAL",
  FINANCIAL = "FINANCIAL",
  BID_SECURITY = "BID_SECURITY",
  OTHER = "OTHER",
}

export enum EvaluationType {
  TECHNICAL = "TECHNICAL",
  FINANCIAL = "FINANCIAL",
}

// ─── MODELS ───────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  bidderProfile?: Bidder;
  officerProfile?: ProcurementOfficer;
}

export interface Bidder {
  id: number;
  bidderType: BidderType;
  organizationName?: string;
  tinNumber: string;
  tradeLicenseNumber?: string;
  contactPerson: string;
  phoneNumber: string;
  address: string;
  userId: number;
}

export interface ProcurementOfficer {
  id: number;
  department: string;
  position: string;
  organizationName: string;
  userId: number;
}

export interface EvaluationCriteria {
  name: string;
  weight: number;
}

export interface Tender {
  id: number;
  title: string;
  description: string;
  category: TenderCategory;
  eligibilityCriteria: string;
  requiredDocuments: string[];
  evaluationCriteria: EvaluationCriteria[];
  minimumTechnicalScore: number;
  technicalWeight: number;
  financialWeight: number;
  bidSecurityRequired: boolean;
  bidSecurityAmount?: number;
  publishDate?: string;
  clarificationDeadline: string;
  submissionDeadline: string;
  status: TenderStatus;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  createdUser?: User;
  addenda?: TenderAddendum[];
  clarifications?: Clarification[];
  _count?: { bids: number; addenda: number; clarifications: number };
}

export interface TenderAddendum {
  id: number;
  addendumNumber: number;
  description: string;
  newDeadline?: string;
  issuedDate: string;
  tenderId: number;
  issuedBy: number;
  issuedUser?: User;
}

export interface Clarification {
  id: number;
  question: string;
  answer?: string;
  askedDate: string;
  answeredDate?: string;
  tenderId: number;
  askedBy: number;
  answeredBy?: number;
  askedUser?: User;
  answeredUser?: User;
}

export interface Bid {
  id: number;
  technicalProposal: string;
  bidAmount: number;
  bidSecurityInfo?: string;
  submissionDate: string;
  status: BidStatus;
  createdAt: string;
  tenderId: number;
  bidderId: number;
  tender?: Tender;
  bidOwner?: User;
  documents?: BidDocument[];
  evaluationSummary?: EvaluationSummary;
  debriefingRequest?: DebriefingRequest;
}

export interface BidDocument {
  id: number;
  fileName: string;
  fileType: string;
  filePath: string;
  fileSize: number;
  documentCategory: DocumentCategory;
  uploadDate: string;
  bidId: number;
}

export interface EvaluationCommitteeAssignment {
  id: number;
  assignedDate: string;
  tenderId: number;
  userId: number;
  assignedBy: number;
  user?: User;
}

export interface CriteriaScore {
  criteriaName: string;
  score: number;
}

export interface Evaluation {
  id: number;
  criteriaScores: CriteriaScore[];
  totalScore: number;
  remarks?: string;
  evaluationType: EvaluationType;
  evaluationDate: string;
  bidId: number;
  evaluatorId: number;
  evaluator?: User;
}

export interface EvaluationSummary {
  id: number;
  avgTechnicalScore: number;
  avgFinancialScore?: number;
  combinedScore?: number;
  rank?: number;
  isTechnicallyQualified: boolean;
  isWinner: boolean;
  bidId: number;
  tenderId: number;
}

export interface DebriefingRequest {
  id: number;
  requestDate: string;
  response?: string;
  respondedDate?: string;
  bidId: number;
  bidderId: number;
  respondedBy?: number;
  bidOwner?: User;
  respondedUser?: User;
  bid?: Bid;
}

export interface Notification {
  id: number;
  message: string;
  notificationType: string;
  isRead: boolean;
  entityType?: string;
  entityId?: number;
  sentDate: string;
  userId: number;
}

export interface AuditLog {
  id: number;
  action: string;
  details?: string;
  entityType?: string;
  entityId?: number;
  ipAddress?: string;
  timestamp: string;
  performedBy: number;
  performedUser?: User;
}

// ─── API RESPONSE TYPES ──────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    items: T[];
    total: number;
    page: number;
    totalPages: number;
  };
}
