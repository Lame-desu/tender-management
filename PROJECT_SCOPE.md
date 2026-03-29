# Online Tender Management System - Project Scope

## Overview

A web-based system that digitizes the public tendering process — from tender creation and publication through bid submission, committee-based evaluation, and winner selection. The system replaces manual, paper-based procurement workflows with a centralized platform where bidders, procurement officers, evaluation committee members, and administrators interact transparently.

**No online payment processing. No AI-based evaluation. No contract management after award.**

---

## System Actors

### 1. Bidder (Vendor)
External users who participate in procurement. Can be a **registered company, sole proprietor, partnership, or individual consultant**. They browse tenders, ask clarifications, submit bids, and track results.

### 2. Procurement Officer
Internal staff of the procuring organization. Responsible for creating tenders, publishing them, managing the clarification period, issuing addenda, opening bids, and managing the overall tender process. They do NOT evaluate bids alone — they facilitate the process.

### 3. Evaluation Committee Member
Internal or external experts appointed per tender. They independently score and evaluate bids based on predefined criteria. A tender must have **at least 3 committee members**. They only see bids for tenders they are assigned to.

### 4. System Administrator
Manages the platform: user accounts, roles, system configuration, and audit logs. Does NOT participate in tender or bid operations.

---

## What Each Actor Can Do

### Bidder (Vendor)

| Action | Description |
|--------|-------------|
| Register | Create account — as an organization (company name, TIN, trade license) OR as an individual consultant (name, profession, ID) |
| Login / Logout | Secure authentication |
| Browse Published Tenders | View all open tenders with details, deadlines, eligibility criteria, and required documents |
| Ask Clarification | Submit a written question about a tender during the clarification period |
| View Clarifications | See all Q&A for a tender (questions are anonymous, answers visible to all) |
| Submit Bid | Submit technical proposal and financial proposal (two-envelope) with documents before the deadline |
| View My Bids | Track status of own submitted bids |
| Receive Notifications | Tender publications, clarifications, addenda, bid results, deadline reminders |
| View Results | See evaluation outcome and own scores after award is published |
| Request Debriefing | After results are published, request an explanation for why they were not selected |

### Procurement Officer

| Action | Description |
|--------|-------------|
| Login / Logout | Secure authentication |
| Create Tender | Define title, description, category, eligibility criteria, required documents, evaluation criteria with weights, submission deadline, clarification deadline, bid security requirement |
| Publish Tender | Move a draft tender to published status — visible to all bidders |
| Issue Addendum | Modify a published tender (change specs, extend deadline) — all bidders notified |
| Manage Clarifications | View bidder questions, post answers (visible to all bidders, questioner stays anonymous) |
| Close Bidding | Manually close bidding or system auto-closes at deadline |
| Open Bids | Initiate the bid opening step — record which bids were received, log key details (bidder name, bid amount, bid security status) |
| Assign Evaluation Committee | Select and assign committee members for a specific tender |
| View Evaluation Progress | Monitor whether all committee members have completed scoring |
| Publish Results | After committee evaluation and winner selection, publish the award decision |
| Respond to Debriefing Requests | Provide written explanation to bidders who request debriefing |
| Generate Reports | Tender summaries, bid statistics, evaluation reports, procurement activity reports |
| Receive Notifications | New bid submissions, clarification questions, evaluation completion |

### Evaluation Committee Member

| Action | Description |
|--------|-------------|
| Login / Logout | Secure authentication |
| View Assigned Tenders | See only the tenders they are assigned to evaluate |
| Evaluate Technical Proposals | Score each bid's technical proposal against predefined criteria, write remarks |
| View Financial Proposals | Only after technical evaluation is complete — see financial details of technically qualified bids |
| Evaluate Financial Proposals | Score financial proposals |
| Recommend Winner | After all scoring, the committee's combined scores determine ranking; the lead evaluator or procurement officer confirms the recommendation |
| Sign Off Evaluation | Confirm their evaluation is final |

### System Administrator

| Action | Description |
|--------|-------------|
| Login / Logout | Secure authentication |
| Manage User Accounts | Create, update, activate, deactivate accounts for all user types |
| Assign Roles | Set user roles (Bidder, Procurement Officer, Evaluation Committee Member, Admin) |
| Manage Categories | Configure tender categories (Goods, Works, Consulting Services) |
| Monitor System Activity | View active users, recent actions, system health |
| View Audit Logs | Access detailed logs of all actions with timestamps, user info, IP addresses |

---

## Entities and Their Relationships

### Core Entities

1. **User** — Base entity for all system users
   - Fields: userId, fullName, email, password (hashed), role, status (Active/Inactive), createdAt

2. **Bidder** — Extends User
   - Fields: bidderId, bidderType (Organization/Individual), organizationName (nullable), tinNumber, tradeLicenseNumber (nullable), contactPerson, phoneNumber, address, userId (FK)

3. **Procurement Officer** — Extends User
   - Fields: officerId, department, position, organizationName, userId (FK)

4. **Tender** — A procurement opportunity
   - Fields: tenderId, title, description, category (Goods/Works/Consulting), eligibilityCriteria, requiredDocuments, evaluationCriteria (JSON - criteria name + weight), bidSecurityRequired (boolean), bidSecurityAmount, publishDate, clarificationDeadline, submissionDeadline, status (Draft/Published/Under Evaluation/Awarded/Cancelled), createdBy (FK), createdAt

5. **Tender Addendum** — Modifications to a published tender
   - Fields: addendumId, tenderId (FK), addendumNumber, description, issuedDate, issuedBy (FK)

6. **Clarification** — Q&A on a tender
   - Fields: clarificationId, tenderId (FK), question, answer (nullable), askedBy (FK), answeredBy (FK, nullable), askedDate, answeredDate (nullable)

7. **Bid** — A bidder's submission
   - Fields: bidId, tenderId (FK), bidderId (FK), technicalProposal (text/summary), bidAmount, bidSecurityInfo (text - bank guarantee reference, etc.), submissionDate, status (Submitted/Technically Qualified/Technically Disqualified/Evaluated/Selected/Not Selected), createdAt

8. **Bid Document** — Files attached to a bid
   - Fields: documentId, bidId (FK), fileName, fileType, fileSize, documentCategory (Technical/Financial/BidSecurity/Other), uploadDate

9. **Evaluation Committee Assignment** — Links committee members to tenders
   - Fields: assignmentId, tenderId (FK), userId (FK), assignedDate, assignedBy (FK)

10. **Evaluation** — A committee member's individual scoring of a bid
    - Fields: evaluationId, bidId (FK), evaluatorId (FK), criteriaScores (JSON - criteria name + score), totalScore, remarks, evaluationType (Technical/Financial), evaluationDate

11. **Evaluation Summary** — Aggregated result per bid
    - Fields: summaryId, bidId (FK), tenderId (FK), avgTechnicalScore, avgFinancialScore, combinedScore, rank, isTechnicallyQualified (boolean), isWinner (boolean)

12. **Debriefing Request** — Bidder requests explanation of results
    - Fields: requestId, bidId (FK), bidderId (FK), requestDate, response (nullable), respondedBy (FK, nullable), respondedDate (nullable)

13. **Notification** — System alerts
    - Fields: notificationId, message, notificationType, isRead, sentDate, userId (FK)

14. **Audit Log** — Action trail
    - Fields: logId, action, details, entityType, entityId, timestamp, performedBy (FK), ipAddress

### Entity Relationships

```
User (1) ──── (0..1) Bidder
User (1) ──── (0..1) Procurement Officer
Procurement Officer (1) ──── (*) Tender                [creates]
Tender (1) ──── (*) Tender Addendum                    [can be amended]
Tender (1) ──── (*) Clarification                      [Q&A]
Tender (1) ──── (*) Bid                                [receives bids]
Bidder (1) ──── (*) Bid                                [submits bids]
Bid (1) ──── (*) Bid Document                          [has attachments]
Tender (1) ──── (*) Evaluation Committee Assignment    [has committee]
Bid (1) ──── (*) Evaluation                            [scored by each member]
Bid (1) ──── (0..1) Evaluation Summary                 [aggregated result]
Bid (1) ──── (0..1) Debriefing Request                 [post-award]
User (1) ──── (*) Notification
User (1) ──── (*) Audit Log
```

---

## Tender Lifecycle

```
[Draft] → [Published] → [Clarification Period] → [Open for Bids] → [Bid Opening]
    → [Technical Evaluation] → [Financial Evaluation] → [Award Decision] → [Results Published]
```

### Step-by-Step

1. **Procurement Officer creates tender** → Status: **Draft**
   - Fills in all details: title, description, category, eligibility, evaluation criteria with weights, deadlines, bid security requirement

2. **Procurement Officer publishes tender** → Status: **Published**
   - Tender becomes visible to all registered bidders
   - Clarification period begins (bidders can ask questions)
   - System notifies all bidders

3. **Clarification period** (from publish date until clarification deadline)
   - Bidders submit written questions
   - Procurement Officer posts answers — visible to ALL bidders, questioner identity hidden
   - If answers require changes to the tender → Procurement Officer issues an **Addendum**
   - Addendum may extend the submission deadline

4. **Bid submission period** (from publish date until submission deadline)
   - Bidders prepare and submit bids with:
     - Technical proposal documents
     - Financial proposal (bid amount)
     - Bid security information (bank guarantee reference number, issuing bank, amount, validity)
     - Any other required documents
   - System enforces: no submission after deadline, no duplicate bids, all required fields filled

5. **Submission deadline passes** → Bidding closes automatically
   - No more bids accepted

6. **Bid opening** — Procurement Officer initiates
   - System records: number of bids received, bidder names, bid amounts, bid security status
   - Bid opening record is generated (viewable by bidders for transparency)

7. **Procurement Officer assigns evaluation committee** (minimum 3 members)

8. **Technical evaluation** → Status: **Under Evaluation**
   - Each committee member independently scores every bid's technical proposal
   - Scoring based on predefined criteria and weights set during tender creation
   - Committee members write remarks for each bid
   - System calculates average technical scores
   - Bids below the minimum qualifying score (set in tender, e.g., 70%) are marked **Technically Disqualified**
   - Financial proposals of disqualified bids remain sealed/hidden

9. **Financial evaluation** (only for technically qualified bids)
   - Committee members can now see financial proposals of qualified bids
   - Financial scores calculated (lowest price gets highest score)
   - Combined score = (Technical Weight % × Technical Score) + (Financial Weight % × Financial Score)

10. **Award decision**
    - System ranks bids by combined score
    - Highest-ranked bid is recommended as winner
    - Procurement Officer reviews and confirms the recommendation → Status: **Awarded**

11. **Results published**
    - All bidders notified of the outcome
    - Winning bidder name and contract value made visible
    - Losing bidders can see their own scores and ranking
    - Debriefing request option becomes available for losing bidders

---

## Bid Lifecycle

```
[Submitted] → [Opened] → [Under Technical Evaluation]
    → [Technically Qualified] or [Technically Disqualified]
    → (if qualified) [Under Financial Evaluation]
    → [Evaluated] → [Selected] or [Not Selected]
```

---

## Complete Use Case Flows

### UC-1: Bidder Registration

1. Bidder opens registration page
2. Bidder selects account type: **Organization** or **Individual Consultant**
3. **If Organization**: fills in company name, TIN, trade license number, contact person, phone, address, email, password
4. **If Individual**: fills in full name, profession/expertise, national ID, phone, address, email, password
5. System validates: required fields, email format, unique email, valid TIN format
6. System creates account with status = **Pending** (admin must verify and activate)
7. System shows "Registration submitted, pending verification" message
8. Admin reviews and activates the account
9. System notifies bidder that their account is active
- **Error**: Invalid data or duplicate email → show specific error

### UC-2: Login (All Actors)

1. User opens login page
2. User enters email and password
3. System validates credentials
4. System checks account status (must be Active)
5. System authenticates user and redirects to role-appropriate dashboard
- **Error**: Invalid credentials → show error
- **Error**: Account inactive/pending → show "Account not active" message

### UC-3: Browse Published Tenders (Bidder)

1. Bidder navigates to tender listing page
2. System displays all published tenders (title, category, deadline, status)
3. Bidder can filter by category (Goods/Works/Consulting) and search by keyword
4. Bidder clicks a tender to see full details:
   - Description, eligibility criteria, required documents, evaluation criteria and weights
   - Bid security requirement and amount
   - Clarification deadline, submission deadline
   - Any addenda issued
   - All clarifications (Q&A)
- **Empty state**: No tenders → show message

### UC-4: Ask Clarification (Bidder)

1. Bidder opens a published tender's detail page
2. System checks: clarification deadline has NOT passed
3. Bidder types and submits a question
4. System saves the question (bidder identity hidden from other bidders)
5. System notifies the Procurement Officer of the new question
6. Procurement Officer reviews and posts an answer
7. Answer becomes visible to ALL bidders on the tender page
8. System notifies all bidders who have viewed this tender
- **Error**: Clarification period closed → disable question form

### UC-5: Issue Addendum (Procurement Officer)

1. Officer opens a published tender
2. Officer selects "Issue Addendum"
3. Officer describes the changes (specification changes, deadline extension, etc.)
4. System saves the addendum with a sequential number (Addendum #1, #2, etc.)
5. If deadline is extended, system updates the submission deadline
6. System notifies ALL bidders about the addendum
7. Addendum is visible on the tender detail page

### UC-6: Submit Bid (Bidder)

1. Bidder opens a published tender
2. System checks: submission deadline has NOT passed, bidder has NOT already submitted for this tender, bidder meets eligibility (account is active)
3. System displays bid submission form with sections:
   - **Technical Proposal**: text summary + document uploads (PDF, DOCX)
   - **Financial Proposal**: bid amount
   - **Bid Security**: bank guarantee reference number, issuing bank, amount, validity date (if required by tender)
   - **Supporting Documents**: any additional required files
4. Bidder fills in all sections and uploads documents
5. Bidder reviews and submits
6. System validates: all required fields filled, all required documents uploaded, valid file formats and sizes
7. System saves the bid with status = **Submitted**
8. System sends confirmation notification to bidder
- **Error**: Deadline passed → reject
- **Error**: Already submitted → reject with message
- **Error**: Missing required documents → show which ones are missing

### UC-7: Bid Opening (Procurement Officer)

1. Submission deadline has passed
2. Officer opens the tender and selects "Open Bids"
3. System displays all received bids with:
   - Bidder name/organization
   - Bid amount
   - Bid security status (provided/not provided)
   - Submission timestamp
   - Number of documents attached
4. Officer confirms the bid opening
5. System generates a **Bid Opening Record** (date, time, list of bids, key details)
6. Bid opening record is saved and visible to bidders for transparency
7. All bid statuses change to **Opened**

### UC-8: Assign Evaluation Committee (Procurement Officer)

1. Officer opens a tender that has been through bid opening
2. Officer selects "Assign Evaluation Committee"
3. System displays list of users with the Evaluation Committee Member role
4. Officer selects at least 3 members
5. System saves the assignments
6. System notifies each committee member that they have been assigned
- **Error**: Fewer than 3 members selected → prevent assignment

### UC-9: Technical Evaluation (Evaluation Committee Member)

1. Committee member opens their assigned tender
2. System displays all submitted bids (technical documents only — financial proposals are hidden)
3. For each bid, the member:
   - Reviews technical proposal documents
   - Scores each evaluation criterion (system shows criteria names and max scores from the tender)
   - Writes remarks/justification for scores
   - Submits their evaluation
4. System saves individual scores
5. Once ALL committee members have completed scoring:
   - System calculates average technical score per bid
   - Bids meeting the minimum qualifying score → **Technically Qualified**
   - Bids below threshold → **Technically Disqualified**
6. System notifies Procurement Officer that technical evaluation is complete
- **Error**: Cannot submit without scoring all criteria → validation error

### UC-10: Financial Evaluation (Evaluation Committee Member)

1. Technical evaluation is complete
2. Committee member opens the tender
3. System now reveals financial proposals of **technically qualified bids only**
4. System calculates financial scores automatically:
   - Formula: Financial Score = (Lowest Bid Amount / This Bid's Amount) × 100
5. System calculates the combined score per bid:
   - Combined = (Technical Weight × Technical Score) + (Financial Weight × Financial Score)
6. System ranks all qualified bids by combined score
7. Committee members review and confirm the ranking
- **Note**: Disqualified bids' financial proposals remain hidden

### UC-11: Award Decision (Procurement Officer)

1. Officer opens evaluation results
2. System displays ranked list of bids with scores and recommendation
3. Officer reviews the evaluation and committee remarks
4. Officer confirms the highest-ranked bid as the winner
5. System updates:
   - Winning bid status → **Selected**
   - Other bids → **Not Selected**
   - Tender status → **Awarded**
6. System generates an **Evaluation Report** (all scores, rankings, committee remarks)
- **Error**: Not all evaluations complete → prevent award

### UC-12: Publish Results (Procurement Officer)

1. After award decision, officer selects "Publish Results"
2. System notifies ALL bidders:
   - Winning bidder: "Congratulations, your bid has been selected"
   - Other bidders: "Your bid was not selected. You may request a debriefing."
3. All bidders can now see:
   - Winner name and bid amount
   - Their own scores and ranking
   - The evaluation criteria used
4. Debriefing request option becomes available

### UC-13: Request Debriefing (Bidder)

1. Bidder views their bid result (Not Selected)
2. Bidder clicks "Request Debriefing"
3. System creates a debriefing request
4. Procurement Officer is notified
5. Officer writes a response explaining:
   - Where the bidder's proposal was weak
   - What the winning bid's strengths were (without revealing confidential details)
6. Bidder receives the debriefing response
- **Note**: This is informational only. No formal appeal/complaint mechanism in this system.

### UC-14: Generate Reports (Procurement Officer)

1. Officer selects "Reports" from dashboard
2. Available report types:
   - **Tender Summary Report**: all tenders with status, bid counts, winner
   - **Bid Evaluation Report**: per-tender detailed evaluation scores and ranking
   - **Procurement Activity Report**: tenders created/published/awarded in a date range
   - **Bidder Participation Report**: which bidders bid on which tenders
3. Officer selects report type and parameters (date range, category, status)
4. System generates the report with tables and summary statistics
5. Officer can view on screen and export as PDF
- **Empty state**: No data for criteria → show message

### UC-15: Manage User Accounts (System Administrator)

1. Admin opens user management
2. System displays all users with filters (by role, status)
3. Admin can:
   - **View** registration details (for bidder verification: TIN, trade license)
   - **Activate** a pending bidder account (after verifying documents)
   - **Deactivate** any account
   - **Update** user information
   - **Create** internal user accounts (Procurement Officers, Committee Members, other Admins)
4. System validates and saves changes
5. Affected user is notified of account status changes
- **Error**: Invalid data → show error

### UC-16: Assign User Roles (System Administrator)

1. Admin selects a user account
2. System shows current role and available roles
3. Admin assigns or changes role (Bidder, Procurement Officer, Evaluation Committee Member, Admin)
4. System updates access privileges
5. System saves changes

### UC-17: Monitor System Activity (System Administrator)

1. Admin opens monitoring dashboard
2. System displays: active users count, recent actions, tenders by status, system events
3. Admin can filter and search

### UC-18: View Audit Logs (System Administrator)

1. Admin opens audit log module
2. System displays logs: action type, user, target entity, timestamp, IP address
3. Admin can filter by: user, action type, date range, entity
4. Admin can search logs
5. Admin can export logs

### UC-19: Logout (All Actors)

1. User clicks logout
2. System terminates session and clears authentication
3. System redirects to login page
- **Auto-logout**: Session timeout after inactivity

---

## Evaluation Process (Detailed)

This is the most critical part of the system. Here's exactly how it works:

### Setup (During Tender Creation)

The Procurement Officer defines:
- **Evaluation criteria** with names and weights (e.g., Methodology 30%, Experience 25%, Personnel 25%, Work Plan 20%)
- **Minimum technical qualifying score** (e.g., 70 out of 100)
- **Technical vs Financial weight split** (e.g., Technical 80%, Financial 20%)

### Technical Evaluation Phase

1. Each committee member **independently** scores each bid
2. They do NOT see other members' scores until they submit their own
3. Each criterion is scored out of its maximum weight
4. System calculates: `Average Technical Score = sum of all members' total scores / number of members`
5. Bids with average score >= minimum → **Technically Qualified**
6. Bids below → **Technically Disqualified** (their financial proposals stay hidden)

### Financial Evaluation Phase

1. Only for technically qualified bids
2. Financial score formula: `Financial Score = (Lowest Price / Bidder's Price) × 100`
3. Combined score: `Combined = (Tech Weight × Avg Tech Score) + (Financial Weight × Financial Score)`
4. Bids ranked by combined score (highest = recommended winner)

### Example

| Bidder | Avg Tech Score | Qualified? | Bid Amount | Financial Score | Combined (80/20) | Rank |
|--------|---------------|------------|------------|----------------|------------------|------|
| A | 82 | Yes | 500,000 | 90 | 83.6 | 2 |
| B | 75 | Yes | 450,000 | 100 | 80.0 | 3 |
| C | 88 | Yes | 480,000 | 93.75 | 89.15 | 1 |
| D | 65 | No (< 70) | — | — | — | — |

Winner: Bidder C

---

## Reports

### Who Generates What

| Report | Generated By | Purpose |
|--------|-------------|---------|
| Tender Summary Report | Procurement Officer | Overview of all tenders — status, bid counts, winners |
| Bid Evaluation Report | System (auto-generated after award) | Detailed per-tender evaluation: all scores, rankings, committee remarks. The official record. |
| Procurement Activity Report | Procurement Officer | Activity in a date range — tenders created, published, awarded, cancelled |
| Bidder Participation Report | Procurement Officer | Track which bidders participate in which tenders |
| Bid Opening Record | System (auto-generated) | Record of bid opening: bidder names, amounts, timestamps |
| Audit Trail Report | System Administrator | System activity and user action logs for compliance |

### Report Visibility

- Procurement Officers see all procurement reports
- Bidders see: bid opening record (for their tenders), their own evaluation results
- Admins see: audit and system reports
- Evaluation Committee Members see: evaluation results for their assigned tenders

---

## Notification Triggers

| Event | Who Gets Notified |
|-------|-------------------|
| New tender published | All active bidders |
| Addendum issued | All bidders who viewed the tender |
| Clarification answered | All bidders who viewed the tender |
| New clarification question | Procurement Officer for that tender |
| Bid submitted | The bidder who submitted + Procurement Officer |
| Submission deadline approaching (24h) | Bidders who viewed the tender but haven't submitted |
| Submission deadline passed | Procurement Officer |
| Evaluation committee assigned | Assigned committee members |
| Technical evaluation complete | Procurement Officer |
| All evaluations complete | Procurement Officer |
| Award decision made / results published | ALL bidders for that tender |
| Debriefing requested | Procurement Officer |
| Debriefing response sent | The requesting bidder |
| Account activated | The bidder |
| Account deactivated | The affected user |

---

## Access Control Matrix

| Feature | Bidder | Procurement Officer | Eval. Committee Member | Admin |
|---------|--------|-------------------|----------------------|-------|
| Register (self) | Yes | No | No | No |
| Login / Logout | Yes | Yes | Yes | Yes |
| Browse Published Tenders | Yes | Yes | No | No |
| Ask Clarification | Yes | No | No | No |
| Answer Clarification | No | Yes | No | No |
| Submit Bid | Yes | No | No | No |
| View Own Bids | Yes | No | No | No |
| Create/Edit Tender | No | Yes | No | No |
| Publish Tender | No | Yes | No | No |
| Issue Addendum | No | Yes | No | No |
| Open Bids | No | Yes | No | No |
| Assign Eval Committee | No | Yes | No | No |
| Evaluate Bids (Technical) | No | No | Yes | No |
| Evaluate Bids (Financial) | No | No | Yes | No |
| Confirm Award | No | Yes | No | No |
| Publish Results | No | Yes | No | No |
| Request Debriefing | Yes | No | No | No |
| Respond to Debriefing | No | Yes | No | No |
| Generate Reports | No | Yes | No | No |
| View Bid Opening Record | Yes | Yes | Yes | No |
| Manage Users | No | No | No | Yes |
| Assign Roles | No | No | No | Yes |
| View Audit Logs | No | No | No | Yes |
| Monitor System | No | No | No | Yes |
| Receive Notifications | Yes | Yes | Yes | Yes |

---

## Validation Rules

### Tender Rules
- Tenders cannot be published without: title, description, eligibility criteria, at least one evaluation criterion, submission deadline, clarification deadline
- Clarification deadline must be before submission deadline
- Submission deadline must be in the future when publishing
- Published tenders can only be modified via addenda (not direct edit)
- Draft tenders can be freely edited

### Bid Rules
- No submission after the tender deadline (enforced by system)
- One bid per bidder per tender (no duplicates)
- All required documents must be uploaded
- Bid security info is required if the tender requires it
- Supported file formats: PDF, DOCX, XLSX, JPG, PNG (max size per file enforced)

### Evaluation Rules
- Evaluation cannot start until bid opening is complete
- Technical evaluation must complete before financial proposals are revealed
- Each committee member must score ALL criteria for ALL bids before submitting
- Financial evaluation only includes technically qualified bids
- Award cannot be made until all committee members complete evaluation
- Minimum 3 committee members per tender

### User Rules
- Bidder accounts require admin verification before activation
- Passwords must be hashed
- Session timeout after inactivity
- All significant actions logged to audit trail
- Users can only access features permitted by their role

---

## Out of Scope (Explicitly Excluded)

- Online payment processing (bid security deposits, tender fees)
- AI/ML-based automated bid evaluation
- Contract management after award
- Integration with external systems (IFMIS, PPPAA portal, banks)
- Pre-qualification / Expression of Interest stage
- Multi-language support (Amharic)
- Mobile app (responsive web only)
- Formal complaint/appeal mechanism (debriefing is supported, but not legal appeals)
- Bid withdrawal/modification after submission
- Domestic preference margin calculation
- Reverse auction
- Framework agreements
