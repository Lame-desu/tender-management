# 📋 Student 2: Tender Publishing & Bid Submission — Complete Defense Guide

> **Who is this for?** A student with ZERO technical background who needs to understand and defend this feature area in a final year project presentation.
>
> **Rule:** Every technical word is explained immediately in parentheses the first time it appears. If you see something you don't understand, keep reading — the explanation follows within the same sentence.

---

## TABLE OF CONTENTS

1. [What Is My Feature in Simple Words](#1-what-is-my-feature-in-simple-words)
2. [The Big Picture — How My Part Fits Into the Whole System](#2-the-big-picture)
3. [The Tender Lifecycle Explained Simply](#3-the-tender-lifecycle-explained-simply)
4. [Every Screen the Officer Sees](#4-every-screen-the-officer-sees)
5. [How Creating a Tender Works — End to End](#5-how-creating-a-tender-works)
6. [How Publishing a Tender Works](#6-how-publishing-a-tender-works)
7. [How Addenda Work](#7-how-addenda-work)
8. [How Clarifications Work](#8-how-clarifications-work)
9. [Every Screen the Bidder Sees](#9-every-screen-the-bidder-sees)
10. [How Browsing Tenders Works](#10-how-browsing-tenders-works)
11. [How Bid Submission Works — End to End](#11-how-bid-submission-works)
12. [How Bid Tracking Works](#12-how-bid-tracking-works)
13. [How Document Uploads Work](#13-how-document-uploads-work)
14. [The Validation Rules](#14-the-validation-rules)
15. [The Database Tables — Your Spreadsheets](#15-the-database-tables)
16. [How the Files Connect to Each Other](#16-how-the-files-connect-to-each-other)
17. [Common Defense Questions & Answers](#17-common-defense-questions-and-answers)

---

## 1. What Is My Feature in Simple Words

Imagine the government needs to buy 1,000 chairs for a new school. Instead of just calling one furniture store, they want to be **fair** and give **every** furniture store an equal chance to offer their best price and quality. That's what this system does — digitally.

**My feature has TWO sides:**

### Side 1: The Officer (The Person Buying)
Think of a **Procurement Officer** like someone who posts a **job advertisement** in a newspaper:
- They write a detailed ad describing exactly what they need (the tender)
- They set rules for who can apply (eligibility criteria)
- They set a deadline for applications (submission deadline)
- They answer questions from applicants (clarifications)
- They can update the ad if something changes (addenda)

### Side 2: The Bidder (The Person Selling)
Think of a **Bidder** like a company that **applies for the job**:
- They browse available ads/tenders to find ones they can do
- They ask questions if something isn't clear (clarifications)
- They prepare their application (bid) with documents proving their capability
- They state their price (financial proposal)
- They submit everything before the deadline
- They track whether their application was received and what's happening with it

### In One Sentence
**I handle everything from when the government POSTS a buying opportunity to when companies SUBMIT their offers — but NOT the evaluation or decision of who wins (that's Student 3's part).**

---

## 2. The Big Picture

Here's how my part fits into the complete system:

```
┌─────────────────────────────────────────────────────────────────────┐
│                  ONLINE TENDER MANAGEMENT SYSTEM                    │
├──────────────┬──────────────────────────────────┬───────────────────┤
│  STUDENT 1   │         ★ STUDENT 2 (ME) ★       │    STUDENT 3      │
│              │                                  │                   │
│  Users &     │  Tender Publishing               │  Evaluation &     │
│  Auth &      │  &                               │  Award &          │
│  Admin       │  Bid Submission                   │  Reporting        │
│              │                                  │                   │
│  WHO can     │  WHAT is being bought             │  WHO wins         │
│  use the     │  and WHO offers to sell            │  and WHY          │
│  system      │                                  │                   │
├──────────────┼──────────────────────────────────┼───────────────────┤
│  Happens     │  Happens SECOND                   │  Happens THIRD    │
│  FIRST       │  (after people have accounts)     │  (after bids      │
│              │                                  │   are submitted)  │
└──────────────┴──────────────────────────────────┴───────────────────┘
```

### The Restaurant Analogy

Think of the whole system as a **restaurant**:

| Part | Restaurant Equivalent | Who |
|------|----------------------|-----|
| Student 1 (Auth) | The **door** — checking IDs, letting people in | Bouncer |
| **Student 2 (Me)** | The **menu & ordering** — posting what's available, taking customer orders | Waiter + Kitchen Board |
| Student 3 (Evaluation) | The **kitchen & serving** — judging which order is best, announcing the winner | Chef + Manager |

**I am the waiter and menu board.** Without me, there's nothing to order, and nobody can place an order.

---

## 3. The Tender Lifecycle Explained Simply

A tender goes through stages, like a package being delivered:

```
  📝 DRAFT            📢 PUBLISHED          ❓ CLARIFICATION       ✉️ BIDDING
  ┌─────────┐         ┌─────────┐          ┌─────────┐          ┌─────────┐
  │ Officer  │         │ Bidders │          │ Bidders │          │ Bidders │
  │ writes   │ ──────► │ can now │ ──────►  │ ask     │ ──────►  │ submit  │
  │ the      │ Publish │ SEE it  │          │ quest-  │          │ their   │
  │ tender   │         │         │          │ ions    │          │ bids    │
  └─────────┘         └─────────┘          └─────────┘          └─────────┘
   Only the            Notification          Officer               Before
   officer             sent to ALL           answers               the
   can see it          bidders               them                  deadline!
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │ 📦 BID OPENING  │
                                              │ Officer clicks   │
                                              │ "Open Bids"      │
                                              │ after deadline    │
                                              └────────┬─────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │ Goes to Student  │
                                              │ 3's feature      │
                                              │ (Evaluation)     │
                                              └─────────────────┘
```

### Each Stage Explained Like Real Life

| Stage | Status | Real-Life Analogy | Who Can Act |
|-------|--------|-------------------|-------------|
| **1. Draft** | `DRAFT` | Writing a job ad on paper but not posting it yet. Only you can see it. | Officer only |
| **2. Published** | `PUBLISHED` | Pinning the job ad on the public notice board. Everyone can read it now. | Officer publishes; Bidders browse |
| **3. Clarification** | Still `PUBLISHED` | People calling you to ask "Does this job require a degree?" and you answering publicly. | Bidders ask; Officer answers |
| **4. Bidding** | Still `PUBLISHED` | People mailing their resumes and cover letters before the deadline. | Bidders submit bids |
| **5. Deadline Passes** | Still `PUBLISHED` | The mailbox is closed. No more applications accepted. | Nobody — time ran out |
| **6. Bid Opening** | → `UNDER_EVALUATION` | Opening all the sealed envelopes in front of an audience. Recording who applied. | Officer clicks "Open Bids" |
| **7+** | Evaluation/Award | *This is Student 3's job* | — |

### Two Important Deadlines

Every tender has TWO deadlines set by the officer:

```
  TODAY           CLARIFICATION            SUBMISSION
    │              DEADLINE                 DEADLINE
    │                 │                        │
    ▼                 ▼                        ▼
────┤─────────────────┤────────────────────────┤──────────►  time
    │                 │                        │
    │◄── Questions ──►│                        │
    │    allowed       │◄── Bids accepted ─────►│
    │                 │                        │
    │                 │    Questions CLOSED     │
    │                 │    but bids still OK    │
```

- **Clarification Deadline**: Last day bidders can ask questions (always BEFORE submission deadline)
- **Submission Deadline**: Last day bidders can submit their bids

---

## 4. Every Screen the Officer Sees

### 4.1 Officer Dashboard

**File:** `frontend/src/app/(dashboard)/officer/dashboard/page.tsx`

**What it looks like:** The first thing a Procurement Officer sees when they log in.

```
┌────────────────────────────────────────────────────────────────────┐
│  Dashboard                                    [+ Create Tender]    │
├────────────────┬────────────────┬────────────────┬─────────────────┤
│ Total Tenders  │ Draft          │ Published      │ Awarded         │
│     12         │     3          │     5          │     4           │
│  📄            │  📝            │  ✅            │  🏆            │
├────────────────┴────────────────┴────────────────┴─────────────────┤
│                       Recent Tenders                               │
├────────────────────┬──────────┬───────────┬──────────┬─────┬───────┤
│ Title              │ Category │ Status    │ Deadline │ Bids│       │
├────────────────────┼──────────┼───────────┼──────────┼─────┼───────┤
│ Office Supplies... │ GOODS    │ PUBLISHED │ Jun 15   │  3  │ View  │
│ Road Construction  │ WORKS    │ DRAFT     │ Jul 01   │  0  │ View  │
│ IT Consulting      │ CONSULT  │ AWARDED   │ May 10   │  7  │ View  │
└────────────────────┴──────────┴───────────┴──────────┴─────┴───────┘
```

**What the 4 stat cards show:**
| Card | What It Counts | Source |
|------|---------------|--------|
| Total Tenders | ALL tenders this officer created | `tender.service.ts` → `getOfficerStats()` groups by status |
| Draft | Tenders still being written | `status = DRAFT` |
| Published | Tenders that bidders can see | `status = PUBLISHED` |
| Awarded | Tenders where a winner was chosen | `status = AWARDED` |

**How data loads:** When the officer opens this page, the frontend (what they see) sends a request to the backend (the brain) asking `GET /api/tenders/officer-stats`. The backend counts the officer's tenders grouped by status and sends back the numbers + 5 most recent tenders.

---

### 4.2 Tender List Page ("My Tenders")

**File:** `frontend/src/app/(dashboard)/officer/tenders/page.tsx`

**What it looks like:** A table showing ALL tenders this officer has created.

```
┌────────────────────────────────────────────────────────────────────┐
│  My Tenders                                   [+ Create Tender]    │
├────────────────────────────────────────────────────────────────────┤
│  🔍 Search tenders...  │ Status: [All ▼] │ Category: [All ▼]      │
├────────────────────┬──────────┬────────────────┬────────┬─────┬────┤
│ Title              │ Category │ Status         │Published│Dead │Bids│ ···
├────────────────────┼──────────┼────────────────┼────────┼─────┼────┤
│ Office Supplies    │ GOODS    │ PUBLISHED      │ Jun 1  │Jun15│  3 │ ···
│                    │          │ ⚠️ Awaiting    │        │     │    │
│                    │          │    Opening     │        │     │    │
│ Road Construction  │ WORKS    │ DRAFT          │  —     │Jul 1│  0 │ ···
└────────────────────┴──────────┴────────────────┴────────┴─────┴────┘
```

**Features on this page:**

| Feature | What It Does |
|---------|-------------|
| 🔍 Search box | Type a word to find tenders by title |
| Status dropdown | Filter by DRAFT, PUBLISHED, AWARDED, etc. |
| Category dropdown | Filter by GOODS, WORKS, or CONSULTING |
| "⚠️ Awaiting Opening" badge | Appears when a tender is PUBLISHED but the deadline has passed (bids need to be opened) |
| `···` menu button | Shows actions: **View**, **Edit** (drafts only), **Publish** (drafts only), **Cancel** (drafts or published) |
| Pagination | Previous/Next buttons if there are more than 15 tenders |

**The `···` (three dots) menu — available actions depend on tender status:**

| Tender Status | Available Actions |
|--------------|-------------------|
| DRAFT | View, Edit, Publish, Cancel |
| PUBLISHED | View, Cancel |
| UNDER_EVALUATION | View only |
| AWARDED | View only |
| CANCELLED | View only |

**Confirmation dialogs:** When the officer clicks "Publish" or "Cancel", a confirmation popup appears asking "Are you sure?" The officer must click "Publish" or "Cancel Tender" again to confirm. This prevents accidental actions.

---

### 4.3 Create New Tender Page

**File:** `frontend/src/app/(dashboard)/officer/tenders/new/page.tsx` + `frontend/src/components/shared/TenderForm.tsx`

**What it looks like:** A long form divided into 4 sections (cards):

```
┌────────────────────────────────────────────────────────┐
│  Create New Tender                                      │
│                                                        │
│  ┌── Section 1: Basic Information ────────────────────┐ │
│  │ Title *:        [Supply of Office Furniture       ]│ │
│  │ Category *:     [Goods ▼]                          │ │
│  │ Description *:  [We need to purchase 500 desks    ]│ │
│  │                 [and 500 chairs for the new...    ]│ │
│  │                 [12/50 characters minimum         ]│ │
│  │ Eligibility *:  [Must be registered company with  ]│ │
│  │                 [min 3 years experience           ]│ │
│  └────────────────────────────────────────────────────┘ │
│                                                        │
│  ┌── Section 2: Required Documents ───────────────────┐ │
│  │ [Company Registration Certificate     ] [🗑️]        │ │
│  │ [Tax Clearance Certificate            ] [🗑️]        │ │
│  │ [Trade License                        ] [🗑️]        │ │
│  │ [+ Add Document]                                    │ │
│  └────────────────────────────────────────────────────┘ │
│                                                        │
│  ┌── Section 3: Evaluation Criteria ──────────────────┐ │
│  │ [Experience and Track Record  ] [40] % [🗑️]        │ │
│  │ [Technical Capability         ] [30] % [🗑️]        │ │
│  │ [Delivery Timeline            ] [30] % [🗑️]        │ │
│  │ [+ Add Criterion]               Total: 100% ✅     │ │
│  │─────────────────────────────────────────────────── │ │
│  │ Technical Weight: [80] %                           │ │
│  │ Financial Weight: [20] %                           │ │
│  │ Tech (80%) + Financial (20%) = 100% ✅             │ │
│  │ Min. Technical Score: [70]                         │ │
│  └────────────────────────────────────────────────────┘ │
│                                                        │
│  ┌── Section 4: Deadlines & Bid Security ─────────────┐ │
│  │ Clarification Deadline *: [2026-06-01 17:00      ] │ │
│  │ Submission Deadline *:    [2026-06-15 17:00      ] │ │
│  │ [🔘] Bid Security Required                         │ │
│  │ Bid Security Amount (ETB) *: [50,000             ] │ │
│  └────────────────────────────────────────────────────┘ │
│                                                        │
│          [Cancel]  [Save as Draft]  [Save & Publish]   │
└────────────────────────────────────────────────────────┘
```

**Every field explained:**

| Field | What It Means | Example | Rules |
|-------|--------------|---------|-------|
| Title | The name of the tender | "Supply of Office Furniture" | Minimum 10 characters |
| Category | What type of purchase | GOODS / WORKS / CONSULTING | Must pick one |
| Description | Detailed explanation of what's needed | "We need 500 desks..." | Minimum 50 characters |
| Eligibility | Who is allowed to bid | "Must be registered for 3+ years" | Cannot be empty |
| Required Documents | List of documents bidders must upload | "Tax Certificate", "Trade License" | At least 1 document |
| Evaluation Criteria | What aspects will be scored and their weights | "Experience: 40%, Capability: 30%..." | Must add to 100% |
| Technical Weight | How much the technical proposal matters vs price | 80% | Tech + Financial must = 100% |
| Financial Weight | How much the price matters | 20% | Tech + Financial must = 100% |
| Min. Technical Score | Minimum passing grade for technical quality | 70 | 0-100 |
| Clarification Deadline | Last day to ask questions | June 1, 2026 | Must be BEFORE submission deadline |
| Submission Deadline | Last day to submit bids | June 15, 2026 | Must be in the FUTURE |
| Bid Security Required | Whether bidders must provide a bank guarantee | On/Off switch | — |
| Bid Security Amount | How much the guarantee must be (in ETB) | 50,000 | Required if switch is ON |

**Three buttons at the bottom:**
| Button | What It Does |
|--------|-------------|
| Cancel | Goes back without saving anything |
| Save as Draft | Saves the tender but keeps it hidden from bidders (status = DRAFT) |
| Save & Publish | Saves AND immediately makes it visible to all bidders (status = PUBLISHED) |

---

### 4.4 Tender Detail Page (Officer View)

**File:** `frontend/src/app/(dashboard)/officer/tenders/[id]/page.tsx`

This is the most complex page — it shows everything about one tender. It has **tabs** (like folders in a filing cabinet):

```
┌────────────────────────────────────────────────────────────────┐
│  Supply of Office Furniture for Ministry of Education          │
│  [PUBLISHED]  by John Doe · 5 bids                            │
│                                                                │
│  [Edit] [Issue Addendum] [Cancel]     ← action buttons        │
│                                                                │
│  ┌─Info─┬─Addenda (2)─┬─Clarifications (3)─┬─Bids (5)─┬─...─┐│
│  │  ★   │             │                    │          │      ││
│  ├──────┴─────────────┴────────────────────┴──────────┴──────┤│
│  │                                                           ││
│  │  (content depends on which tab is selected)               ││
│  │                                                           ││
│  └───────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────────┘
```

**Action buttons depend on status:**

| Status | Available Buttons |
|--------|------------------|
| DRAFT | Edit, Publish, Cancel |
| PUBLISHED | Issue Addendum, Cancel |
| UNDER_EVALUATION | (none — evaluation is in progress) |
| AWARDED | (none — tender is finished) |

**The tabs:**

#### Tab 1: Info
Shows all tender details — description, category, eligibility, required documents, evaluation criteria table, deadlines, bid security info.

#### Tab 2: Addenda
Shows all modifications/updates issued after publishing. Each addendum shows:
- Addendum number (#1, #2, #3...)
- Description of what changed
- New deadline (if extended)
- Who issued it and when

#### Tab 3: Clarifications
Shows the Q&A between bidders and the officer:
- Each question is shown with who asked it and when
- **Unanswered questions** have a yellow "Pending" badge and an "Answer" button
- **Answered questions** show the answer in a grey box
- The officer types their answer and clicks "Submit Answer"

#### Tab 4: Bids (only visible after publishing)
Shows a table of all submitted bids. When the deadline has passed, shows an "Open Bids" button. After opening:
- Each bid is expandable — clicking a row shows the technical proposal and uploaded documents
- Documents have a download button

#### Tab 5: Evaluation (only visible after bid opening)
*This is Student 3's territory — the evaluation steps happen here*

---

### 4.5 Edit Tender Page

**File:** `frontend/src/app/(dashboard)/officer/tenders/[id]/edit/page.tsx`

- **Only works for DRAFT tenders** — if the tender is already published, it shows "Only draft tenders can be edited"
- Uses the same `TenderForm` component as the Create page, but pre-filled with existing data
- The form loads the current tender data, the officer makes changes, then clicks "Save as Draft" or "Save & Publish"

---

## 5. How Creating a Tender Works

Here's what happens step by step when an officer clicks "Save as Draft":

```
 OFFICER'S BROWSER                    THE INTERNET              THE SERVER (Backend)              THE DATABASE
 (what they see)                                                 (the brain)                      (storage)
 ─────────────────                   ─────────────              ────────────────                  ──────────
                                           │
 1. Officer fills                          │
    out the form                           │
       │                                   │
       ▼                                   │
 2. Clicks "Save                           │
    as Draft"                              │
       │                                   │
       ▼                                   │
 3. Frontend CHECKS                        │
    (validates) the                        │
    form:                                  │
    - Title >= 10 chars?                   │
    - Description >= 50?                   │
    - Category selected?                   │
    - Criteria = 100%?                     │
    - Deadlines OK?                        │
       │                                   │
       ▼  (if all OK)                      │
 4. Sends data ──────────────────────►     │
    POST /api/tenders                      │
    {title, description,                   ▼
    category, ...}                   5. tender.routes.ts
                                       receives the request
                                           │
                                           ▼
                                     6. tender.controller.ts
                                       - Validates AGAIN
                                         (double check)
                                       - Uses Zod library
                                         to verify all
                                         rules
                                           │
                                           ▼
                                     7. tender.service.ts
                                       createTender()
                                       - Adds status = "DRAFT"
                                       - Adds createdBy = 
                                         officer's ID                    
                                       - Adds timestamps ──────────► 8. INSERT into
                                                                        "tenders" table
                                                                           │
                                     9. Creates audit log ──────────► INSERT into
                                        "Created tender"                "audit_logs"
                                           │                               │
                                           ▼                               │
                                     10. Sends back the                    │
                                         new tender data ◄────────────  DONE!
       │                                   │
       ▼                                   │
 11. Frontend receives                     │
     the response                          │
       │                                   │
       ▼                                   │
 12. Shows "Tender                         │
     created as draft"                     │
     toast message                         │
       │                                   │
       ▼                                   │
 13. Redirects to the                      │
     tender detail page                    │
```

### What If "Save & Publish" Is Clicked Instead?

The same process happens, but with one extra step:
- After step 7 (creating the tender), the frontend makes a **second request**: `PATCH /api/tenders/{id}/publish`
- This changes the status from DRAFT to PUBLISHED (see Section 6)

---

## 6. How Publishing a Tender Works

When the officer clicks "Publish" (either from the form or the list page):

```
 OFFICER clicks "Publish"
       │
       ▼
 Confirmation dialog appears:
 "Publish 'Office Supplies'? All bidders will be notified."
       │
       ▼ (clicks "Publish")
       │
 Frontend sends: PATCH /api/tenders/5/publish
       │
       ▼
 tender.controller.ts → publish()
       │
       ▼
 tender.service.ts → publishTender()
       │
       ├── 1. Find the tender in database
       │     → Is it NOT FOUND? → Error: "Tender not found"
       │     → Is it NOT owned by this officer? → Error: "Access denied"
       │     → Is it NOT draft? → Error: "Only draft tenders can be published"
       │
       ├── 2. Update the tender:
       │     → status: "DRAFT" → "PUBLISHED"
       │     → publishDate: set to current date/time
       │
       ├── 3. Find ALL active bidders in the system
       │     → SELECT all users WHERE role = "BIDDER" AND status = "ACTIVE"
       │
       └── 4. Create a NOTIFICATION for EACH bidder:
             → "New tender published: Office Supplies for Ministry..."
             → notificationType: "TENDER_PUBLISHED"
             
             This is why bidders see a 🔔 notification!
```

**Key insight:** Publishing is a ONE-WAY action. You cannot "unpublish" a tender. You can only CANCEL it (which is different — it marks it as cancelled and notifies bidders who already submitted bids).

---

## 7. How Addenda Work

An **addendum** (plural: **addenda**) is an official update or modification to a published tender. Think of it like a **correction notice** on a bulletin board.

**Example:** "We originally said we need 500 chairs. We actually need 700 chairs. Also, the deadline is extended by 2 weeks."

### When Can Addenda Be Issued?
Only for **PUBLISHED** tenders. You can't modify a draft (just edit it directly) or a closed tender.

### Step-by-Step Flow

```
 OFFICER clicks "Issue Addendum"
       │
       ▼
 Dialog box appears:
 ┌─────────────────────────────────────┐
 │ Issue Addendum                       │
 │                                     │
 │ Description *:                      │
 │ [The quantity has increased from    ]│
 │ [500 to 700 chairs. Specifications ]│
 │ [remain the same.                  ]│
 │                                     │
 │ New Submission Deadline (optional): │
 │ [2026-07-01 17:00          ]        │
 │                                     │
 │           [Cancel]  [Issue Addendum]│
 └─────────────────────────────────────┘
       │
       ▼ (clicks "Issue Addendum")
       │
 Frontend sends: POST /api/tenders/5/addenda
   { description: "The quantity...", newDeadline: "2026-07-01" }
       │
       ▼
 tender.service.ts → issueAddendum()
       │
       ├── 1. Check: tender exists? owned by this officer? status = PUBLISHED?
       │
       ├── 2. Get the NEXT addendum number
       │     → Finds the highest existing number and adds 1
       │     → First addendum = #1, second = #2, etc.
       │
       ├── 3. Save the addendum to the database (tender_addenda table)
       │
       ├── 4. If new deadline is LATER than current deadline:
       │     → UPDATE the tender's submission deadline
       │     (The system only extends deadlines, never shortens them)
       │
       └── 5. Notify ALL active bidders:
             → "Addendum #1 issued for: Office Supplies..."
             → notificationType: "ADDENDUM_ISSUED"
```

**Important rule:** An addendum can extend the deadline but the system only updates it if the new deadline is LATER than the current one. This prevents accidentally shortening the deadline.

---

## 8. How Clarifications Work

Clarifications are a **Q&A system** between bidders and the officer — like a FAQ section for a tender.

### The Bidder Asks a Question

```
 BIDDER is viewing a tender → clicks "Clarifications" tab
       │
       ▼
 Sees the "Ask a Question" form (only if clarification deadline hasn't passed)
       │
       ▼
 Types: "Does the furniture need to be locally manufactured?"
       │
       ▼
 Clicks "Submit Question"
       │
       ▼
 Frontend sends: POST /api/tenders/5/clarifications
   { question: "Does the furniture need to..." }
       │
       ▼
 tender.service.ts → askClarification()
       │
       ├── Check 1: Tender exists and is PUBLISHED
       ├── Check 2: Clarification deadline has NOT passed yet
       │
       ├── Save question to database (clarifications table)
       │     → askedBy: the bidder's ID
       │     → answer: null (not answered yet)
       │
       └── Notify the TENDER'S OFFICER:
             → "New clarification question on: Office Supplies..."
             → notificationType: "CLARIFICATION_ASKED"
```

### The Officer Answers

```
 OFFICER sees the question on the Clarifications tab
 (it has a yellow "Pending" badge)
       │
       ▼
 Clicks "Answer" → a text box appears
       │
       ▼
 Types: "Yes, all furniture must be manufactured locally."
       │
       ▼
 Clicks "Submit Answer"
       │
       ▼
 Frontend sends: PATCH /api/clarifications/12/answer
   { answer: "Yes, all furniture must be..." }
       │
       ▼
 tender.service.ts → answerClarification()
       │
       ├── Save answer and timestamp to database
       │
       └── Notify ALL active bidders (not just the one who asked):
             → "Clarification answered on: Office Supplies..."
             → notificationType: "CLARIFICATION_ANSWERED"
```

### Privacy Protection 🔒

**Important:** When bidders view clarifications, the system **hides** who asked each question. Everyone is shown as "Anonymous Bidder". This prevents competitors from knowing who else is interested in the tender.

This happens in `tender.service.ts` → `getTenderDetail()`:
```
if (userRole === "BIDDER") {
    // Replace real name with "Anonymous Bidder"
    clarification.askedUser = { id: 0, fullName: "Anonymous Bidder" };
}
```

Only the officer can see who actually asked each question.

---

## 9. Every Screen the Bidder Sees

### 9.1 Bidder Dashboard

**File:** `frontend/src/app/(dashboard)/bidder/dashboard/page.tsx`

```
┌────────────────────────────────────────────────────────────────────┐
│  Dashboard                                                         │
├────────────────┬────────────────┬────────────────┬─────────────────┤
│ Active Tenders │ My Bids        │ Pending Results│ Won Bids        │
│     8          │     5          │     2          │     1           │
│  🔍            │  📂            │  ⏳            │  🏆            │
├────────────────┴────────────────┴────────────────┴─────────────────┤
│                                                                    │
│  ┌─ Recent Tenders ────────────┐  ┌─ My Recent Bids ─────────────┐│
│  │                    [View all]│  │                     [View all]││
│  │ ┌──────────────────────┐    │  │ ┌──────────────────────────┐  ││
│  │ │ Office Supplies      │    │  │ │ Road Construction        │  ││
│  │ │ GOODS · in 14 days   │    │  │ │ ETB 2,500,000 · Jun 1   │  ││
│  │ └──────────────────────┘    │  │ │               SUBMITTED  │  ││
│  │ ┌──────────────────────┐    │  │ └──────────────────────────┘  ││
│  │ │ IT Consulting        │    │  │ ┌──────────────────────────┐  ││
│  │ │ CONSULTING · in 7 d  │    │  │ │ Office Supplies          │  ││
│  │ └──────────────────────┘    │  │ │ ETB 1,200,000 · May 28  │  ││
│  └─────────────────────────────┘  │ │               SELECTED 🏆│  ││
│                                   │ └──────────────────────────┘  ││
│                                   └────────────────────────────────┘│
└────────────────────────────────────────────────────────────────────┘
```

**The 4 stat cards:**
| Card | What It Shows | How It's Calculated |
|------|--------------|-------------------|
| Active Tenders | Total PUBLISHED tenders in the system | `bid.service.ts` → counts all tenders where `status = PUBLISHED` |
| My Bids | Total bids this bidder has submitted | Counts bids where `bidderId = this user` |
| Pending Results | Bids still waiting for evaluation | Counts bids with status SUBMITTED, OPENED, TECHNICALLY_QUALIFIED, or EVALUATED |
| Won Bids | Number of tenders this bidder won | Counts bids where `status = SELECTED` |

---

### 9.2 Browse Tenders Page

**File:** `frontend/src/app/(dashboard)/bidder/tenders/page.tsx`

```
┌──────────────────────────────────────────────────────────────────┐
│  Browse Tenders                                                   │
│                                                                  │
│  🔍 Search tenders...  │ Category: [All ▼] │ Sort: [Deadline ▼]  │
│                                                                  │
│  ┌────────────────────────────┐  ┌────────────────────────────┐  │
│  │ Supply of Office Furniture │  │ Road Rehabilitation Works  │  │
│  │ GOODS · PUBLISHED         │  │ WORKS · PUBLISHED          │  │
│  │                            │  │                            │  │
│  │ We need to purchase 500   │  │ Rehabilitation of 20km...  │  │
│  │ desks and 500 chairs...   │  │                            │  │
│  │                            │  │                            │  │
│  │ ⏰ 14 days left           │  │ ⏰ 3 days left ⚠️          │  │
│  │ 🛡️ Required (ETB 50,000) │  │ 🛡️ Not Required           │  │
│  │                            │  │ 2 addenda                  │  │
│  │ [View Details]             │  │ [View Details]             │  │
│  └────────────────────────────┘  └────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────┐  ┌────────────────────────────┐  │
│  │ IT Strategy Consulting     │  │ Medical Equipment Supply   │  │
│  │ CONSULTING · PUBLISHED     │  │ GOODS · PUBLISHED          │  │
│  │ ...                        │  │ ...                        │  │
│  └────────────────────────────┘  └────────────────────────────┘  │
│                                                                  │
│              [Previous]  Page 1 of 3  [Next]                     │
└──────────────────────────────────────────────────────────────────┘
```

**Key features:**
| Feature | What It Does |
|---------|-------------|
| Search bar | Searches tenders by title (case-insensitive) |
| Category filter | Show only GOODS, WORKS, or CONSULTING |
| Sort options | "Deadline: Soonest" (urgent first) or "Newest First" |
| Deadline countdown | Shows time remaining with colors: 🟢 green (> 72 hours), 🟡 amber (24-72 hours), 🔴 red (< 24 hours or "Closed") |
| Bid Security indicator | Shows if security is required and the amount |
| Addenda count | Shows if any modifications were made |
| Cards layout | 2 cards per row on desktop, 1 on mobile |
| Pagination | 12 tenders per page |

**What bidders can see:** Only PUBLISHED tenders. They cannot see DRAFT, CANCELLED, or other statuses.

---

### 9.3 Tender Detail Page (Bidder View)

**File:** `frontend/src/app/(dashboard)/bidder/tenders/[id]/page.tsx`

Similar to the officer's detail page, but from the bidder's perspective:

```
┌────────────────────────────────────────────────────────────────┐
│  Supply of Office Furniture for Ministry of Education          │
│  GOODS · PUBLISHED · Closes in 14 days                        │
│                                                                │
│  ┌─Overview─┬─Addenda (2)─┬─Clarifications (3)─┬─Results─┐    │
│  │   ★      │             │                    │         │    │
│  ├──────────┴─────────────┴────────────────────┴─────────┤    │
│  │                                                       │    │
│  │  Description: We need to purchase...                  │    │
│  │  Eligibility: Must be registered company...           │    │
│  │  Required Documents: ✓ Tax Certificate, ✓ License...  │    │
│  │  Evaluation Criteria:                                 │    │
│  │    Experience: 40% | Capability: 30% | Timeline: 30%  │    │
│  │  Tech Weight: 80% | Financial Weight: 20%             │    │
│  │  Min Technical Score: 70                              │    │
│  │  📅 Clarification Deadline: Jun 1, 2026               │    │
│  │  📅 Submission Deadline: Jun 15, 2026                 │    │
│  │  🛡️ Bid Security: ETB 50,000                          │    │
│  │                                                       │    │
│  │  ┌──────────────────────────────────────────┐         │    │
│  │  │ ✅ You have already submitted a bid      │         │    │
│  │  │    View your bid                         │         │    │
│  │  └──────────────────────────────────────────┘         │    │
│  │  -- OR --                                             │    │
│  │  [            ✉️ Submit Bid (big button)           ]   │    │
│  │  -- OR --                                             │    │
│  │  ⚠️ The submission deadline has passed.               │    │
│  └───────────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────────┘
```

**"Submit Bid" area shows 3 possible states:**

| State | What Shows | Why |
|-------|-----------|-----|
| Can submit | Big "Submit Bid" button | Deadline hasn't passed AND bidder hasn't submitted yet |
| Already submitted | "✅ You have already submitted a bid" + link | System checks `GET /api/tenders/{id}/bids/check` |
| Too late | "⚠️ The submission deadline has passed." | Current date is after the submission deadline |

**The Clarifications Tab (bidder side):**
- Shows "Ask a Question" form if clarification deadline hasn't passed
- Shows "Clarification period has ended" if it has
- Shows all Q&A — but every asker is shown as "Anonymous Bidder" (privacy protection)

**The Results Tab (only visible for AWARDED tenders):**
- Shows the winner announcement banner
- Shows the bidder's own ranking and scores
- Shows the full evaluation leaderboard (all bidders ranked)
- Shows disqualified bids section

---

### 9.4 Bid Submission Page

**File:** `frontend/src/app/(dashboard)/bidder/tenders/[id]/bid/page.tsx`

This is covered in detail in Section 11.

---

### 9.5 My Bids Page

**File:** `frontend/src/app/(dashboard)/bidder/my-bids/page.tsx`

This is covered in detail in Section 12.

---

## 10. How Browsing Tenders Works

When a bidder opens the "Browse Tenders" page:

```
 BIDDER opens Browse Tenders page
       │
       ▼
 Frontend sends: GET /api/tenders?status=PUBLISHED&page=1&limit=12
       │
       ▼
 tender.service.ts → listTenders()
       │
       ├── Since the user is a BIDDER:
       │   → Filter: only show tenders with status
       │     PUBLISHED, UNDER_EVALUATION, or AWARDED
       │   → (Bidders NEVER see DRAFT or their non-public tenders)
       │
       ├── Apply additional filters:
       │   → search? → Filter title containing the search text
       │   → category? → Filter by GOODS/WORKS/CONSULTING
       │
       ├── Count total matching tenders
       │
       └── Return page of results with counts:
             → Each tender includes:
               - All tender details
               - _count.bids (how many bids received)
               - _count.addenda (how many modifications)
               - _count.clarifications (how many Q&A)
               - isExpired flag (if deadline has passed)
```

**Role-based filtering** — the same `listTenders()` function works differently depending on WHO is asking:

| User Role | What They See |
|-----------|-------------|
| Procurement Officer | Only THEIR OWN tenders (all statuses) |
| Bidder | ALL tenders that are PUBLISHED, UNDER_EVALUATION, or AWARDED |
| Evaluator | Only tenders they are assigned to evaluate |
| Admin | ALL tenders from everyone |

---

## 11. How Bid Submission Works

This is one of the most complex flows. Here's everything that happens when a bidder submits a bid:

### The Bid Submission Form

```
┌────────────────────────────────────────────────────────────────┐
│  Submit Bid                                                    │
│  For: Supply of Office Furniture for Ministry of Education     │
│                                                                │
│  ┌── Section 1: Technical Proposal ──────────────────────────┐ │
│  │ Technical Summary *:                                      │ │
│  │ [Our company has 15 years experience in furniture         ]│ │
│  │ [manufacturing. We propose to deliver all 500 desks       ]│ │
│  │ [within 45 days using locally sourced materials...        ]│ │
│  │                                                           │ │
│  │ Technical Documents * (at least 1 required):              │ │
│  │ ┌─ Required Documents Checklist: ─────────────────────┐   │ │
│  │ │ ☑ Company Registration Certificate                  │   │ │
│  │ │ ☑ Tax Clearance Certificate                         │   │ │
│  │ │ ☑ Trade License                                     │   │ │
│  │ └────────────────────────────────────────────────────┘   │ │
│  │                                                           │ │
│  │ ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐ │ │
│  │   📤 Drag and drop files or click to browse              │ │
│  │ │ PDF, DOCX, DOC, XLSX, XLS, JPG, PNG (max 10MB)    │   │ │
│  │ └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘ │ │
│  │ 📄 company_registration.pdf     2.1 MB  [✕]              │ │
│  │ 📄 tax_clearance_2026.pdf       1.3 MB  [✕]              │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌── Section 2: Financial Proposal ──────────────────────────┐ │
│  │ Bid Amount (ETB) *: [1,250,000.00                       ]│ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌── Section 3: Bid Security (only if required) ─────────────┐ │
│  │ Bank Guarantee Reference *: [BG-2026-001                 ]│ │
│  │ Issuing Bank *:             [Commercial Bank of Ethiopia  ]│ │
│  │ Guarantee Amount (ETB) *:   [50,000.00                   ]│ │
│  │ Validity Date *:            [2026-12-31                   ]│ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌── Section 4: Supporting Documents (Optional) ─────────────┐ │
│  │ [Drag and drop area for extra files]                      │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌── Review & Submit ────────────────────────────────────────┐ │
│  │ Technical Summary        420 chars                        │ │
│  │ Technical Documents      2 file(s)                        │ │
│  │ Bid Amount               ETB 1,250,000                    │ │
│  │ Bid Security             Provided                         │ │
│  │ Supporting Documents     0 file(s)                        │ │
│  │                                                           │ │
│  │ [☑] I confirm that all information is accurate            │ │
│  │                                                           │ │
│  │ [              Submit Bid (full-width button)            ] │ │
│  └───────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

### The Complete End-to-End Flow

```
 BIDDER clicks "Submit Bid" on the form
       │
       ▼
 Confirmation dialog appears:
 "Once submitted, your bid cannot be modified. Are you sure?"
       │
       ▼ (clicks "Yes, Submit Bid")
       │
 1. Frontend builds a FormData object
    (special package for sending files + text together)
    │
    ├── Adds: technicalProposal (text)
    ├── Adds: bidAmount (number)
    ├── Adds: bidSecurityInfo (JSON text, if required)
    ├── Adds: technicalDocs (the actual files)
    └── Adds: otherDocs (optional extra files)
       │
       ▼
 2. Sends: POST /api/tenders/5/bids
    with Content-Type: "multipart/form-data"
    (this tells the server that files are included)
       │
       ▼
 3. bid.routes.ts receives the request
    │
    ├── authenticate middleware: Verify the user is logged in
    ├── authorize("BIDDER"): Verify the user is a Bidder
    └── upload.fields(): The UPLOAD MIDDLEWARE processes files
          │
          ├── Saves each file to: uploads/bids/temp/
          ├── Checks file type (only PDF, DOCX, etc.)
          ├── Checks file size (max 10MB per file)
          └── Max 10 technical + 10 other files
       │
       ▼
 4. bid.controller.ts → submitBid()
    │
    ├── Validates the text data using Zod:
    │   - technicalProposal: not empty
    │   - bidAmount: positive number
    │   - bidSecurityInfo: optional text
    │
    └── Calls bid.service.ts
       │
       ▼
 5. bid.service.ts → submitBid()
    │
    ├── CHECK 1: Does the tender exist?
    │   → No → Error: "Tender not found"
    │
    ├── CHECK 2: Is the tender PUBLISHED?
    │   → No → Error: "Tender is not open for bids"
    │
    ├── CHECK 3: Has the deadline passed?
    │   → Yes → Error: "Submission deadline has passed"
    │
    ├── CHECK 4: Has this bidder already submitted a bid?
    │   → Yes → Error: "You have already submitted a bid"
    │   (Uses unique constraint: one bid per bidder per tender)
    │
    ├── CHECK 5: Is the bid amount positive?
    │   → No → Error: "Bid amount must be positive"
    │
    ├── CHECK 6: Is technical proposal provided?
    │   → No → Error: "Technical proposal is required"
    │
    ├── CHECK 7: Is bid security info provided (if required)?
    │   → Required but missing → Error
    │
    ├── CHECK 8: At least one technical document?
    │   → No → Error: "At least one technical document is required"
    │
    ├── 6. CREATE the bid record in database:
    │     → INSERT into "bids" table
    │     → status: "SUBMITTED"
    │     → submissionDate: NOW
    │
    ├── 7. MOVE files from temp to permanent location:
    │     → FROM: uploads/bids/temp/164789-document.pdf
    │     → TO:   uploads/bids/{bidId}/164789-document.pdf
    │
    ├── 8. CREATE document records in database:
    │     → INSERT into "bid_documents" table
    │     → One row per file with name, type, path, size, category
    │
    └── 9. CREATE notifications:
          → To the OFFICER: "New bid submitted for: Office Supplies by ABC Corp"
          → To the BIDDER: "Your bid for Office Supplies has been submitted successfully"
       │
       ▼
 Frontend receives success response
       │
       ▼
 Shows "Bid submitted successfully!" toast
       │
       ▼
 Redirects to "My Bids" page
```

---

## 12. How Bid Tracking Works

### The My Bids Page

**File:** `frontend/src/app/(dashboard)/bidder/my-bids/page.tsx`

```
┌────────────────────────────────────────────────────────────────────┐
│  My Bids                                                           │
├────────────────┬──────────┬──────────┬──────────┬─────────┬────────┤
│ Tender Title   │ Category │ Bid Amt  │ Submitted│Bid Stat │Tender  │
├────────────────┼──────────┼──────────┼──────────┼─────────┼────────┤
│ Office Supply  │ GOODS    │ 1.25M    │ Jun 01   │SUBMITTED│PUBLISH │ [View]
│ Road Works     │ WORKS    │ 2.50M    │ May 28   │SELECTED │AWARDED │ [View]
│ IT Consulting  │ CONSULT  │ 800K     │ May 15   │NOT_SEL  │AWARDED │ [View]
└────────────────┴──────────┴──────────┴──────────┴─────────┴────────┘
```

**Clicking "View" opens a detail dialog showing:**
- The tender name (clickable link to that tender)
- Full technical proposal text
- Bid amount
- Bid status badge
- Bid security info (if provided)
- All uploaded documents with download buttons
- Evaluation results (if evaluation is complete): technical score, financial score, combined score, rank
- Debriefing section (if bid was NOT_SELECTED): can request an explanation of why they didn't win

### Bid Status Progression

A bid's status changes as it moves through the process:

```
 SUBMITTED ──► OPENED ──► TECHNICALLY   ──► EVALUATED ──► SELECTED
                          QUALIFIED                       (winner!)
                              │
                              └──► TECHNICALLY    ──► NOT_SELECTED
                                   DISQUALIFIED       (didn't win)
```

| Status | Color | What It Means |
|--------|-------|--------------|
| `SUBMITTED` | 🔵 Blue | Bid received, waiting for bid opening |
| `OPENED` | 🟦 Cyan | Bids have been opened, evaluation starting |
| `TECHNICALLY_QUALIFIED` | 🟢 Green | Passed the technical evaluation (scored above minimum) |
| `TECHNICALLY_DISQUALIFIED` | 🔴 Red | Failed technical evaluation (scored below minimum) |
| `EVALUATED` | 🟡 Amber | Both technical and financial scores calculated |
| `SELECTED` | 🟢 Dark Green | **Winner!** This bid was chosen |
| `NOT_SELECTED` | ⚪ Grey | Qualified but not the highest-ranked |

---

## 13. How Document Uploads Work

### The Upload Process (Think of it like attaching files to an email)

```
 STEP 1: Bidder selects files
    │
    ├── Can DRAG AND DROP files onto the upload area
    └── Can CLICK to open the file browser
    │
    ▼
 STEP 2: Frontend checks each file immediately
    │
    ├── Is the file type allowed?
    │   ✅ PDF, DOCX, DOC, XLSX, XLS, JPG, JPEG, PNG
    │   ❌ Everything else (EXE, ZIP, MP4, etc.)
    │
    ├── Is the file under 10MB?
    │   ✅ Under 10MB → add to list
    │   ❌ Over 10MB → show error: "file.pdf exceeds 10MB limit"
    │
    └── File appears in the list with name, size, and [✕] remove button
    │
    ▼
 STEP 3: When "Submit Bid" is clicked, files go to the backend
    │
    ▼
 STEP 4: upload.ts MIDDLEWARE processes files on the server
    │
    ├── Saves files temporarily to: uploads/bids/temp/
    ├── Renames files: adds timestamp to prevent name conflicts
    │   Example: "document.pdf" → "1716120000-document.pdf"
    ├── Checks file type AGAIN (double security)
    └── Checks file size AGAIN (double security)
    │
    ▼
 STEP 5: bid.service.ts MOVES files to permanent location
    │
    ├── Creates folder: uploads/bids/{bidId}/
    └── Moves files from temp to that folder
    │
    ▼
 STEP 6: Records each file in the database
    │
    └── bid_documents table gets one row per file:
        - fileName: "company_registration.pdf"
        - fileType: "application/pdf"
        - filePath: "uploads/bids/42/1716120000-company_registration.pdf"
        - fileSize: 2150400 (in bytes)
        - documentCategory: "TECHNICAL" or "OTHER"
```

### Downloading Files

When someone (officer, evaluator, or the bidder themselves) clicks the download button:
1. Frontend sends: `GET /api/files/{documentId}`
2. `bid.controller.ts` → `downloadFile()` checks permissions:
   - Is the user the bid owner? ✅
   - Is the user the tender's officer? ✅
   - Is the user an assigned evaluator? ✅
   - Is the user an admin? ✅
   - Anyone else? ❌ Access denied
3. The server sends the actual file back

---

## 14. The Validation Rules

Validation means **checking that all information is correct before allowing an action**. Think of it like a bouncer checking your ID — the system checks the data before letting it through.

### Double Validation — Frontend AND Backend

```
 ┌─────────────────┐           ┌──────────────────┐
 │   FRONTEND      │           │    BACKEND        │
 │   (browser)     │           │    (server)       │
 │                 │           │                   │
 │  Validates      │  ──────►  │  Validates AGAIN  │
 │  IMMEDIATELY    │  sends    │  for SECURITY     │
 │  (for user      │  data     │  (in case someone │
 │   experience)   │           │   bypasses the    │
 │                 │           │   browser check)  │
 └─────────────────┘           └──────────────────┘
```

**Why both?** A clever person could bypass the browser checks using developer tools. The backend check is the **real** security gate.

### Tender Creation Rules

| Rule | Frontend Check | Backend Check (Zod Schema) |
|------|---------------|---------------------------|
| Title minimum 10 characters | ✅ `title.length < 10` | ✅ `z.string().min(10)` |
| Description minimum 50 characters | ✅ `description.length < 50` | ✅ `z.string().min(50)` |
| Category must be selected | ✅ `!category` | ✅ `z.nativeEnum(TenderCategory)` |
| Eligibility criteria required | ✅ `!eligibility` | ✅ `z.string().min(1)` |
| At least 1 required document | ✅ `docs.filter(Boolean).length === 0` | ✅ `z.array().min(1)` |
| At least 1 evaluation criterion | ✅ checks criteria | ✅ `z.array().min(1)` |
| Evaluation criteria must total 100% | ✅ `totalWeight !== 100` | ✅ `.refine(sum === 100)` |
| Technical + Financial weight = 100% | ✅ `techWeight + finWeight !== 100` | ✅ `.refine(sum === 100)` |
| Both deadlines are required | ✅ checks both | ✅ `z.string()` |
| Clarification deadline BEFORE submission | ✅ date comparison | ✅ `.refine(clar < sub)` |
| Submission deadline in the FUTURE | — | ✅ `.refine(sub > now)` |
| Bid security amount required if enabled | ✅ checks amount | ✅ `.refine()` |

### Bid Submission Rules

| Rule | Where Checked | Error Message |
|------|-------------|---------------|
| Tender must exist | Backend service | "Tender not found" |
| Tender must be PUBLISHED | Backend service | "Tender is not open for bids" |
| Submission deadline not passed | Frontend + Backend | "Submission deadline has passed" |
| No duplicate bids | Backend (unique constraint) | "You have already submitted a bid" |
| Technical proposal required | Frontend + Backend | "Technical proposal is required" |
| Bid amount must be positive | Frontend + Backend | "Bid amount must be positive" |
| At least 1 technical doc | Frontend + Backend | "At least one technical document is required" |
| Bid security info (if required) | Frontend + Backend | "Bid security information is required" |
| Files under 10MB | Frontend + Backend | "exceeds 10MB limit" |
| Files correct type | Frontend + Backend | "File type not allowed" |
| Confirmation checkbox | Frontend only | Button stays disabled |

### Clarification Rules

| Rule | What It Checks |
|------|---------------|
| Tender must be PUBLISHED | Can't ask questions about draft tenders |
| Clarification deadline not passed | "Clarification period has ended" |
| Question not empty | "Question is required" |

---

## 15. The Database Tables

The database (a place where ALL data is permanently stored) is like a giant organized **Excel workbook** where each **table** is a separate **sheet**.

### My 5 Tables

```
 ┌─────────────────────────────────────────────────────────────┐
 │                    MY DATABASE TABLES                        │
 │                                                             │
 │  ┌──────────────┐     ┌────────────────┐                    │
 │  │   tenders    │──┬──│ tender_addenda │                    │
 │  │   (the ads)  │  │  │ (corrections)  │                    │
 │  └──────┬───────┘  │  └────────────────┘                    │
 │         │          │                                        │
 │         │          │  ┌────────────────┐                    │
 │         │          └──│ clarifications │                    │
 │         │             │ (Q&A)          │                    │
 │         │             └────────────────┘                    │
 │         │                                                   │
 │         │          ┌────────────────┐                       │
 │         └──────────│     bids       │                       │
 │                    │  (proposals)   │                       │
 │                    └───────┬────────┘                       │
 │                            │                                │
 │                    ┌────────────────┐                       │
 │                    │ bid_documents  │                       │
 │                    │ (uploaded files)│                       │
 │                    └────────────────┘                       │
 └─────────────────────────────────────────────────────────────┘
```

---

### Table 1: `tenders` — The Job Advertisements

**Analogy:** Each row is one job posting on a bulletin board.

| Column Name | What It Stores | Example | Type |
|-------------|---------------|---------|------|
| id | Unique number for this tender | 5 | Auto-generated number |
| title | Name of the tender | "Office Furniture Supply" | Text (min 10 chars) |
| description | Detailed description | "We need 500 desks..." | Text (min 50 chars) |
| category | Type of purchase | GOODS | One of: GOODS, WORKS, CONSULTING |
| eligibility_criteria | Who can bid | "Registered for 3+ years" | Text |
| required_documents | List of docs bidders must provide | ["Tax Cert", "License"] | Array of text |
| evaluation_criteria | Scoring criteria and weights | [{"name":"Experience","weight":40}] | JSON data |
| minimum_technical_score | Passing grade | 70 | Number (0-100) |
| technical_weight | How much technical matters | 80 | Number (%) |
| financial_weight | How much price matters | 20 | Number (%) |
| bid_security_required | Is a bank guarantee needed? | true/false | Boolean (yes/no) |
| bid_security_amount | How much guarantee | 50000 | Number or empty |
| publish_date | When it was published | 2026-06-01 10:00 | Date or empty (null if draft) |
| clarification_deadline | Last day for questions | 2026-06-08 17:00 | Date |
| submission_deadline | Last day for bids | 2026-06-15 17:00 | Date |
| status | Current stage | PUBLISHED | One of: DRAFT, PUBLISHED, UNDER_EVALUATION, AWARDED, CANCELLED |
| created_by | Which officer made it | 3 (officer's user ID) | Number → links to users table |
| created_at | When it was created | 2026-05-30 09:00 | Auto-generated date |
| updated_at | When last modified | 2026-06-01 10:00 | Auto-updated date |

---

### Table 2: `tender_addenda` — The Correction Notices

**Analogy:** Each row is a sticky note attached to a job posting saying "UPDATE: We changed something."

| Column Name | What It Stores | Example |
|-------------|---------------|---------|
| id | Unique number | 1 |
| addendum_number | Sequence number (#1, #2...) | 1 |
| description | What changed | "Quantity increased from 500 to 700" |
| new_deadline | Extended deadline (optional) | 2026-07-01 17:00 (or empty) |
| issued_date | When this update was posted | 2026-06-03 14:00 |
| tender_id | Which tender this belongs to | 5 → links to tenders table |
| issued_by | Which officer issued it | 3 → links to users table |

---

### Table 3: `clarifications` — The Q&A Board

**Analogy:** Each row is one question + answer pair, like a FAQ.

| Column Name | What It Stores | Example |
|-------------|---------------|---------|
| id | Unique number | 12 |
| question | The bidder's question | "Must furniture be locally made?" |
| answer | The officer's reply | "Yes, all furniture must be local." (empty until answered) |
| asked_date | When question was asked | 2026-06-02 11:30 |
| answered_date | When it was answered | 2026-06-03 09:15 (empty until answered) |
| tender_id | Which tender | 5 → links to tenders table |
| asked_by | Who asked (hidden from other bidders) | 7 → links to users table |
| answered_by | Who answered | 3 → links to users table (or empty) |

---

### Table 4: `bids` — The Applications

**Analogy:** Each row is one sealed envelope from a company containing their offer.

| Column Name | What It Stores | Example |
|-------------|---------------|---------|
| id | Unique number | 42 |
| technical_proposal | Written proposal summary | "Our company has 15 years..." |
| bid_amount | Price offered (in ETB) | 1250000.00 |
| bid_security_info | Bank guarantee details | '{"reference":"BG-001","bank":"CBE",...}' (or empty) |
| submission_date | When the bid was submitted | 2026-06-10 16:45 |
| status | Current status | SUBMITTED |
| created_at | Same as submission_date | 2026-06-10 16:45 |
| tender_id | Which tender this bid is for | 5 → links to tenders table |
| bidder_id | Who submitted it | 7 → links to users table |

**Special constraint:** `@@unique([tenderId, bidderId])` — one bidder can only submit ONE bid per tender. This is enforced at the database level, not just in the code.

---

### Table 5: `bid_documents` — The Attached Files

**Analogy:** Each row is one file attached to a bid application — like a photocopy of a certificate.

| Column Name | What It Stores | Example |
|-------------|---------------|---------|
| id | Unique number | 101 |
| file_name | Original name of file | "company_registration.pdf" |
| file_type | File format | "application/pdf" |
| file_path | Where the file is stored on server | "uploads/bids/42/171612-company_reg.pdf" |
| file_size | Size in bytes | 2150400 (about 2.1 MB) |
| document_category | Type of document | TECHNICAL or OTHER |
| upload_date | When it was uploaded | 2026-06-10 16:45 |
| bid_id | Which bid this file belongs to | 42 → links to bids table |

---

### How Tables Relate to Each Other

```
  ┌──────────┐         ┌──────────────────┐
  │  users   │─────────│    tenders       │  A user CREATES tenders
  │ (Student │    1:N  │                  │  (one user → many tenders)
  │    1)    │         └────────┬─────────┘
  └──────────┘                 │
       │                       │ 1:N (one tender → many addenda)
       │                       ├──── tender_addenda
       │                       │
       │                       │ 1:N (one tender → many clarifications)
       │                       ├──── clarifications
       │                       │
       │                       │ 1:N (one tender → many bids)
       │      ┌────────────────┴──── bids
       │      │                         │
       │      │                         │ 1:N (one bid → many documents)
       │      │                         └──── bid_documents
       │      │
       └──────┘  A user SUBMITS bids
          1:N
```

**What 1:N means:** "One-to-Many". One tender can have MANY bids, but each bid belongs to only ONE tender.

---

## 16. How the Files Connect to Each Other

### The Three-Layer Architecture

Think of the system like a restaurant with three layers:

```
 ┌────────────────────────────────────────────────────────────────┐
 │  LAYER 1: FRONTEND (The Dining Room)                           │
 │  What users SEE and INTERACT with                              │
 │                                                                │
 │  📁 frontend/src/app/(dashboard)/officer/tenders/page.tsx      │
 │  📁 frontend/src/app/(dashboard)/officer/tenders/new/page.tsx  │
 │  📁 frontend/src/app/(dashboard)/officer/tenders/[id]/page.tsx │
 │  📁 frontend/src/app/(dashboard)/officer/tenders/[id]/edit/... │
 │  📁 frontend/src/app/(dashboard)/officer/dashboard/page.tsx    │
 │  📁 frontend/src/app/(dashboard)/bidder/tenders/page.tsx       │
 │  📁 frontend/src/app/(dashboard)/bidder/tenders/[id]/page.tsx  │
 │  📁 frontend/src/app/(dashboard)/bidder/tenders/[id]/bid/...   │
 │  📁 frontend/src/app/(dashboard)/bidder/my-bids/page.tsx       │
 │  📁 frontend/src/app/(dashboard)/bidder/dashboard/page.tsx     │
 │  📁 frontend/src/components/shared/TenderForm.tsx              │
 │                                                                │
 │  What these files do: Show the screens, forms, tables,         │
 │  buttons. Send requests when buttons are clicked.              │
 └─────────────────────────────┬──────────────────────────────────┘
                               │  HTTP Requests
                               │  (like sending letters)
                               ▼
 ┌────────────────────────────────────────────────────────────────┐
 │  LAYER 2: BACKEND (The Kitchen)                                │
 │  Where data is processed                                       │
 │                                                                │
 │  📁 backend/src/routes/tender.routes.ts     ← The MENU        │
 │  📁 backend/src/routes/bid.routes.ts           (what you       │
 │  📁 backend/src/routes/clarification.routes.ts  can order)     │
 │                        │                                       │
 │                        ▼                                       │
 │  📁 backend/src/controllers/tender.controller.ts ← The WAITER │
 │  📁 backend/src/controllers/bid.controller.ts      (takes      │
 │                        │                            orders,    │
 │                        │                            checks     │
 │                        │                            them)      │
 │                        ▼                                       │
 │  📁 backend/src/services/tender.service.ts   ← The CHEF       │
 │  📁 backend/src/services/bid.service.ts        (does the      │
 │                        │                        actual work)   │
 │                        │                                       │
 │  📁 backend/src/middleware/upload.ts   ← The FILE HANDLER     │
 │  📁 backend/src/middleware/auth.ts     ← The SECURITY GUARD   │
 └─────────────────────────────┬──────────────────────────────────┘
                               │  Prisma ORM
                               │  (like a translator)
                               ▼
 ┌────────────────────────────────────────────────────────────────┐
 │  LAYER 3: DATABASE (The Storage Room)                          │
 │  Where everything is permanently saved                         │
 │                                                                │
 │  📁 backend/prisma/schema.prisma   ← The BLUEPRINT            │
 │                                      (defines all tables)     │
 │                                                                │
 │  Tables: tenders, tender_addenda, clarifications, bids,        │
 │          bid_documents                                         │
 └────────────────────────────────────────────────────────────────┘
```

---

### Flow 1: Creating a Tender (End-to-End File Path)

```
 Officer clicks "Save as Draft"
     │
     ▼
 📁 TenderForm.tsx
     │ handleSave("draft")
     │ → runs validation checks
     │ → calls api.post("/tenders", payload)
     │
     ▼
 📁 tender.routes.ts
     │ router.post("/", authorize("PROCUREMENT_OFFICER"), tc.create)
     │ → checks: is user logged in? (authenticate)
     │ → checks: is user an officer? (authorize)
     │
     ▼
 📁 tender.controller.ts → create()
     │ → validates data with Zod schema
     │ → calls tenderService.createTender()
     │ → creates audit log
     │
     ▼
 📁 tender.service.ts → createTender()
     │ → prisma.tender.create({data: {..., status: "DRAFT"}})
     │
     ▼
 📁 schema.prisma (model Tender)
     │ → INSERT into "tenders" table
     │
     ▼
 Response flows back up the chain → toast "Tender created as draft"
```

### Flow 2: Submitting a Bid (End-to-End File Path)

```
 Bidder clicks "Submit Bid"
     │
     ▼
 📁 bid/page.tsx (SubmitBidPage)
     │ submitMut.mutate()
     │ → builds FormData with text + files
     │ → calls api.post(`/tenders/${id}/bids`, formData)
     │
     ▼
 📁 bid.routes.ts
     │ router.post("/tenders/:tenderId/bids", 
     │             authorize("BIDDER"), 
     │             upload.fields([...]),    ← processes files
     │             bc.submitBid)
     │
     ▼
 📁 upload.ts (middleware)
     │ → saves files to temp folder
     │ → checks type and size
     │
     ▼
 📁 bid.controller.ts → submitBid()
     │ → validates text with Zod
     │ → passes files + data to service
     │
     ▼
 📁 bid.service.ts → submitBid()
     │ → 8 validation checks (see Section 14)
     │ → prisma.bid.create({...})           → INSERT into "bids"
     │ → moveBidFiles(bidId, files)          → moves files to permanent folder
     │ → prisma.bidDocument.createMany({..}) → INSERT into "bid_documents"
     │ → prisma.notification.createMany({..})→ INSERT into "notifications"
     │
     ▼
 🗄️ schema.prisma
     │ → bids table + bid_documents table + notifications table
     │
     ▼
 Response flows back → toast "Bid submitted successfully!" → redirect to My Bids
```

### Flow 3: Answering a Clarification

```
 Officer clicks "Submit Answer"
     │
     ▼
 📁 officer/tenders/[id]/page.tsx (TenderDetailPage)
     │ answerMut.mutate({clId: 12, answer: "Yes, local only"})
     │ → calls api.patch(`/clarifications/12/answer`, {answer})
     │
     ▼
 📁 clarification.routes.ts
     │ router.patch("/:id/answer", authorize("PROCUREMENT_OFFICER"), tc.answerClarification)
     │
     ▼
 📁 tender.controller.ts → answerClarification()
     │ → validates: answer not empty
     │
     ▼
 📁 tender.service.ts → answerClarification()
     │ → checks: is this the tender's officer?
     │ → prisma.clarification.update({answer, answeredBy, answeredDate})
     │ → notifies ALL active bidders (anonymized)
     │
     ▼
 🗄️ clarifications table updated, notifications created
```

---

## 17. Common Defense Questions and Answers

### Q1: "What is a Tender?"
**A:** A tender is a formal invitation from a government or organization to companies to submit offers for providing goods, services, or works. Instead of just buying from one company, they invite multiple companies to compete — the best offer wins. Our system digitizes this process which was traditionally done with paper forms.

### Q2: "Why does a tender go through DRAFT before PUBLISHED?"
**A:** Having a DRAFT stage allows the officer to save their work and come back later. Writing a tender with all its criteria, documents, and deadlines takes time. They might need to check information or get approval before publishing. It's like writing an email — you save a draft before sending it. Once published, it becomes visible to ALL bidders and notifications are sent, so it needs to be correct first.

### Q3: "Why do you validate on BOTH the frontend AND the backend?"
**A:** The frontend validation gives **instant feedback** to the user — they don't have to wait for the server. But it can be bypassed by a tech-savvy person. The backend validation is the **real security gate** — it cannot be bypassed. This is called "defense in depth" — having multiple layers of protection. For example, if someone uses a tool to directly send data to the server, skipping the browser, the backend still catches invalid data.

### Q4: "What happens if two bidders try to submit at exactly the same time?"
**A:** The database has a **unique constraint** on the combination of `tender_id` and `bidder_id` — written as `@@unique([tenderId, bidderId])` in the schema. This means the database itself will reject a second bid from the same bidder for the same tender, even if two requests arrive at the exact same millisecond. The second one gets an error: "You have already submitted a bid for this tender."

### Q5: "Why are clarification questions anonymous for bidders?"
**A:** In public procurement, it's important that competitors don't know who else is interested. If Company A sees that Company B (a very strong competitor) asked a question, they might change their strategy or pricing unfairly. By making questions anonymous, we ensure a level playing field. The officer still sees who asked (for record-keeping), but all bidders see "Anonymous Bidder."

### Q6: "How does the system handle file uploads?"
**A:** The upload process has multiple safety layers:
1. **Frontend check:** Only allows specific file types (PDF, DOCX, etc.) and shows an error if the file is over 10MB
2. **Backend middleware** (`upload.ts`): Uses a library called **Multer** which checks both the file extension and the MIME type (the file's true type). Files are first saved to a temporary folder.
3. **After bid is saved:** Files are moved from the temp folder to a permanent folder named after the bid ID (`uploads/bids/42/`)
4. **Database record:** Each file's name, path, size, and type are saved in the `bid_documents` table
5. **Access control:** Only the bid owner, the tender's officer, assigned evaluators, and admins can download files

### Q7: "What is an addendum and when would you use one?"
**A:** An addendum is an official modification to a published tender. It's used when the officer needs to correct a mistake, add information, or extend the deadline after the tender is already published. For example: "We originally asked for 500 chairs, we now need 700." Each addendum gets a sequential number (#1, #2, #3) and all bidders are automatically notified. If an addendum includes a new deadline that is later than the current one, the system automatically extends the tender's deadline.

### Q8: "What technologies does the frontend use?"
**A:** The frontend uses **Next.js**, which is a framework (a pre-built toolkit) built on top of **React** (a library for building user interfaces). It uses **TypeScript** (a version of JavaScript that catches errors early), **TanStack React Query** (which handles data fetching, caching, and automatic refetching), and **Tailwind CSS** (for styling). Icons are from the `lucide-react` library.

### Q9: "What technologies does the backend use?"
**A:** The backend uses **Node.js** (runs JavaScript/TypeScript on the server), **Express** (a framework for handling HTTP requests), **Prisma** (an ORM — Object Relational Mapper — which translates between TypeScript code and database queries), **Zod** (for data validation), **Multer** (for file uploads), and **PostgreSQL** (the database). The backend also creates **audit logs** to track every important action.

### Q10: "What is the difference between a Route, a Controller, and a Service?"
**A:** Think of a restaurant:
- **Route** (`tender.routes.ts`) = the **menu board** — it lists what URLs/endpoints are available and who is allowed to use them. It maps URLs to functions.
- **Controller** (`tender.controller.ts`) = the **waiter** — it takes the order (request), checks it's properly formatted, passes it to the kitchen, and delivers the result back. It doesn't cook.
- **Service** (`tender.service.ts`) = the **chef** — it does the actual work: talks to the database, checks business rules, creates records. All the real logic is here.

### Q11: "What is Prisma and why do you use it?"
**A:** Prisma is an **ORM (Object-Relational Mapper)** — think of it as a translator between our TypeScript code and the PostgreSQL database. Instead of writing raw SQL queries (the database language), we write TypeScript like `prisma.tender.create({...})` and Prisma translates it to the right SQL query. Benefits: (1) Type safety — catches errors before running, (2) Auto-generated types, (3) Easy migrations to change the database structure, (4) Readable code.

### Q12: "How does the system prevent bids after the deadline?"
**A:** Three layers of protection:
1. **Frontend UI:** The "Submit Bid" button is replaced with "The submission deadline has passed" message when the deadline is past
2. **Frontend redirect:** If a bidder navigates directly to the bid submission URL after the deadline, the page checks `isPast(deadline)` and redirects them away
3. **Backend check:** Even if someone bypasses both frontend checks, the service checks `new Date() > tender.submissionDeadline` and throws an error

### Q13: "What happens when a tender is cancelled?"
**A:** When an officer cancels a tender: (1) The status changes to `CANCELLED`, (2) If the tender was PUBLISHED and had bids, ALL bidders who submitted bids receive a notification saying "Tender cancelled: [title]", (3) The tender remains visible but is marked with a red "CANCELLED" badge, (4) No new bids can be submitted. Only DRAFT and PUBLISHED tenders can be cancelled — you can't cancel a tender that's already under evaluation or awarded.

### Q14: "How do the 'evaluation criteria weights' work?"
**A:** The officer defines HOW bids will be scored. For example: "Experience: 40%, Technical Capability: 30%, Delivery Timeline: 30%." These weights MUST add up to exactly 100%. Then, there are TWO major weights: "Technical Weight" (e.g., 80%) and "Financial Weight" (e.g., 20%), which also must add up to 100%. This means 80% of the final score comes from how good the technical proposal is, and 20% comes from the price. The system enforces both rules and won't let you save if the math doesn't work.

### Q15: "What is bid security and why is it needed?"
**A:** Bid security is like a **deposit** — a bank guarantee that the bidder must provide to prove they're serious. It protects the government in case the winner backs out after being selected. The officer decides whether to require it and sets the amount (e.g., ETB 50,000). If required, the bidder must fill in their bank guarantee reference number, issuing bank, guarantee amount, and validity date.

### Q16: "How does the notification system work in your feature?"
**A:** My feature creates notifications at several key points:
- **Tender published** → ALL active bidders get notified
- **Addendum issued** → ALL active bidders get notified
- **Clarification asked** → The tender's officer gets notified
- **Clarification answered** → ALL active bidders get notified
- **Bid submitted** → The officer gets notified AND the bidder gets a confirmation
- **Tender cancelled** → Bidders who submitted bids get notified

These notifications appear on the 🔔 bell icon in the header (which is Student 1's feature area).

### Q17: "What is the `[id]` in the file paths like `tenders/[id]/page.tsx`?"
**A:** The `[id]` is a **dynamic route parameter**. It means this ONE page template can show different tenders depending on which tender ID is in the URL. For example, `/officer/tenders/5` shows tender #5, and `/officer/tenders/12` shows tender #12, but both use the same `[id]/page.tsx` file. The page extracts the ID from the URL and uses it to fetch the right data from the database.

### Q18: "How does your system ensure data integrity?"
**A:** Several mechanisms:
1. **Database constraints**: `@@unique([tenderId, bidderId])` prevents duplicate bids
2. **Foreign keys**: Every bid links to a real tender, every document links to a real bid
3. **Status checks**: You can't publish a non-draft, can't bid on a non-published tender
4. **Access control**: Officers can only manage their own tenders
5. **Audit logging**: Every action is recorded (who did what, when, from which IP)
6. **Transaction-like operations**: Multi-step processes (create bid + save documents + send notifications) happen together

### Q19: "What is the role of `TenderForm.tsx` and why is it shared?"
**A:** `TenderForm.tsx` is a **reusable component** that contains all the form fields for creating or editing a tender. It accepts a `mode` parameter — either `"create"` or `"edit"`. In create mode, all fields start empty. In edit mode, fields are pre-filled with the existing tender's data. This avoids duplicating the same form code in two different files. The `new/page.tsx` uses it with `mode="create"`, and `edit/page.tsx` uses it with `mode="edit"` and passes the existing tender data.

### Q20: "Walk me through what happens when a bidder opens the Browse Tenders page."
**A:** 
1. The bidder clicks "Browse Tenders" in the sidebar
2. The browser navigates to `/bidder/tenders`
3. The `page.tsx` file loads and immediately sends a request: `GET /api/tenders?status=PUBLISHED&page=1&limit=12`
4. The request goes through `authenticate` middleware (check login)
5. `tender.controller.ts → list()` receives it
6. `tender.service.ts → listTenders()` knows the user is a BIDDER, so filters to only show PUBLISHED/UNDER_EVALUATION/AWARDED tenders
7. It runs TWO database queries in parallel: one to get the tenders (with counts of bids, addenda, clarifications), and one to count the total (for pagination)
8. Results come back to the frontend
9. The frontend sorts them (by deadline or newest) and renders them as cards
10. Each card shows: title, category badge, description preview, deadline countdown (with color coding), bid security info, and addenda count
11. The bidder can search, filter by category, change sort order, or click "View Details" to see a specific tender

---

> **Final Tip for Your Defense:** When they ask "How does X work?", always describe the flow in this order:
> 1. What the **user sees** and clicks (frontend)
> 2. Where the request **goes** on the server (route → controller → service)
> 3. What **checks** the system makes (validation)
> 4. What gets **saved** in the database (which table, which columns)
> 5. What **response** the user gets (success message, redirect, error)
>
> This shows you understand the complete picture, not just one layer.
