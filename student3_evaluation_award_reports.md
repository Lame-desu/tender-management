# ⚖️ Student 3: Bid Evaluation, Award Decision & Reporting — Complete Defense Guide

> **Who is this for?** A student with ZERO technical background who needs to understand and defend this feature area in a final year project presentation.
>
> **Rule:** Every technical word is explained immediately in parentheses the first time it appears. If you see something you don't understand, keep reading — the explanation follows within the same sentence.

---

## TABLE OF CONTENTS

1. [What Is My Feature in Simple Words](#1-what-is-my-feature-in-simple-words)
2. [The Big Picture — How My Part Fits Into the Whole System](#2-the-big-picture)
3. [The Full Evaluation Process Explained Simply](#3-the-full-evaluation-process-explained-simply)
4. [How Committee Assignment Works](#4-how-committee-assignment-works)
5. [Every Screen the Evaluator Sees](#5-every-screen-the-evaluator-sees)
6. [How Technical Evaluation Works — End to End](#6-how-technical-evaluation-works)
7. [The Scoring Math Explained](#7-the-scoring-math-explained)
8. [How the System Determines Qualified vs. Disqualified Bids](#8-qualified-vs-disqualified)
9. [How Financial Evaluation Works](#9-how-financial-evaluation-works)
10. [How Winner Selection Works](#10-how-winner-selection-works)
11. [How Results Publishing Works](#11-how-results-publishing-works)
12. [How Debriefing Works](#12-how-debriefing-works)
13. [How Reports Work](#13-how-reports-work)
14. [How PDF Export Works](#14-how-pdf-export-works)
15. [The Database Tables — Your Spreadsheets](#15-the-database-tables)
16. [How the Files Connect to Each Other](#16-how-the-files-connect)
17. [The Evaluation Service Explained Function by Function](#17-the-evaluation-service-explained)
18. [Common Defense Questions and Answers](#18-common-defense-questions-and-answers)

---

## 1. What Is My Feature in Simple Words

Imagine a school talent show. Students performed, and now it's time to **judge them**, **pick a winner**, and **explain the results** to everyone.

**My feature is everything that happens AFTER companies submit their proposals and BEFORE the contract is signed.**

Think of it in 5 simple phases:

| Phase | What Happens | Real-Life Analogy |
|-------|-------------|------------------|
| **1. Pick the Judges** | Officer selects committee members | School principal picks 3 teachers to judge the talent show |
| **2. Score the Performances** | Each judge scores each contestant | Each teacher gives points for singing, dancing, creativity |
| **3. Check Who Passed** | System calculates averages and eliminates low scorers | Students who scored below 70% are eliminated |
| **4. Compare Prices** | System compares the price each company charges | Among remaining contestants, see who charges the lowest fee |
| **5. Announce the Winner** | Officer confirms winner; everyone gets notified | Principal announces the winner on the school PA system |

Plus two extra things:
- **Debriefing**: Losers can ask "Why did I lose?" and get a detailed explanation
- **Reports**: The officer can generate official documents summarizing everything

### In One Sentence
**I handle the judging, score calculation, winner selection, result announcement, feedback to losers, and official reporting.**

---

## 2. The Big Picture

```
┌─────────────────────────────────────────────────────────────────────┐
│                  ONLINE TENDER MANAGEMENT SYSTEM                    │
├──────────────┬──────────────────────────────────┬───────────────────┤
│  STUDENT 1   │         STUDENT 2                │  ★ STUDENT 3 ★   │
│              │                                  │     (ME)          │
│  Users &     │  Tender Publishing               │  Evaluation &     │
│  Auth &      │  &                               │  Award &          │
│  Admin       │  Bid Submission                   │  Reporting        │
│              │                                  │                   │
│  WHO can     │  WHAT is being bought             │  WHO wins         │
│  use the     │  and WHO offers to sell            │  and WHY          │
│  system      │                                  │                   │
├──────────────┼──────────────────────────────────┼───────────────────┤
│  Happens     │  Happens SECOND                   │  Happens LAST     │
│  FIRST       │  (after people have accounts)     │  (after bids      │
│              │                                  │   are submitted)  │
└──────────────┴──────────────────────────────────┴───────────────────┘
```

### The Talent Show Analogy (Complete)

| Part | Talent Show Equivalent | Who |
|------|----------------------|-----|
| Student 1 (Auth) | **Registering** contestants and audience members | Registration desk |
| Student 2 (Tender/Bids) | **Posting** the talent show announcement and **contestants performing** | Organizer + Performers |
| **Student 3 (Me)** | **Judges scoring**, **picking a winner**, **announcing results**, **answering "why did I lose?"**, and **writing the final report** | Judges + Announcer + Report Writer |

**Without me, bids just sit in a pile forever — nobody would ever be scored, no winner would be chosen, and no reports would exist.**

---

## 3. The Full Evaluation Process Explained Simply

Here's the complete journey, step by step:

```
  📦 BIDS OPENED        👥 COMMITTEE ASSIGNED      📝 TECHNICAL EVAL
  ┌─────────────┐       ┌─────────────┐           ┌─────────────┐
  │ Officer     │       │ Officer     │           │ Each judge  │
  │ clicks      │──────►│ picks 3+    │──────────►│ scores      │
  │ "Open Bids" │       │ judges      │           │ every bid   │
  │             │       │             │           │ independently│
  └─────────────┘       └─────────────┘           └──────┬──────┘
   Tender status:        Each judge                      │
   PUBLISHED →           gets notified                   │ All judges
   UNDER_EVALUATION      via 🔔                          │ completed?
                                                         ▼
                                                  ┌─────────────┐
                                                  │ Officer     │
                                                  │ clicks      │
                                                  │ "Finalize   │
                                                  │  Technical" │
                                                  └──────┬──────┘
                                                         │
                                                         ▼
                                               ┌──────────────────┐
                                               │ System calculates│
                                               │ AVERAGE scores   │
                                               │                  │
                                               │ Score >= 70?     │
                                               │ ✅ QUALIFIED     │
                                               │ Score < 70?      │
                                               │ ❌ DISQUALIFIED  │
                                               └────────┬─────────┘
                                                        │
                                                        ▼
                                               ┌──────────────────┐
                                               │ 💰 FINANCIAL     │
                                               │ EVALUATION       │
                                               │ (automatic)      │
                                               │                  │
                                               │ Compares prices  │
                                               │ Calculates       │
                                               │ combined scores  │
                                               │ Ranks all bids   │
                                               └────────┬─────────┘
                                                        │
                                                        ▼
                                               ┌──────────────────┐
                                               │ Officer clicks   │
                                               │ "Finalize        │
                                               │  Financial"      │
                                               └────────┬─────────┘
                                                        │
                                                        ▼
                                               ┌──────────────────┐
                                               │ 🏆 AWARD         │
                                               │ Officer confirms │
                                               │ Rank #1 = winner │
                                               │                  │
                                               │ Winner: SELECTED │
                                               │ Others: NOT_SEL  │
                                               │ Tender: AWARDED  │
                                               └────────┬─────────┘
                                                        │
                                                        ▼
                                               ┌──────────────────┐
                                               │ 📢 PUBLISH       │
                                               │ RESULTS          │
                                               │                  │
                                               │ Winner: 🎉       │
                                               │ Losers: 📧 + can │
                                               │ request debrief  │
                                               └──────────────────┘
```

---

## 4. How Committee Assignment Works

### What Is a Committee?

An **Evaluation Committee** is a group of people (at least 3) who are assigned to judge the bids. They must have the user role `EVALUATOR` and be `ACTIVE` in the system.

### Why At Least 3?

Having multiple judges ensures **fairness**. If only one person judged, they might be biased. With 3+ independent judges whose scores are averaged, the result is more objective. This mirrors real-world Ethiopian public procurement law.

### Step-by-Step Flow

```
 OFFICER opens the Tender Detail page → "Evaluation" tab
       │
       ▼
 Sees "Step 1: Evaluation Committee"
 (the committee section is empty — no one assigned yet)
       │
       ▼
 System shows a list of all ACTIVE EVALUATORS with checkboxes:
 ┌──────────────────────────────────────────────────┐
 │ Select at least 3 evaluators to form the committee│
 │                                                  │
 │ [☑] Dr. Abebe Kebede - abebe@gov.et              │
 │ [☑] Ato Dereje Hailu - dereje@gov.et              │
 │ [ ] W/ro Sara Tadesse - sara@gov.et               │
 │ [☑] Ato Yohannes Girma - yohannes@gov.et          │
 │                                                  │
 │ [Assign Committee (3 selected)]                   │
 └──────────────────────────────────────────────────┘
       │
       ▼ (clicks "Assign Committee")
       │
 Frontend sends: POST /api/tenders/5/committee
   { memberIds: [3, 7, 12] }
       │
       ▼
 evaluation.controller.ts → assignCommittee()
   → Validates: at least 3 members required (Zod schema)
       │
       ▼
 evaluation.service.ts → assignCommittee()
       │
       ├── CHECK 1: Tender exists? → No → Error: "Tender not found"
       ├── CHECK 2: Officer owns this tender? → No → Error: "Access denied"
       ├── CHECK 3: Tender status = UNDER_EVALUATION? → No → Error
       ├── CHECK 4: At least 3 members? → No → Error
       ├── CHECK 5: Remove duplicates (if same ID is sent twice)
       ├── CHECK 6: All IDs are real, active evaluators? → No → Error
       ├── CHECK 7: Committee not already assigned? → Already exists → Error
       │
       ├── CREATE entries in evaluation_committee_assignments table
       │   (one row per evaluator)
       │
       └── NOTIFY each evaluator:
             → "You have been assigned to evaluate: Office Supplies..."
             → notificationType: "COMMITTEE_ASSIGNED"

 Each evaluator's dashboard now shows this tender as
 "Pending Technical Evaluation"
```

### File Map

```
 📁 officer/tenders/[id]/page.tsx → CommitteeAssignForm component
     │ api.post("/tenders/{id}/committee")
     ▼
 📁 evaluation.routes.ts → router.post("/tenders/:tenderId/committee")
     ▼
 📁 evaluation.controller.ts → assignCommittee()
     ▼
 📁 evaluation.service.ts → assignCommittee()
     ▼
 🗄️ evaluation_committee_assignments table + notifications table
```

---

## 5. Every Screen the Evaluator Sees

### 5.1 Evaluator Dashboard

**File:** `frontend/src/app/(dashboard)/evaluator/dashboard/page.tsx`

This is the FIRST thing an evaluator sees when they log in.

```
┌────────────────────────────────────────────────────────────────┐
│  My Evaluations                                                │
│                                                                │
│  ┌───────────────────────────────┐  ┌────────────────────────┐ │
│  │ Office Furniture Supply       │  │ Road Rehabilitation    │ │
│  │              ┌──────────────┐ │  │         ┌────────────┐ │ │
│  │              │Pending Tech  │ │  │         │Technical   │ │ │
│  │              │Evaluation    │ │  │         │Submitted — │ │ │
│  │              └──────────────┘ │  │         │Awaiting    │ │ │
│  │ GOODS · 5 bid(s)             │  │         │others      │ │ │
│  │                               │  │         └────────────┘ │ │
│  │ [████████ Evaluate ████████] │  │ WORKS · 3 bid(s)       │ │
│  └───────────────────────────────┘  │                        │ │
│                                     │ [  View Submission  ]  │ │
│  ┌───────────────────────────────┐  └────────────────────────┘ │
│  │ IT Consulting Project         │                             │
│  │         ┌────────────────────┐│                             │
│  │         │Evaluation Complete ││                             │
│  │         └────────────────────┘│                             │
│  │ CONSULTING · 4 bid(s)        │                             │
│  │ [    View Results    ]        │                             │
│  └───────────────────────────────┘                             │
└────────────────────────────────────────────────────────────────┘
```

**Each card shows:**
- Tender title
- Status badge (color-coded)
- Category badge (GOODS/WORKS/CONSULTING)
- Number of bids to evaluate
- Action button that changes based on status

**The 5 possible status badges:**

| Status | Color | What It Means | Button Shown |
|--------|-------|--------------|-------------|
| `Awaiting Bid Opening` | ⚪ Grey | Bids haven't been opened yet — nothing to do | None |
| `Pending Technical Evaluation` | 🟡 Amber | Bids are open, waiting for YOUR scores | **"Evaluate"** (primary blue) |
| `Technical Submitted — Awaiting others` | 🔵 Blue | You finished, but other judges haven't yet | "View Submission" (outline) |
| `Financial Evaluation Available` | 🟦 Cyan | Technical is done, financial scores are ready to view | "View Results" (outline) |
| `Evaluation Complete` | 🟢 Green | Everything is finished | "View Results" (outline) |

**How the status is determined (in `evaluation.service.ts` → `getEvaluatorAssignments()`):**

```
 Is any bid status = EVALUATED?
   → Yes → "Evaluation Complete"

 Has technical evaluation been finalized (summaries exist)?
   → Yes → "Financial Evaluation Available"

 Has THIS evaluator scored ALL bids?
   → Yes → "Technical Submitted — Awaiting others"

 Are there opened bids (totalBids > 0)?
   → Yes → "Pending Technical Evaluation"

 Otherwise:
   → "Awaiting Bid Opening"
```

### 5.2 Evaluations List Page

**File:** `frontend/src/app/(dashboard)/evaluator/evaluations/page.tsx`

This is a simple **redirect page** — when evaluators visit `/evaluator/evaluations`, it automatically sends them to the dashboard (`/evaluator/dashboard`). Both URLs go to the same place.

### 5.3 Technical Evaluation Page (The Most Important Screen)

**File:** `frontend/src/app/(dashboard)/evaluator/tenders/[id]/evaluate/page.tsx`

This is where evaluators actually DO their work — scoring every bid.

```
┌────────────────────────────────────────────────────────────────────┐
│  Technical Evaluation                                              │
│  Supply of Office Furniture for Ministry of Education              │
│  [✅ Evaluation Submitted]  ← (only if already submitted)         │
│                                                                    │
│  ┌── Evaluation Criteria ─────────────────────────────────────────┐│
│  │ Criterion                                  Weight (Max Score)  ││
│  │ ──────────────────────────────────────────────────────────── ││
│  │ Experience and Track Record                         40         ││
│  │ Technical Capability                                 30         ││
│  │ Delivery Timeline                                    30         ││
│  │ ──────────────────────────────────────────────────────────── ││
│  │ Total                                                100        ││
│  │ Minimum Technical Score: 70                                    ││
│  └────────────────────────────────────────────────────────────────┘│
│                                                                    │
│  ┌── ABC Furniture Company ──── Total: 82.0 / 100 ─── [▽] ──────┐│
│  │                                                               ││
│  │  ▽ Technical Proposal                                         ││
│  │  "Our company has 15 years of experience..."                  ││
│  │                                                               ││
│  │  📄 Documents:                                                 ││
│  │  company_registration.pdf  [⬇️]                                ││
│  │  tax_clearance.pdf         [⬇️]                                ││
│  │  ──────────────────────────────────────────────                ││
│  │  Experience and Track Record (0-40): [35  ]                   ││
│  │  Technical Capability (0-30):         [25  ]                   ││
│  │  Delivery Timeline (0-30):            [22  ]                   ││
│  │                                                               ││
│  │  Remarks (optional):                                          ││
│  │  [Strong track record. Solid delivery plan.                  ]││
│  └───────────────────────────────────────────────────────────────┘│
│                                                                    │
│  ┌── XYZ Construction Corp ──── Total: 65.5 / 100 ─── [▽] ─────┐│
│  │  (same structure — score fields for each criterion)           ││
│  └───────────────────────────────────────────────────────────────┘│
│                                                                    │
│  ┌── Quick Supplies Ltd ──── Total: 91.0 / 100 ─── [▽] ────────┐│
│  │  (same structure)                                             ││
│  └───────────────────────────────────────────────────────────────┘│
│                                                                    │
│  [████████████ Submit All Evaluations ████████████████████████████]│
│                                                                    │
│  ── After technical is finalized, this section appears: ──         │
│                                                                    │
│  ┌── 🏆 Financial Evaluation Results ────────────────────────────┐│
│  │ Rank │ Bidder        │ Tech Score │ Bid Amount │ Fin.Score │Combined││
│  │  #1  │ Quick Supp 🏆│   91.0     │   480K     │   93.8    │  91.6  ││
│  │  #2  │ ABC Furn.     │   82.0     │   500K     │   90.0    │  83.6  ││
│  │  #3  │ DEF Co.       │   78.0     │   450K     │  100.0    │  82.4  ││
│  └───────────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────────────┘
```

**Key features of this page:**

| Feature | What It Does |
|---------|-------------|
| Criteria Reference Card | Shows all evaluation criteria and their max scores (weights) — a "cheat sheet" for the evaluator |
| Expandable Bid Cards | Each bid is a collapsible card with ▽/△ toggle. Click to see the bidder's technical proposal text and uploaded documents |
| Score Input Fields | One number field per criterion per bid. Score must be between 0 and the criterion's weight (e.g., 0–40 for "Experience") |
| Auto-calculated Total | Shows `Total: 82.0 / 100` — automatically sums all criteria scores for that bid |
| Remarks Text Box | Optional comments explaining why you scored this way |
| Download Buttons | Each uploaded document has a download button so evaluators can read the documents |
| Submit Button | Only enabled when ALL bids have ALL criteria scored (no missing scores). Shows confirmation dialog. |
| Read-only Mode | After submission, all fields are disabled (greyed out) with a green "Evaluation Submitted" badge |
| Financial Results Table | Appears ONLY after the officer finalizes the technical evaluation — shows the calculated rankings |

**Critical privacy rule:** The evaluator **cannot see the bid amount (price)** during technical evaluation. The `getTechnicalEvaluationData()` function in the backend specifically strips out the `bidAmount` field. This prevents price bias — judges should evaluate quality only, not be influenced by price.

---

## 6. How Technical Evaluation Works — End to End

### The Complete Flow

```
 EVALUATOR clicks "Evaluate" on their dashboard card
       │
       ▼
 Page loads → Frontend sends:
   GET /api/tenders/5/evaluation/technical
       │
       ▼
 evaluation.service.ts → getTechnicalEvaluationData()
       │
       ├── CHECK: Is this evaluator assigned to this tender?
       │   → No → Error: "Not assigned to this tender's committee"
       │
       ├── Fetch tender details:
       │   → evaluationCriteria (the scoring rules)
       │   → minimumTechnicalScore (passing grade, e.g., 70)
       │
       ├── Fetch ALL opened bids with their technical documents
       │   → But REMOVE the bidAmount field! (price is hidden)
       │
       └── Fetch this evaluator's EXISTING scores (if any)
           → So the form can be pre-filled if they already submitted
       │
       ▼
 Frontend receives data and builds the scoring form:
   - One card per bid
   - One score input per criterion per bid
   - Pre-filled if the evaluator already submitted
       │
       ▼
 EVALUATOR reads each bid's proposal and documents,
 then enters scores for each criterion:

   Bid: "ABC Furniture"
     Experience and Track Record:  35 (out of 40)
     Technical Capability:         25 (out of 30)
     Delivery Timeline:            22 (out of 30)
     Total:                        82 out of 100
     Remarks: "Strong experience but delivery plan could improve"

   Bid: "XYZ Corp"
     Experience and Track Record:  20 (out of 40)
     Technical Capability:         28 (out of 30)
     Delivery Timeline:            15 (out of 30)
     Total:                        63 out of 100
     Remarks: "Good technical skills but limited experience"
       │
       ▼
 EVALUATOR clicks "Submit All Evaluations"
       │
       ▼
 Confirmation dialog: "Are you sure? You can update scores
 until the officer finalizes."
       │
       ▼ (clicks "Submit")
       │
 Frontend sends: POST /api/tenders/5/evaluation/technical
   {
     evaluations: [
       {
         bidId: 42,
         criteriaScores: [
           { criteriaName: "Experience and Track Record", score: 35 },
           { criteriaName: "Technical Capability", score: 25 },
           { criteriaName: "Delivery Timeline", score: 22 }
         ],
         remarks: "Strong experience but..."
       },
       {
         bidId: 43,
         criteriaScores: [...],
         remarks: "Good technical skills..."
       }
     ]
   }
       │
       ▼
 evaluation.service.ts → submitTechnicalEvaluation()
       │
       ├── CHECK: Evaluator is assigned to this committee
       ├── CHECK: Scores provided for ALL bids (not just some)
       ├── CHECK: Each score is within range (0 to criterion weight)
       ├── CHECK: All criteria names match the tender's criteria
       │
       ├── For EACH bid:
       │   → Calculate total = sum of all criteria scores
       │   → UPSERT (insert-or-update) into evaluations table
       │     (if evaluator already submitted, UPDATE their scores)
       │
       └── Return: "Technical evaluation submitted"
       │
       ▼
 Frontend shows toast: "Evaluation submitted successfully"
 Status changes to "Technical Submitted — Awaiting others"
```

### What "UPSERT" Means

The word **upsert** means "insert or update":
- If this is the evaluator's **first time** scoring → **INSERT** a new row
- If the evaluator **already scored** and is revising → **UPDATE** the existing row

This uses the database's **unique constraint**: `@@unique([bidId, evaluatorId, evaluationType])` — meaning one evaluator can only have one set of scores per bid per evaluation type.

---

## 7. The Scoring Math Explained

### 7.1 Technical Scoring (By Each Evaluator)

Each evaluator gives scores based on the criteria set by the officer when creating the tender.

**Example Setup:**
- Criteria: Experience (40), Capability (30), Timeline (30) = total 100
- 3 evaluators assigned
- Minimum passing score: 70

**Evaluator 1 scores Bidder A:**
```
  Experience and Track Record:   35 out of 40
  Technical Capability:          25 out of 30
  Delivery Timeline:             22 out of 30
                                ────────────
  TOTAL:                         82 out of 100
```

**Evaluator 2 scores Bidder A:**
```
  Experience and Track Record:   38 out of 40
  Technical Capability:          20 out of 30
  Delivery Timeline:             28 out of 30
                                ────────────
  TOTAL:                         86 out of 100
```

**Evaluator 3 scores Bidder A:**
```
  Experience and Track Record:   32 out of 40
  Technical Capability:          22 out of 30
  Delivery Timeline:             24 out of 30
                                ────────────
  TOTAL:                         78 out of 100
```

### 7.2 Average Technical Score

After ALL evaluators complete scoring, the system averages their totals:

```
  Average Technical Score for Bidder A:
  
    = (Evaluator1 + Evaluator2 + Evaluator3) ÷ Number of Evaluators
    = (82 + 86 + 78) ÷ 3
    = 246 ÷ 3
    = 82.0
```

**This happens in `evaluation.service.ts` → `finalizeTechnicalEvaluation()`:**
```
avgTechnicalScore = bid.evaluations.reduce((sum, e) => sum + e.totalScore, 0) 
                    / bid.evaluations.length
```

Translation: "Add up all evaluators' total scores, then divide by the number of evaluators."

### 7.3 Technical Qualification Decision

```
  Is avgTechnicalScore >= minimumTechnicalScore?
  
  Bidder A:  82.0 >= 70?  → YES → TECHNICALLY_QUALIFIED  ✅
  Bidder B:  75.0 >= 70?  → YES → TECHNICALLY_QUALIFIED  ✅
  Bidder C:  88.0 >= 70?  → YES → TECHNICALLY_QUALIFIED  ✅
  Bidder D:  65.0 >= 70?  → NO  → TECHNICALLY_DISQUALIFIED ❌
```

**Bidder D is eliminated.** Their financial proposal (price) is **never opened or considered**.

### 7.4 Financial Score Formula

For QUALIFIED bids only, the system automatically calculates a financial score based on price:

```
                         Lowest Bid Price Among All Qualified Bids
  Financial Score  =  ───────────────────────────────────────────── × 100
                              This Bidder's Price
```

**Example with real numbers:**

| Bidder | Bid Amount (ETB) |
|--------|-----------------|
| A | 500,000 |
| B | 450,000 ← cheapest! |
| C | 480,000 |

```
  Financial Score for A = (450,000 ÷ 500,000) × 100 = 0.90 × 100 = 90.00
  Financial Score for B = (450,000 ÷ 450,000) × 100 = 1.00 × 100 = 100.00 ← highest (cheapest gets 100!)
  Financial Score for C = (450,000 ÷ 480,000) × 100 = 0.9375 × 100 = 93.75
```

**Key insight:** The **cheapest** bidder ALWAYS gets a Financial Score of exactly **100**. More expensive bidders get proportionally lower scores.

**This happens in `evaluation.service.ts` → `getFinancialEvaluationData()`:**
```
const lowestBidAmount = Math.min(...qualifiedBids.map(b => b.bidAmount));
const financialScore = (lowestBidAmount / b.bidAmount) * 100;
```

### 7.5 Combined Score Formula

The final ranking uses a **weighted combination** of technical and financial scores:

```
  Combined Score = (Technical Weight ÷ 100 × Avg Technical Score)
                 + (Financial Weight ÷ 100 × Financial Score)
```

**Example with Technical Weight = 80%, Financial Weight = 20%:**

```
  Bidder A:
    Combined = (80/100 × 82.0) + (20/100 × 90.00)
             = (0.80 × 82.0) + (0.20 × 90.00)
             = 65.60 + 18.00
             = 83.60

  Bidder B:
    Combined = (80/100 × 75.0) + (20/100 × 100.00)
             = (0.80 × 75.0) + (0.20 × 100.00)
             = 60.00 + 20.00
             = 80.00

  Bidder C:
    Combined = (80/100 × 88.0) + (20/100 × 93.75)
             = (0.80 × 88.0) + (0.20 × 93.75)
             = 70.40 + 18.75
             = 89.15
```

**This happens in `evaluation.service.ts` → `getFinancialEvaluationData()`:**
```
const combinedScore = (tender.technicalWeight / 100) * avgTechScore 
                    + (tender.financialWeight / 100) * financialScore;
```

### 7.6 Complete Example — Full Scoring Table

| Bidder | Eval 1 | Eval 2 | Eval 3 | Avg Tech | Qualified? | Bid Amount | Fin. Score | Combined (80/20) | Rank |
|--------|--------|--------|--------|----------|-----------|------------|-----------|------------------|------|
| A | 82 | 86 | 78 | **82.0** | ✅ Yes (≥70) | 500,000 | 90.00 | **83.60** | 2 |
| B | 76 | 72 | 77 | **75.0** | ✅ Yes (≥70) | 450,000 | 100.00 | **80.00** | 3 |
| C | 90 | 85 | 89 | **88.0** | ✅ Yes (≥70) | 480,000 | 93.75 | **89.15** | **1 ★** |
| D | 62 | 68 | 65 | **65.0** | ❌ No (<70) | — | — | — | — |

**Winner: Bidder C** — highest combined score (89.15), not cheapest but strong technical quality.

---

## 8. How the System Determines Qualified vs. Disqualified Bids

### The Process (Finalize Technical Evaluation)

When the officer clicks "Finalize Technical Evaluation":

```
 OFFICER clicks "Finalize Technical Evaluation"
       │
       ▼
 Frontend sends: PATCH /api/tenders/5/evaluation/technical/finalize
       │
       ▼
 evaluation.service.ts → finalizeTechnicalEvaluation()
       │
       ├── CHECK: All evaluators have completed scoring?
       │   → No → Error: "Not all evaluators have completed"
       │
       ├── For EACH bid:
       │     │
       │     ├── Calculate average:
       │     │   avgScore = sum(all evaluators' totals) ÷ count(evaluators)
       │     │
       │     ├── Compare to minimum threshold:
       │     │   avgScore >= tender.minimumTechnicalScore?
       │     │
       │     ├── Update bid STATUS:
       │     │   → YES → status becomes "TECHNICALLY_QUALIFIED"
       │     │   → NO  → status becomes "TECHNICALLY_DISQUALIFIED"
       │     │
       │     └── Create/Update EVALUATION SUMMARY:
       │         → avgTechnicalScore = calculated average
       │         → isTechnicallyQualified = true/false
       │
       └── NOTIFY all committee members:
             → "Technical evaluation finalized for: Office Supplies.
                Financial evaluation can begin."
```

**Important:** This is a ONE-TIME action. Once finalized, the technical results are locked and the system moves to financial evaluation.

---

## 9. How Financial Evaluation Works

Unlike technical evaluation, financial evaluation is **automatic** — no human judges are needed.

### The Process

```
 After technical evaluation is finalized:
       │
       ▼
 Officer's Tender Detail Page → Evaluation tab
 Shows "Step 3: Financial Evaluation"
       │
       ▼
 Frontend automatically loads:
   GET /api/tenders/5/evaluation/financial
       │
       ▼
 evaluation.service.ts → getFinancialEvaluationData()
       │
       ├── Fetch ONLY qualified bids (status = TECHNICALLY_QUALIFIED or EVALUATED)
       │
       ├── Find the LOWEST bid amount among all qualified bids
       │
       ├── For EACH qualified bid:
       │   ├── Calculate Financial Score = (lowest / this bid's price) × 100
       │   ├── Get the avgTechnicalScore from the evaluation summary
       │   ├── Calculate Combined Score:
       │   │     (techWeight/100 × techScore) + (finWeight/100 × finScore)
       │   └── Assign rank = 0 (temporary)
       │
       ├── SORT all bids by Combined Score (highest first)
       │
       ├── Assign RANKS: 1st, 2nd, 3rd, ...
       │
       └── SAVE rankings to evaluation_summaries table:
             → avgFinancialScore, combinedScore, rank
       │
       ▼
 Frontend displays the ranking table:
 ┌──────┬───────────────┬───────────┬───────────┬──────────┬──────────┐
 │ Rank │ Bidder        │ Tech Score│ Bid Amount│ Fin Score│ Combined │
 ├──────┼───────────────┼───────────┼───────────┼──────────┼──────────┤
 │ #1 🏆│ Quick Supp.   │   88.0    │  480,000  │   93.75  │  89.15   │
 │ #2   │ ABC Furn.     │   82.0    │  500,000  │   90.00  │  83.60   │
 │ #3   │ DEF Co.       │   75.0    │  450,000  │  100.00  │  80.00   │
 └──────┴───────────────┴───────────┴───────────┴──────────┴──────────┘
       │
       ▼
 Officer clicks "Finalize Financial Evaluation"
       │
       ▼
 evaluation.service.ts → finalizeFinancialEvaluation()
       │
       ├── CHECK: Combined scores are all calculated
       ├── UPDATE all qualified bids: status → "EVALUATED"
       └── Return: "Financial evaluation finalized"
```

### Key Insight: Why the Cheapest Doesn't Always Win

In the example above, **DEF Co.** had the cheapest price (450,000) and got the highest financial score (100.00). But they ranked **3rd** because the system uses **weighted** scoring:

```
  DEF Co:   Technical 75.0 × 80% = 60.0  +  Financial 100.0 × 20% = 20.0  =  80.0
  Quick S:  Technical 88.0 × 80% = 70.4  +  Financial  93.75× 20% = 18.75 =  89.15
```

Quick Supplies won because the system weights technical quality (80%) much more than price (20%).

---

## 10. How Winner Selection Works

### The Award Process

```
 After financial evaluation is finalized:
       │
       ▼
 Officer sees "Step 4: Award Decision" on the Evaluation Tab
       │
       ▼
 System shows a green recommendation box:
 ┌────────────────────────────────────────────────────────────┐
 │ Recommended winner: Quick Supplies Ltd                     │
 │ ETB 480,000 (Combined Score: 89.15)                       │
 │                                                           │
 │ [🏆 Award to Rank #1 Bidder]                               │
 └────────────────────────────────────────────────────────────┘
       │
       ▼ (officer clicks "Award to Rank #1 Bidder")
       │
 Confirmation dialog:
 "Award this tender to Quick Supplies Ltd for ETB 480,000?
  This action cannot be undone."
       │
       ▼ (clicks "Confirm Award")
       │
 Frontend sends: PATCH /api/tenders/5/award
   { winningBidId: 42 }
       │
       ▼
 evaluation.service.ts → awardTender()
       │
       ├── CHECK: Tender status = UNDER_EVALUATION
       ├── CHECK: Financial evaluation has been finalized (EVALUATED bids exist)
       ├── CHECK: The winning bid has rank = 1 (MUST be the highest ranked)
       │   → If not rank 1 → Error: "Winning bid must be the rank 1 bid"
       │
       ├── UPDATE winning bid:
       │   → status: "EVALUATED" → "SELECTED"
       │   → evaluationSummary.isWinner = true
       │
       ├── UPDATE all OTHER evaluated bids:
       │   → status: "EVALUATED" → "NOT_SELECTED"
       │
       └── UPDATE tender:
             → status: "UNDER_EVALUATION" → "AWARDED"
```

**Important constraint:** The officer can ONLY award to the Rank #1 bidder. The system enforces this — you cannot skip to a lower-ranked bidder. This ensures the procurement process is fair and by the rules.

---

## 11. How Results Publishing Works

After awarding, the officer publishes results to notify all bidders:

```
 Officer clicks "Publish Results to All Bidders"
       │
       ▼
 Confirmation: "This will notify all bidders of the evaluation
 results. The winner will be congratulated, and other bidders
 will be informed they can request a debriefing."
       │
       ▼ (clicks "Publish")
       │
 Frontend sends: PATCH /api/tenders/5/publish-results
       │
       ▼
 evaluation.service.ts → publishResults()
       │
       ├── CHECK: Tender status = AWARDED (must be awarded first)
       │
       ├── Find the WINNING bid (status = SELECTED)
       │   → Create notification:
       │     "Congratulations! Your bid for 'Office Supplies' has been selected."
       │     notificationType: "BID_SELECTED"
       │
       └── Find ALL LOSING bids (status = NOT_SELECTED)
             → For each loser, create notification:
               "The evaluation for 'Office Supplies' is complete.
                Your bid was not selected. You may request a debriefing."
               notificationType: "BID_NOT_SELECTED"
```

### What Bidders See After Results Are Published

**Winner sees (on the bidder's tender detail page → Results tab):**
```
 ┌─────────────────────────────────────────────────────────┐
 │ 🏆 Congratulations! Your bid has been selected!        │
 │ You have been awarded this tender.                     │
 └─────────────────────────────────────────────────────────┘
```

**All bidders (winner AND losers) see the full leaderboard:**
```
 ┌──────────────────────────────────────────────────────────────┐
 │  Evaluation Results                                          │
 │                                                              │
 │  ┌──────┬────────────────┬──────────┬──────────┬──────────┐  │
 │  │ Rank │ Bidder         │ Tech Avg │ Fin.Score│ Combined │  │
 │  ├──────┼────────────────┼──────────┼──────────┼──────────┤  │
 │  │ #1 ★ │ Quick Supp.   │   88.0   │   93.75  │  89.15   │  │
 │  │ #2   │ ABC Furniture ← YOU      │   82.0   │   90.00  │  83.60   │  │
 │  │ #3   │ DEF Co.       │   75.0   │  100.00  │  80.00   │  │
 │  └──────┴────────────────┴──────────┴──────────┴──────────┘  │
 │                                                              │
 │  — Disqualified Bids —                                       │
 │  XYZ Corp: Avg Tech Score 65.0 (below minimum 70)            │
 └──────────────────────────────────────────────────────────────┘
```

**Transparency:** The system shows ALL bidders' scores and rankings to EVERY bidder. This is a key principle of public procurement — full transparency. Each bidder's own row is highlighted with "← YOU" so they can easily find themselves.

---

## 12. How Debriefing Works

### What Is Debriefing?

Debriefing is when a **losing bidder asks "Why did I lose?"** and the **officer provides a detailed explanation**. It's like when a student asks their teacher "Why did I fail?" after an exam.

### The Bidder Requests Debriefing

```
 Losing bidder goes to My Bids page → clicks "View" on their bid
       │
       ▼
 Sees their bid details and status: "NOT_SELECTED"
 Sees a "Request Debriefing" button
       │
       ▼
 Clicks "Request Debriefing"
       │
       ▼
 Confirmation: "You will receive an explanation of how your bid was assessed."
       │
       ▼
 Frontend sends: POST /api/bids/42/debriefing
       │
       ▼
 debriefing.service.ts → requestDebriefing()
       │
       ├── CHECK: Bid exists and belongs to this bidder
       ├── CHECK: Bid status = NOT_SELECTED (only losers can request)
       ├── CHECK: No existing debriefing request (one per bid)
       │
       ├── CREATE debriefing_requests record
       │
       └── NOTIFY the tender's officer:
             "Debriefing requested for 'Office Supplies' by ABC Furniture"
             notificationType: "DEBRIEFING_REQUESTED"
```

### The Officer Responds

```
 OFFICER goes to the "Debriefing Requests" page
       │
       ▼
 ┌────────────────────────────────────────────────────────────────┐
 │  Debriefing Requests                                          │
 ├─────────────┬──────────────┬──────────┬──────────┬─────┬──────┤
 │ Tender      │ Bidder       │ Bid Amt  │ Date     │Stat │      │
 ├─────────────┼──────────────┼──────────┼──────────┼─────┼──────┤
 │ Office Supp │ ABC Furn.    │ 500K     │ Jun 20   │Pend │[Resp]│
 │ Road Works  │ XYZ Corp     │ 2.5M     │ Jun 18   │ ✅  │[View]│
 └─────────────┴──────────────┴──────────┴──────────┴─────┴──────┘
       │
       ▼ (clicks "Respond")
       │
 Dialog opens showing:
 ┌──────────────────────────────────────────────────────────┐
 │ Respond to Debriefing                                    │
 │ Office Supplies for Ministry of Education                │
 │                                                         │
 │ Bidder: ABC Furniture Co.                               │
 │ Bid Amount: ETB 500,000                                 │
 │ ──────────────────────────────────────────               │
 │ Technical Score: 82.0                                   │
 │ Financial Score: 90.0                                   │
 │ Combined Score: 83.6                                    │
 │ Rank: #2                                                │
 │ ──────────────────────────────────────────               │
 │ Response *:                                             │
 │ [Your bid scored well technically, particularly in      ]│
 │ [the experience category. However, the winning bid      ]│
 │ [had a stronger technical proposal (88.0 vs 82.0)       ]│
 │ [especially in delivery timeline. While your price      ]│
 │ [was competitive, the technical gap resulted in a       ]│
 │ [lower combined score. We encourage you to...           ]│
 │                                                         │
 │                [Cancel]  [Send Response]                 │
 └──────────────────────────────────────────────────────────┘
       │
       ▼ (clicks "Send Response")
       │
 Frontend sends: PATCH /api/debriefings/7/respond
   { response: "Your bid scored well technically..." }
       │
       ▼
 debriefing.service.ts → respondToDebriefing()
       │
       ├── CHECK: This officer owns the tender
       ├── CHECK: Not already responded (one response only)
       │
       ├── UPDATE debriefing_requests record:
       │   → response: "Your bid scored well..."
       │   → respondedBy: officer's user ID
       │   → respondedDate: NOW
       │
       └── NOTIFY the bidder:
             "Your debriefing request for 'Office Supplies' has been answered."
             notificationType: "DEBRIEFING_RESPONDED"
```

### File Map

```
 📁 officer/debriefings/page.tsx (officer's view)
     ↕
 📁 debriefing.routes.ts
     ├── POST   /bids/:bidId/debriefing     → requestDebriefing
     ├── GET    /debriefings                 → listDebriefings
     └── PATCH  /debriefings/:id/respond     → respondToDebriefing
     ↕
 📁 debriefing.controller.ts
     ↕
 📁 debriefing.service.ts
     ↕
 🗄️ debriefing_requests table
```

---

## 13. How Reports Work

### The Reports Page

**File:** `frontend/src/app/(dashboard)/officer/reports/page.tsx`

The officer sees 4 clickable cards, each representing a different report type:

```
┌────────────────────────────────────────────────────────────────┐
│  Reports                                                       │
│                                                                │
│  ┌──────────────────────────┐  ┌──────────────────────────┐   │
│  │ 📄 Tender Summary        │  │ ☑️ Bid Evaluation        │   │
│  │ Overview of all tenders  │  │ Detailed evaluation      │   │
│  │ with status and outcomes │  │ breakdown for a specific │   │
│  │                          │  │ tender                   │   │
│  └──────────────────────────┘  └──────────────────────────┘   │
│                                                                │
│  ┌──────────────────────────┐  ┌──────────────────────────┐   │
│  │ 📊 Procurement Activity  │  │ 👥 Bidder Participation  │   │
│  │ Activity summary for a   │  │ Bidder engagement and    │   │
│  │ specific date range      │  │ win rates                │   │
│  └──────────────────────────┘  └──────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

### Report 1: Tender Summary Report

**What it shows:** An overview of ALL tenders the officer has created.

**Filters:** Status filter, Category filter, Date range (from/to)

**Content:**
```
 ┌────────────────────────────────────────────────────────────┐
 │ Summary Cards: Total: 12 | Draft: 3 | Published: 4 | ... │
 ├────────────────────────────────────────────────────────────┤
 │ Table:                                                    │
 │ Title | Category | Status | Bids | Winner | Amount        │
 │ ────────────────────────────────────────────────────────── │
 │ Office Supplies | GOODS | AWARDED | 5 | Quick Supp | 480K │
 │ Road Works | WORKS | PUBLISHED | 3 | — | —                │
 │ IT Consulting | CONSULTING | DRAFT | 0 | — | —            │
 └────────────────────────────────────────────────────────────┘
```

**Backend:** `report.service.ts → getTenderSummary()` — fetches all tenders with filters, counts by status/category, finds winners.

### Report 2: Bid Evaluation Report

**What it shows:** Complete evaluation breakdown for ONE specific tender.

**Setup:** Officer selects a tender from a dropdown (AWARDED tenders only).

**Content:**
```
 ┌──────────────────────────────────────────────────────────────┐
 │ Tender: Office Supplies for Ministry of Education            │
 │ Committee: Dr. Abebe, Ato Dereje, Ato Yohannes              │
 │ Weights: Technical 80% | Financial 20% | Min Score: 70       │
 ├──────────────────────────────────────────────────────────────┤
 │ Table:                                                       │
 │ Rank | Bidder | Amount | Tech Score | Fin. | Combined | Stat │
 │  #1  | Quick ★| 480K   | 88.0      | 93.8 | 89.15    | SEL  │
 │  #2  | ABC    | 500K   | 82.0      | 90.0 | 83.60    | N_S  │
 │  #3  | DEF    | 450K   | 75.0      |100.0 | 80.00    | N_S  │
 │  —   | XYZ    | —      | 65.0      |  —   |   —      | DIS  │
 └──────────────────────────────────────────────────────────────┘
```

**Backend:** `report.service.ts → getBidEvaluationReport()` — includes full details: individual evaluator scores, criteriaScores breakdown, committee members, and final rankings.

### Report 3: Procurement Activity Report

**What it shows:** Summary of ALL procurement activity within a date range.

**Required input:** Start date and End date.

**Content:**
```
 ┌────────────────────────────────────────────────────────────┐
 │ Summary Cards:                                             │
 │ Created: 8 | Published: 5 | Awarded: 3 | Cancelled: 1     │
 │ Total Bids: 24 | Avg Bids/Tender: 4.8                     │
 ├────────────────────────────────────────────────────────────┤
 │ Table:                                                     │
 │ Title | Category | Status | Bids | Awarded To | Amount     │
 │ (list of all tenders created within the date range)         │
 └────────────────────────────────────────────────────────────┘
```

**Backend:** `report.service.ts → getProcurementActivity()` — aggregates by status, counts total bids received, calculates average bids per tender.

### Report 4: Bidder Participation Report

**What it shows:** Which companies have been bidding, how often, and how often they win.

**Content:**
```
 ┌────────────────────────────────────────────────────────────┐
 │ Table:                                                     │
 │ Bidder | Type | Total Bids | Won | Win Rate                │
 │ ─────────────────────────────────────────────────────────── │
 │ Quick Supplies | ORG | 5 | 2 | 40%                         │
 │ ABC Furniture  | ORG | 8 | 1 | 13%                         │
 │ John Doe       | IND | 3 | 0 | 0%                          │
 └────────────────────────────────────────────────────────────┘
```

**Backend:** `report.service.ts → getBidderParticipation()` — groups bids by bidder, counts totals and wins, calculates win rate.

---

## 14. How PDF Export Works

Each report has an **"Export PDF"** button. When clicked, it generates a professional PDF document right in the browser.

**File:** `frontend/src/lib/pdf-export.ts`

### How It Works (Step by Step)

```
 Officer clicks "Export PDF" button
       │
       ▼
 The pdf-export.ts function is called with the report data
       │
       ▼
 Uses jsPDF library (a JavaScript tool) to create a PDF:
       │
       ├── 1. Creates a new blank PDF document
       │
       ├── 2. Adds HEADER:
       │     → Title: "Online Tender Management System"
       │     → Report name: e.g., "Bid Evaluation Report"
       │     → Generated date: "Jun 20, 2026 14:30"
       │     → Subtitle: tender name or filter info
       │
       ├── 3. Adds SUMMARY STATS (if applicable):
       │     → "Total Tenders: 12"
       │     → "By Status: AWARDED: 4, PUBLISHED: 5..."
       │
       ├── 4. Adds TABLE using autoTable plugin:
       │     → Column headers (blue background)
       │     → Data rows (from the report data)
       │     → Font size 8 for readability
       │
       ├── 5. Adds FOOTER on every page:
       │     → "Page 1 of 3" (centered at bottom)
       │
       └── 6. DOWNLOADS the PDF to the user's computer:
             → Filename: "Bid_Evaluation_Report_Office_Supplies_2026-06-20.pdf"
```

### The 5 PDF Export Functions

| Function | Report Type | Key Content in PDF |
|----------|------------|-------------------|
| `exportTenderSummaryPDF()` | Tender Summary | Summary stats + tender table with winners |
| `exportBidEvaluationPDF()` | Bid Evaluation | Criteria table + full ranking table with ★ for winner |
| `exportProcurementActivityPDF()` | Procurement Activity | Activity stats + tender list |
| `exportBidderParticipationPDF()` | Bidder Participation | Bidder table with win rates |
| `exportBidOpeningRecordPDF()` | Bid Opening Record | Opening date + bid details table |

**Important:** The PDF is generated **entirely in the browser** (frontend). It does NOT send data to the backend. The `jsPDF` library creates the document client-side (in the user's web browser) and triggers a download. No server interaction happens during PDF generation.

---

## 15. The Database Tables

The database (the place where ALL data is permanently stored) is like a giant organized **Excel workbook**. Each **table** is a separate **sheet**.

### My 4 Main Tables

```
 ┌─────────────────────────────────────────────────────────────┐
 │                    MY DATABASE TABLES                        │
 │                                                             │
 │  ┌──────────────────────────┐                               │
 │  │ evaluation_committee_    │ ← WHO are the judges          │
 │  │ assignments              │                               │
 │  └────────────┬─────────────┘                               │
 │               │                                             │
 │               ▼                                             │
 │  ┌──────────────────────────┐                               │
 │  │     evaluations          │ ← Individual judge scores     │
 │  │                          │                               │
 │  └────────────┬─────────────┘                               │
 │               │                                             │
 │               ▼                                             │
 │  ┌──────────────────────────┐                               │
 │  │  evaluation_summaries    │ ← Final averages, ranks,      │
 │  │                          │   winner flag                 │
 │  └──────────────────────────┘                               │
 │                                                             │
 │  ┌──────────────────────────┐                               │
 │  │  debriefing_requests     │ ← "Why did I lose?" Q&A       │
 │  └──────────────────────────┘                               │
 └─────────────────────────────────────────────────────────────┘
```

---

### Table 1: `evaluation_committee_assignments` — The Judge Roster

**Analogy:** A sign-up sheet listing which teachers are judging which talent show.

| Column | What It Stores | Example |
|--------|---------------|---------|
| id | Unique number | 1 |
| assigned_date | When this judge was assigned | 2026-06-16 10:00 |
| tender_id | Which tender they're judging | 5 → links to tenders table |
| user_id | The evaluator's user ID | 8 → links to users table |
| assigned_by | Which officer assigned them | 3 → links to users table |

**Special rule:** `@@unique([tenderId, userId])` — one evaluator can only be assigned ONCE per tender. You can't accidentally add the same judge twice.

---

### Table 2: `evaluations` — Individual Judge Score Cards

**Analogy:** Each row is one judge's scorecard for one contestant. If there are 3 judges and 5 bids, there will be 15 rows (3 × 5).

| Column | What It Stores | Example |
|--------|---------------|---------|
| id | Unique number | 1 |
| criteria_scores | JSON — each criterion name and score | `[{"criteriaName":"Experience","score":35}, {"criteriaName":"Capability","score":25}]` |
| total_score | Sum of all criteria scores | 82.0 |
| remarks | Judge's written comments (optional) | "Strong track record, good delivery plan" |
| evaluation_type | TECHNICAL or FINANCIAL | TECHNICAL |
| evaluation_date | When the evaluation was submitted | 2026-06-17 14:30 |
| bid_id | Which bid is being scored | 42 → links to bids table |
| evaluator_id | Which judge submitted this score | 8 → links to users table |

**Special rule:** `@@unique([bidId, evaluatorId, evaluationType])` — one evaluator can only submit ONE score per bid per type. This prevents duplicate scoring. If they re-submit, it UPDATES the existing row instead.

**What is JSON?** JSON is a way to store structured data. The `criteria_scores` column stores a list of criterion-score pairs. Think of it like a mini spreadsheet-within-a-cell:

```
[
  { "criteriaName": "Experience and Track Record", "score": 35 },
  { "criteriaName": "Technical Capability", "score": 25 },
  { "criteriaName": "Delivery Timeline", "score": 22 }
]
```

---

### Table 3: `evaluation_summaries` — Final Report Cards

**Analogy:** The final grade sheet that averages all judges' scores and determines who passed. One row per bid.

| Column | What It Stores | Example |
|--------|---------------|---------|
| id | Unique number | 1 |
| avg_technical_score | Average of all judges' total scores | 82.0 |
| avg_financial_score | Financial score (calculated automatically) | 90.0 (or empty if disqualified) |
| combined_score | Weighted combination of tech + financial | 83.6 (or empty if disqualified) |
| rank | Final ranking among all qualified bids | 2 (or empty if disqualified) |
| is_technically_qualified | Did they pass the technical minimum? | true/false |
| is_winner | Was this bid selected as the winner? | false (only ONE bid has true) |
| bid_id | Which bid this summary is for | 42 → links to bids table |
| tender_id | Which tender | 5 → links to tenders table |

**Special rule:** `bid_id` is `@unique` — each bid can only have ONE summary. This prevents confusion.

---

### Table 4: `debriefing_requests` — The "Why Did I Lose?" Letters

**Analogy:** A formal letter from a losing contestant asking "Why didn't I win?" and the reply from the judges.

| Column | What It Stores | Example |
|--------|---------------|---------|
| id | Unique number | 7 |
| request_date | When the bidder asked | 2026-06-20 15:00 |
| response | Officer's written explanation | "Your bid scored well technically..." (empty until answered) |
| responded_date | When the officer answered | 2026-06-21 10:30 (empty until answered) |
| bid_id | Which bid the debriefing is about | 42 → links to bids table (UNIQUE — one per bid) |
| bidder_id | Who asked | 7 → links to users table |
| responded_by | Who answered | 3 → links to users table (empty until answered) |

**Special rule:** `bid_id` is `@unique` — only ONE debriefing request per bid. A bidder can't ask twice for the same bid.

---

### How All Tables Connect

```
 ┌──────────┐       ┌─────────────────────────────────┐
 │ tenders  │───1:N─│ evaluation_committee_assignments │
 │(Student2)│       │   (which judges are assigned)    │
 └────┬─────┘       └─────────────────────────────────┘
      │
      │ 1:N
      │
 ┌────┴─────┐       ┌──────────────────┐
 │   bids   │───1:N─│   evaluations    │
 │(Student2)│       │(individual scores│
 └────┬─────┘       │ per judge per bid│
      │             └──────────────────┘
      │
      ├── 1:1 ──── evaluation_summaries (final results per bid)
      │
      └── 1:1 ──── debriefing_requests (feedback per bid)
      
 (1:N = one-to-many, 1:1 = one-to-one)
```

---

## 16. How the Files Connect to Each Other

### The Three-Layer Architecture

```
 ┌────────────────────────────────────────────────────────────────┐
 │  LAYER 1: FRONTEND (The Dining Room — what users see)          │
 │                                                                │
 │  Evaluator:                                                    │
 │  📁 evaluator/dashboard/page.tsx      ← dashboard + assignments│
 │  📁 evaluator/tenders/[id]/evaluate/page.tsx  ← scoring form   │
 │  📁 evaluator/evaluations/page.tsx    ← redirect to dashboard  │
 │                                                                │
 │  Officer (evaluation-related tabs):                            │
 │  📁 officer/tenders/[id]/page.tsx     ← EvaluationTab,         │
 │                                        CommitteeAssignForm,    │
 │                                        AwardSection,           │
 │                                        FinancialRankTable      │
 │  📁 officer/debriefings/page.tsx      ← debriefing management  │
 │  📁 officer/reports/page.tsx          ← all 4 report types     │
 │                                                                │
 │  Bidder (results view):                                        │
 │  📁 bidder/tenders/[id]/page.tsx      ← ResultsTab             │
 │  📁 bidder/my-bids/page.tsx           ← DebriefingSection      │
 │                                                                │
 │  Shared:                                                       │
 │  📁 lib/pdf-export.ts                 ← PDF generation         │
 └─────────────────────────────┬──────────────────────────────────┘
                               │  HTTP Requests
                               ▼
 ┌────────────────────────────────────────────────────────────────┐
 │  LAYER 2: BACKEND (The Kitchen — processing logic)             │
 │                                                                │
 │  📁 routes/evaluation.routes.ts   ← 14 endpoints               │
 │  📁 routes/debriefing.routes.ts   ← 3 endpoints                │
 │  📁 routes/report.routes.ts       ← 6 endpoints                │
 │                   │                                            │
 │                   ▼                                            │
 │  📁 controllers/evaluation.controller.ts  ← validates + routes │
 │  📁 controllers/debriefing.controller.ts                       │
 │  📁 controllers/report.controller.ts                           │
 │                   │                                            │
 │                   ▼                                            │
 │  📁 services/evaluation.service.ts ← THE BIG ONE (827 lines!) │
 │  📁 services/debriefing.service.ts ← 114 lines                │
 │  📁 services/report.service.ts     ← 312 lines                │
 └─────────────────────────────┬──────────────────────────────────┘
                               │  Prisma ORM
                               ▼
 ┌────────────────────────────────────────────────────────────────┐
 │  LAYER 3: DATABASE (The Storage Room)                          │
 │  📁 prisma/schema.prisma                                       │
 │  Tables: evaluation_committee_assignments, evaluations,        │
 │          evaluation_summaries, debriefing_requests              │
 └────────────────────────────────────────────────────────────────┘
```

### Complete File Paths for Key Flows

**Flow 1: Evaluator Scores Bids**
```
 📁 evaluator/tenders/[id]/evaluate/page.tsx
     → api.post("/tenders/{id}/evaluation/technical", {evaluations})
 📁 evaluation.routes.ts → router.post("...technical")
 📁 evaluation.controller.ts → submitTechnicalEvaluation()
 📁 evaluation.service.ts → submitTechnicalEvaluation()
 🗄️ evaluations table (INSERT or UPDATE)
```

**Flow 2: Officer Awards Tender**
```
 📁 officer/tenders/[id]/page.tsx → AwardSection component
     → api.patch("/tenders/{id}/award", {winningBidId})
 📁 evaluation.routes.ts → router.patch("...award")
 📁 evaluation.controller.ts → awardTender()
 📁 evaluation.service.ts → awardTender()
 🗄️ bids table (SELECTED/NOT_SELECTED) + tenders table (AWARDED)
```

**Flow 3: Officer Generates Report**
```
 📁 officer/reports/page.tsx → BidEvaluationReport component
     → api.get("/reports/bid-evaluation/{tenderId}")
 📁 report.routes.ts → router.get("...bid-evaluation/:tenderId")
 📁 report.controller.ts → getBidEvaluationReport()
 📁 report.service.ts → getBidEvaluationReport()
 🗄️ tenders + bids + evaluations + evaluation_summaries tables

 Then for PDF:
 📁 officer/reports/page.tsx → exportBidEvaluationPDF(data)
 📁 lib/pdf-export.ts → creates PDF in browser → downloads to computer
```

---

## 17. The Evaluation Service Explained Function by Function

**File:** `backend/src/services/evaluation.service.ts` — **827 lines** — the largest and most complex service file in the entire project.

### All 13 Functions at a Glance

| # | Function Name | Lines | What It Does |
|---|--------------|-------|-------------|
| 1 | `openBids()` | 7–76 | Opens sealed bids after deadline passes |
| 2 | `getBidOpeningRecord()` | 78–124 | Returns the record of who bid and when |
| 3 | `assignCommittee()` | 128–172 | Assigns 3+ evaluators to a tender |
| 4 | `getCommittee()` | 174–191 | Returns committee members + completion status |
| 5 | `getTechnicalEvaluationData()` | 195–246 | Gets bids + criteria for evaluators to score (hides prices!) |
| 6 | `submitTechnicalEvaluation()` | 248–320 | Saves an evaluator's scores for all bids |
| 7 | `getTechnicalEvaluationStatus()` | 322–399 | Shows progress: how many evaluators have finished |
| 8 | `finalizeTechnicalEvaluation()` | 401–459 | Calculates averages, qualifies/disqualifies bids |
| 9 | `getFinancialEvaluationData()` | 463–536 | Calculates financial scores, combined scores, rankings |
| 10 | `finalizeFinancialEvaluation()` | 538–560 | Changes qualified bids to EVALUATED status |
| 11 | `awardTender()` | 564–603 | Marks winner as SELECTED, others as NOT_SELECTED |
| 12 | `publishResults()` | 605–646 | Sends notifications to winner and losers |
| 13 | `getTenderResults()` | 648–764 | Returns final results (different data for bidders vs officers) |
| 14 | `getEvaluatorAssignments()` | 769–826 | Returns evaluator's assignment list with statuses |

### Detailed Breakdown of Key Functions

#### Function 1: `openBids()` — Opening the Sealed Envelopes

**Analogy:** In a real tender, bids are in sealed physical envelopes. "Opening bids" means cutting them open in front of witnesses. Our digital equivalent:

1. Checks the submission deadline has passed
2. Checks at least one bid exists
3. Changes ALL bids from `SUBMITTED` → `OPENED`
4. Changes the tender from `PUBLISHED` → `UNDER_EVALUATION`
5. Creates a detailed audit log recording every bidder's name, amount, and document count
6. Notifies all bidders that their bids have been opened

#### Function 6: `submitTechnicalEvaluation()` — Saving a Judge's Scores

**Key logic:**
1. Verifies the evaluator is on the committee
2. Requires scores for ALL bids (you can't score only 2 out of 5)
3. Validates each score is between 0 and the criterion's maximum
4. Uses **UPSERT** — if scores already exist, update them; if not, insert new ones
5. Calculates `totalScore` as the sum of all criteria scores

#### Function 8: `finalizeTechnicalEvaluation()` — The Big Decision

**Key logic:**
1. Checks ALL evaluators have completed (can't finalize early)
2. For each bid, averages all evaluators' total scores
3. Compares average to the minimum threshold
4. Sets bid status to QUALIFIED or DISQUALIFIED
5. Creates/updates `evaluation_summaries` records
6. Notifies committee members that financial evaluation can begin

#### Function 9: `getFinancialEvaluationData()` — The Automatic Calculator

**Key logic:**
1. Only works after technical finalization
2. Fetches only qualified bids
3. Finds the cheapest bid (lowest amount)
4. Financial Score = (`lowestPrice` / `thisPrice`) × 100
5. Combined Score = (techWeight% × techScore) + (finWeight% × financialScore)
6. Sorts by combined score to assign ranks
7. Saves all calculated scores to `evaluation_summaries`

#### Function 13: `getTenderResults()` — Different Views for Different Users

This function returns different data depending on WHO is asking:

**For Bidders:**
- Only available when tender status = AWARDED
- Shows ALL bidders' names, scores, and rankings (public transparency)
- Marks their own bid with `isMine: true` so the UI can highlight it
- Sorted by rank (ranked bids first, then disqualified bids)

**For Officers/Evaluators:**
- Available anytime (even during evaluation)
- Shows EXTRA detail: individual evaluator remarks and individual evaluator scores per bid
- Used for the detailed Bid Evaluation Report

---

## 18. Common Defense Questions and Answers

### Q1: "What is the evaluation process in your system?"
**A:** The evaluation follows a structured 5-step process: (1) The officer assigns a committee of at least 3 evaluators, (2) Each evaluator independently scores every bid against predefined criteria without seeing prices, (3) The system calculates average scores and eliminates bids below the minimum threshold, (4) The system automatically calculates financial scores based on price comparison and combines them with technical scores using weighted percentages, (5) The officer confirms the highest-ranked bid as the winner and publishes results to all bidders. This mirrors the Ethiopian public procurement framework.

### Q2: "Why do you need at least 3 committee members?"
**A:** This ensures **fairness, objectivity, and balance**. With one judge, personal bias could affect the outcome. With three or more independent evaluators whose scores are averaged, any individual bias is diluted. One judge might favor a company they know, but if two others score objectively, the average score reflects the true quality. This also follows standard procurement regulations that require multi-member evaluation committees.

### Q3: "Why are bid prices hidden during technical evaluation?"
**A:** This prevents **price bias**. If evaluators see that one company is very cheap, they might unconsciously give it higher technical scores to help it win, or give an expensive company lower scores. By hiding the price, evaluators focus purely on the quality of the technical proposal — their methodology, experience, and capability. The financial comparison happens only after the technical evaluation is finalized, in a separate automated step.

### Q4: "Explain the financial score formula."
**A:** The financial score rewards lower prices. The formula is: Financial Score = (Lowest Price ÷ This Bidder's Price) × 100. The cheapest bidder always gets exactly 100 points. Others get proportionally less. For example, if the cheapest bid is ETB 450,000 and another bid is ETB 500,000: Financial Score = (450,000 ÷ 500,000) × 100 = 90.0. This means the more expensive bidder gets 90 out of 100 for their price, reflecting that their price is 10% higher than the cheapest.

### Q5: "Why doesn't the cheapest bidder always win?"
**A:** Because the final ranking uses a **weighted combination** of technical quality and price. Typically, technical quality is weighted at 80% and price at 20%. So a bidder with excellent technical quality (score 88) but slightly higher price will beat a bidder with mediocre quality (score 75) but the lowest price, because: (0.80 × 88) + (0.20 × 93.75) = 89.15 beats (0.80 × 75) + (0.20 × 100) = 80.0. This prevents a "race to the bottom" where companies win just by being cheap but can't actually deliver quality work.

### Q6: "What technologies does the evaluation system use?"
**A:** Frontend uses **Next.js** (React + TypeScript) for the user interface, **TanStack Query** for data fetching and caching, and **jsPDF** for PDF report generation. The backend uses **Node.js + Express** as the server framework, **Prisma ORM** to communicate with the **PostgreSQL** database, and **Zod** for input validation. All communication between frontend and backend happens via **REST API** calls (HTTP requests).

### Q7: "What is the difference between a Route, Controller, and Service?"
**A:** Think of a restaurant:
- **Route** (`evaluation.routes.ts`) = the **menu** — lists what URLs are available and who can access them (e.g., only PROCUREMENT_OFFICER can assign committee)
- **Controller** (`evaluation.controller.ts`) = the **waiter** — receives the request, validates the data format, and passes it to the kitchen. Doesn't do the actual cooking.
- **Service** (`evaluation.service.ts`) = the **chef** — does ALL the real work: database queries, score calculations, business logic, notifications. This is where the evaluation algorithms live.

### Q8: "What happens if an evaluator makes a mistake in their scores?"
**A:** The system uses **UPSERT** (insert or update). If an evaluator has already submitted scores, they can submit again and the system UPDATES their existing scores instead of creating duplicates. This works until the officer clicks "Finalize Technical Evaluation" — after that point, scores are locked and cannot be changed. The confirmation dialog warns: "You can update your scores until the officer finalizes."

### Q9: "How does the system prevent corruption or favoritism?"
**A:** Multiple safeguards: (1) **Multiple evaluators** — at least 3 judges average out individual bias, (2) **Price blindness** — evaluators can't see bid amounts during technical evaluation, (3) **Independent scoring** — evaluators don't see each other's scores until all have submitted, (4) **Rank enforcement** — the officer can only award to the Rank #1 bidder, not choose a favorite, (5) **Audit logging** — every action is recorded with who did it and when, (6) **Full transparency** — all bidders see the complete scoreboard after results are published.

### Q10: "What is debriefing and why is it important?"
**A:** Debriefing is the right of a losing bidder to request an explanation of why they didn't win. It's important for **transparency, trust, and improvement**: (1) It holds the evaluation process accountable, (2) It gives bidders feedback to improve future proposals, (3) It's a legal requirement in many procurement frameworks. The officer sees the bidder's scores, rank, and can write a detailed explanation of strengths and weaknesses. The bidder gets notified when the response is ready.

### Q11: "Walk me through what happens when an evaluator opens the evaluation page."
**A:** 
1. Evaluator clicks "Evaluate" on their dashboard
2. Browser navigates to `/evaluator/tenders/5/evaluate`
3. Frontend sends `GET /api/tenders/5/evaluation/technical` with the evaluator's auth token
4. Backend's `evaluation.routes.ts` routes it through `authenticate` and `authorize("EVALUATOR")` middleware
5. `evaluation.service.ts → getTechnicalEvaluationData()` checks the evaluator is assigned to this tender's committee
6. It fetches the tender's evaluation criteria (Experience: 40, Capability: 30, etc.)
7. It fetches all opened bids with their technical proposals and documents — but **strips out bid amounts** (prices) to prevent bias
8. It also fetches any existing scores this evaluator already submitted
9. All this data comes back to the frontend
10. The page renders one card per bid, each with score input fields and the bidder's proposal/documents, pre-filled if the evaluator previously submitted

### Q12: "How are reports generated?"
**A:** Reports are generated in two steps: (1) The backend collects and aggregates data from multiple database tables. For example, the Bid Evaluation Report joins data from `tenders`, `bids`, `evaluations`, `evaluation_summaries`, and `evaluation_committee_assignments` tables. (2) The frontend displays this data in tables with summary statistics. When the officer clicks "Export PDF," the `jsPDF` library creates a formatted PDF document entirely in the browser — no server call needed — and downloads it to the user's computer.

### Q13: "What is the `evaluation_summaries` table and why is it needed?"
**A:** The `evaluation_summaries` table stores the **final calculated results** for each bid — the average technical score, financial score, combined score, rank, qualification status, and winner flag. Without it, we'd have to recalculate these from the raw evaluation data every time someone views results. Think of it as the **final grade sheet** versus the individual judges' scorecards. It also serves as the official record for reporting and transparency.

### Q14: "How does the system handle the case where no bids pass the technical evaluation?"
**A:** If no bids meet the minimum technical score threshold, all bids are marked as `TECHNICALLY_DISQUALIFIED`. The financial evaluation step would then show "No qualified bids for financial evaluation" and the officer cannot proceed with awarding. The tender essentially fails — no winner can be selected. The officer would need to cancel and re-publish the tender, possibly with adjusted requirements or a lower minimum score.

### Q15: "Why do you use both `evaluations` and `evaluation_summaries` tables?"
**A:** They serve different purposes: The `evaluations` table stores **individual** judges' raw scores — each committee member's scorecard for each bid (3 judges × 5 bids = 15 rows). The `evaluation_summaries` table stores the **calculated final results** — one row per bid with the averaged score, financial score, combined score, and rank. Separating them gives us both transparency (we can show individual evaluator scores) and efficiency (we don't recalculate averages every time). This is a common database design pattern called **data normalization** — storing raw data separately from derived/calculated data.

### Q16: "How does the system ensure only the officer can finalize and award?"
**A:** Access control happens at three levels: (1) The **route** uses `authorize("PROCUREMENT_OFFICER")` middleware — if the user isn't an officer, the request is rejected immediately, (2) The **service** checks `tender.createdBy !== officerId` — only the officer who CREATED the tender can act on it, not any random officer, (3) The **frontend** conditionally shows/hides buttons based on the user's role and the tender's status, so unauthorized users never even see the option.

### Q17: "What is Zod and why do you use it for validation?"
**A:** Zod is a **data validation library**. Before the backend processes any request, Zod checks that the data is the right format. For example, the committee assignment schema checks: (1) `memberIds` must be an array, (2) Each ID must be a positive integer, (3) At least 3 members required. If any check fails, the system returns an error BEFORE touching the database. This prevents bad data from corrupting the system — like trying to submit scores with negative numbers or assigning only 1 evaluator.

### Q18: "What is the `[id]` in paths like `evaluator/tenders/[id]/evaluate/page.tsx`?"
**A:** The `[id]` is a **dynamic route parameter** — a placeholder that gets replaced with an actual number. So `[id]` could be `5`, `12`, or `100`. The URL `/evaluator/tenders/5/evaluate` shows the evaluation page for tender #5, while `/evaluator/tenders/12/evaluate` shows it for tender #12. Both use the same page template file. The page reads the actual tender ID from the URL using `useParams()` and fetches the specific data for that tender.

---

> **Final Tip for Your Defense:** When they ask "How does X work?", always describe the flow in this order:
> 1. What the **user sees** and clicks (frontend)
> 2. Where the request **goes** on the server (route → controller → service)
> 3. What **checks** the system makes (validation and access control)
> 4. What **calculations** the system performs (scoring math)
> 5. What gets **saved** in the database (which table, which columns)
> 6. What **response** or **notification** the user gets
>
> This shows you understand the complete picture, not just one layer.
>
> **And remember the scoring formula:**
> - **Technical Score** = Sum of criteria scores (e.g., 35 + 25 + 22 = 82)
> - **Average** = Sum of all evaluators' totals ÷ number of evaluators
> - **Financial Score** = (Cheapest Price ÷ This Price) × 100
> - **Combined** = (Tech Weight × Tech Score) + (Fin Weight × Fin Score)
> - **Rank #1 WINS**
