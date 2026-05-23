# Student 1 — User Management, Authentication & System Administration

## Complete Defense Guide (Zero Technical Knowledge Required)

---

## Table of Contents

1. [What is My Feature in Simple Words](#1-what-is-my-feature-in-simple-words)
2. [The Big Picture — How My Part Fits into the System](#2-the-big-picture)
3. [Every Screen the User Sees](#3-every-screen-the-user-sees)
4. [How Registration Works — Step by Step](#4-how-registration-works)
5. [How Login Works — Step by Step](#5-how-login-works)
6. [How the "Security Guard" Works — JWT Tokens](#6-how-the-security-guard-works)
7. [How the Admin Manages Users](#7-how-the-admin-manages-users)
8. [How Audit Logging Works](#8-how-audit-logging-works)
9. [How Monitoring Works](#9-how-monitoring-works)
10. [How Notifications Work](#10-how-notifications-work)
11. [How the Sidebar and Navigation Work](#11-how-the-sidebar-and-navigation-work)
12. [The Database Tables — Like Spreadsheets](#12-the-database-tables)
13. [How the Files Connect to Each Other](#13-how-the-files-connect)
14. [Common Defense Questions and Answers](#14-defense-questions-and-answers)

---

## 1. What is My Feature in Simple Words

Imagine a big government office building. Before anyone can walk in and start doing work, a few things need to happen:

- **Someone needs to check who you are** at the front door (that's **Authentication** — login/logout)
- **New visitors need to register** and get an ID badge before they can enter (that's **Registration**)
- **A building manager** needs to decide who's allowed in, who gets fired, and who gets promoted (that's the **System Administrator**)
- **A security camera** records who went where and what they did (that's **Audit Logging**)
- **A dashboard of monitors** shows how many people are in the building, how busy things are (that's **Monitoring**)
- **An intercom system** sends announcements to people — "Your account is activated!", "New tender published!" (that's **Notifications**)

**My feature is the FRONT DOOR, the ID BADGE SYSTEM, the BUILDING MANAGER, the SECURITY CAMERAS, and the ANNOUNCEMENT SYSTEM — all rolled into one.**

Without my part, nobody can even get into the system. The other features (creating tenders, submitting bids, evaluating bids) all depend on users existing and being logged in first.

---

## 2. The Big Picture

Think of the whole Online Tender Management System like an **online shopping mall for government contracts**:

```
┌─────────────────────────────────────────────────────────────────┐
│                    THE TENDER MANAGEMENT SYSTEM                  │
│                                                                  │
│  ┌────────────────────┐                                         │
│  │  ★ MY PART ★       │                                         │
│  │  (The Front Door)  │────── People must pass through here     │
│  │  Registration      │       BEFORE they can do anything else  │
│  │  Login/Logout      │                                         │
│  │  Admin Controls    │                                         │
│  │  Security Cameras  │                                         │
│  │  Announcements     │                                         │
│  └────────┬───────────┘                                         │
│           │                                                      │
│           ▼                                                      │
│  ┌────────────────────┐  ┌────────────────────┐                  │
│  │  Student 2's Part  │  │  Student 3's Part  │                  │
│  │  (The Stores)      │  │  (The Judges)      │                  │
│  │  Creating Tenders  │  │  Evaluating Bids   │                  │
│  │  Submitting Bids   │  │  Picking Winners   │                  │
│  │  Q&A               │  │  Reports           │                  │
│  └────────────────────┘  └────────────────────┘                  │
└─────────────────────────────────────────────────────────────────┘
```

**Without my part, the whole system is just locked doors. Nobody can get in.**

### The Four Types of People in the System

| Role | Who They Are | Real-World Analogy |
|------|-------------|-------------------|
| **BIDDER** | Companies/individuals who want to win contracts | Job applicants who apply for positions |
| **PROCUREMENT_OFFICER** | Staff who create and manage tenders | The HR department posting job listings |
| **EVALUATOR** | Experts who score and judge bids | The interview panel who scores candidates |
| **ADMIN** | The system boss who controls everything | The CEO/IT manager who controls who has access |

---

## 3. Every Screen the User Sees

### 3.1 The Landing Page (Homepage)

**File:** `frontend/src/app/page.tsx`

This is the very first thing anyone sees when they visit the website. Think of it like the **front page of a newspaper** — it explains what the system is, why it exists, and has buttons to either "Sign In" or "Register."

**What's on it:**
- The name of the system: **TenderETH**
- A description of what the system does
- A "Sign In" button (takes you to the login page)
- A "Register" button (takes you to the registration page)

---

### 3.2 The Login Page

**File:** `frontend/src/app/(auth)/login/page.tsx`

This is like the **sign-in desk** at a hotel. You show your ID (email) and say your secret word (password).

**What's on the screen:**
- The TenderETH logo (a small building icon)
- A title: "TenderETH"
- A subtitle: "Sign in to your account to continue"
- An **Email field** — where you type your email address (e.g., "ahmed@example.com")
- A **Password field** — where you type your secret password (shown as dots ●●●●● so nobody can peek)
- A **"Sign In" button** — click this to try to log in
- A message: "Don't have an account? Register as a bidder" — links to the registration page
- A "← Back to home" link — goes back to the homepage

**What happens when you click "Sign In":**
1. The system first checks: did you type a valid email? Is the password not empty? (This checking is called **validation** — like a bouncer checking your ID format)
2. If something looks wrong (like you typed "not-an-email"), a **red error message** appears under the field
3. While signing in, the button shows a **spinning circle** (loading animation) so you know it's working
4. If login succeeds → you go to your dashboard (the right dashboard for your role)
5. If login fails → a **red error popup** appears saying "Login failed" or "Invalid email or password"

**Important security detail:** If you ARE already logged in and somehow end up on this page, the system automatically redirects (sends) you to your dashboard. You don't see the login page at all.

---

### 3.3 The Registration Page

**File:** `frontend/src/app/(auth)/register/page.tsx`

This is like **filling out a job application form**. Only BIDDERS can self-register. Officers, Evaluators, and Admins are created by the Administrator.

**Registration has 3 steps (3 screens):**

#### Step 1: Choose Your Type

You see two big clickable boxes:

```
┌─────────────────────┐    ┌─────────────────────┐
│    🏢 Organization   │    │    👤 Individual      │
│                      │    │                      │
│  Company, PLC,       │    │  Independent         │
│  Partnership,        │    │  Consultant or       │
│  Sole Proprietorship │    │  Professional        │
└─────────────────────┘    └─────────────────────┘
```

- Click "Organization" if you're registering as a company
- Click "Individual" if you're a solo consultant

Below that: "Already have an account? Sign in"

#### Step 2: Fill Out the Form

After choosing your type, you see a detailed form. The form is **different** depending on what you chose:

**If you chose "Organization":**

| Section | Fields | Required? |
|---------|--------|-----------|
| **Organization Information** | Organization Name | ✅ Yes |
| | Organization Name (for account) | ✅ Yes |
| | TIN Number (Tax Identification Number) | ✅ Yes |
| | Trade License Number | ❌ No |
| **Contact Information** | Contact Person (name of your rep) | ✅ Yes |
| | Phone Number | ✅ Yes |
| | Address | ✅ Yes |
| **Account Credentials** | Email | ✅ Yes |
| | Password | ✅ Yes |
| | Confirm Password | ✅ Yes |

**If you chose "Individual":**

| Section | Fields | Required? |
|---------|--------|-----------|
| **Personal Information** | Full Name | ✅ Yes |
| | National ID / TIN | ✅ Yes |
| **Contact Information** | Profession / Expertise | ✅ Yes |
| | Phone Number | ✅ Yes |
| | Address | ✅ Yes |
| **Account Credentials** | Email | ✅ Yes |
| | Password | ✅ Yes |
| | Confirm Password | ✅ Yes |

**Password Rules (enforced by the system):**
- Must be at least 8 characters long
- Must contain at least one UPPERCASE letter (like "A", "B", etc.)
- Must contain at least one NUMBER (like "1", "2", etc.)
- The "Confirm Password" must MATCH the Password exactly

There's a "← Back" button to go back to step 1, and a "Submit Registration" button.

#### Step 3: Success Screen

After successful registration, you see:

```
        ✅ (big green checkmark)
    
    Registration Submitted!
    
    An administrator will review and activate
    your account. You will be notified once
    your account is approved.
    
    [Back to Login]
```

**Key point:** New bidder accounts are NOT active immediately. They are in "PENDING" status. An Admin must review and activate them first. This is for security — to prevent fake accounts.

---

### 3.4 The Dashboard Layout (The Frame Around Everything)

**Files:**
- `frontend/src/app/(dashboard)/layout.tsx` — The overall frame
- `frontend/src/components/layout/Sidebar.tsx` — The left menu
- `frontend/src/components/layout/Header.tsx` — The top bar

After logging in, every user sees the same **frame** but with **different content** based on their role:

```
┌─────────────────────────────────────────────────────────┐
│ SIDEBAR              │  HEADER BAR                      │
│ (Left Menu)          │  [🔔 Notification Bell] [👤 Name]│
│                      ├──────────────────────────────────│
│ ◻ Menu Item 1        │                                  │
│ ◻ Menu Item 2        │        PAGE CONTENT              │
│ ◻ Menu Item 3        │        (Changes based on         │
│ ◻ Notifications      │         which menu you click)    │
│                      │                                  │
└──────────────────────┴──────────────────────────────────┘
```

**The Header Bar shows:**
- A **notification bell** 🔔 (with a red number if you have unread notifications)
- Your **avatar** (a circle with your initials, like "AH" for Ahmed Hassan)
- Your **name** and **role badge**
- When you click your name, a **dropdown menu** appears with: your name, your email, "Profile" option, and a red "Logout" button

**Security checks in this layout:**
1. If you're NOT logged in → redirected to the login page
2. If your account is PENDING → you see a "Pending Verification" page (not the dashboard)
3. If your account is INACTIVE → you can't log in at all
4. If you try to access a URL you're not allowed to (like a bidder trying to visit `/admin/users`) → redirected to your own dashboard

---

### 3.5 Admin Dashboard Pages

Only the ADMIN role sees these pages.

#### 3.5.1 User Management Page

**File:** `frontend/src/app/(dashboard)/admin/users/page.tsx`

This is the **command center** for managing all users. Think of it like the HR department's employee database.

**What's on the screen:**

**Top area:**
- Title: "User Management"
- A "＋ Create User" button (to create new internal staff accounts)

**Filter area:**
- A **search box** — type a name or email to find specific users
- A **Role filter dropdown** — filter by: All Roles, Admin, Procurement Officer, Evaluator, Bidder
- A **Status filter dropdown** — filter by: All Status, Active, Inactive, Pending

**The User Table:**

| Name | Email | Role | Status | Registered | Actions |
|------|-------|------|--------|------------|---------|
| Ahmed Hassan | ahmed@gov.et | 🟣 Admin | 🟢 ACTIVE | Jan 15, 2026 | ⋯ |
| Sara Tewodros | sara@bid.com | ⬜ Bidder | 🟡 PENDING | Mar 2, 2026 | ⋯ |
| Kebede Alemu | keb@gov.et | 🔵 Procurement Officer | 🟢 ACTIVE | Feb 10, 2026 | ⋯ |

**The ⋯ (three dots) Actions Menu gives you:**
- 👁 **View Details** — opens a popup showing full user information (bidder profile: TIN, trade license, etc. or officer profile: department, position)
- ✅ **Activate** — (only shown if user is NOT active) switches their status to ACTIVE
- ❌ **Deactivate** — (only shown if user IS active) switches their status to INACTIVE
- 🛡 **Change Role** — change a user from one role to another

**The "Create User" popup (dialog):**
When you click "＋ Create User", a popup appears where the Admin can create new accounts for internal staff:
- Full Name
- Email
- Password
- Role dropdown: Admin, Procurement Officer, or Evaluator (NOT Bidder — bidders register themselves)
- If you choose "Procurement Officer", extra fields appear: Department, Position, Organization

**Pagination:**
If there are many users, they are shown 20 per page. At the bottom: "Previous" and "Next" buttons with "Page 1 of 5" text.

#### 3.5.2 Audit Logs Page

**File:** `frontend/src/app/(dashboard)/admin/audit-logs/page.tsx`

This is like the **security camera footage log**. Every important action anyone takes in the system is recorded here.

**What's on the screen:**

**Top area:**
- Title: "Audit Logs"
- An "Export PDF" button — download the logs as a PDF document

**Filter area:**
- **Action filter dropdown**: All Actions, Login, Logout, Account Created, Activated, Deactivated, Role Changed
- **Entity Type filter**: All Entities, User, Tender, Bid
- **Start Date** picker — from when?
- **End Date** picker — until when?

**The Audit Log Table:**

| Timestamp | User | Action | Entity Type | Entity ID | IP Address |
|-----------|------|--------|-------------|-----------|------------|
| Mar 5, 2026 14:30:22 | Ahmed Hassan | User logged in | User | 1 | 192.168.1.5 |
| Mar 5, 2026 14:32:05 | Ahmed Hassan | Activated user account | User | 7 | 192.168.1.5 |
| Mar 5, 2026 15:01:33 | Sara Tewodros | User registered | User | 8 | 10.0.0.12 |

**What each column means in plain English:**
- **Timestamp** = The exact date and time down to the second
- **User** = Who performed the action
- **Action** = What they did (e.g., "logged in", "activated user account")
- **Entity Type** = What kind of thing was affected (User, Tender, Bid)
- **Entity ID** = The unique number of the thing affected (e.g., User #7)
- **IP Address** = The internet address of the computer they used (like a phone number for computers)

#### 3.5.3 System Monitoring Page

**File:** `frontend/src/app/(dashboard)/admin/monitoring/page.tsx`

This is the **control room dashboard** — like the screens in an airport showing all flights.

**What's on the screen:**

**Four statistic cards across the top:**

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Total Users  │  │   Pending    │  │   Total      │  │   Total      │
│    42        │  │  Accounts    │  │  Tenders     │  │   Bids       │
│              │  │     5        │  │    23        │  │    87        │
│ 2 admins     │  │              │  │ 3 draft      │  │              │
│ 5 officers   │  │ Review       │  │ 12 published │  │ 31 active    │
│ 8 evaluators │  │ pending →    │  │ 8 awarded    │  │ users        │
│ 27 bidders   │  │ accounts     │  │              │  │              │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

**Below the cards: "Recent Activity" table**
Shows the last 20 actions in the system (same idea as audit logs, but a quick summary):

| Time | User | Action | Entity |
|------|------|--------|--------|
| Mar 5, 14:30 | Ahmed Hassan | User logged in | User #1 |
| Mar 5, 14:32 | Sara Tewodros | Submitted bid | Bid #15 |

**The monitoring data refreshes every 30 seconds automatically** (the page silently asks the server for fresh numbers without you doing anything). This is so the Admin always sees up-to-date information.

---

### 3.6 Notification Bell & Notifications Page

#### The Notification Bell (in the Header)

**File:** `frontend/src/components/layout/NotificationBell.tsx`

This is the **bell icon** 🔔 in the top-right corner of every page. ALL users see this.

- If you have unread notifications, a **red badge** appears on the bell showing the count (e.g., "3" or "99+")
- **Click the bell** → a **dropdown panel** appears showing your 5 most recent notifications
- Each notification shows: an icon (📄 for tenders, 🏆 for awards, 👥 for user-related, 💬 for messages), the message text, and how long ago it was ("5 minutes ago", "2 hours ago")
- Unread notifications have a **blue dot** and a light blue background
- There's a "Mark all read" link at the top
- There's a "View all notifications" link at the bottom (takes you to the full page)
- The bell checks for new notifications **every 30 seconds** automatically

#### The Full Notifications Page

**File:** `frontend/src/app/(dashboard)/notifications/page.tsx`

This is the **full-page** view of all your notifications. Like opening your email inbox.

- Title: "Notifications" with a count of unread (e.g., "3 unread")
- A "Mark all as read" button
- Each notification is a clickable card showing:
  - A blue dot if unread
  - An icon based on the type
  - The message text
  - The time
  - A **trash icon** (appears when you hover over it) to delete the notification
- **Clicking a notification** does two things:
  1. Marks it as read
  2. Takes you to the relevant page (e.g., a tender notification takes you to that tender page)
- Pagination at the bottom (20 per page)

---

## 4. How Registration Works

Here is EXACTLY what happens, step by step, when someone registers as a new bidder. Think of it like a chain of workers passing a form from person to person:

### The Journey of a Registration (Step by Step)

```
 BIDDER (user)                    FRONTEND                           BACKEND                        DATABASE
     │                               │                                  │                               │
     │  1. Types info, clicks        │                                  │                               │
     │     "Submit Registration"     │                                  │                               │
     │──────────────────────────────►│                                  │                               │
     │                               │  2. Checks: Is email valid?      │                               │
     │                               │     Password 8+ chars?          │                               │
     │                               │     Passwords match?            │                               │
     │                               │     All required fields filled? │                               │
     │                               │                                  │                               │
     │                               │  3. Sends data to backend       │                               │
     │                               │     POST /api/auth/register     │                               │
     │                               │─────────────────────────────────►│                               │
     │                               │                                  │  4. Checks again (double      │
     │                               │                                  │     security):                │
     │                               │                                  │     - Valid email?            │
     │                               │                                  │     - Password rules?         │
     │                               │                                  │     - All fields present?     │
     │                               │                                  │                               │
     │                               │                                  │  5. Checks: Does this email   │
     │                               │                                  │     already exist?            │
     │                               │                                  │─────────────────────────────►│
     │                               │                                  │  6. Database says: "No,       │
     │                               │                                  │◄─────────────────────────────│
     │                               │                                  │     this email is new"        │
     │                               │                                  │                               │
     │                               │                                  │  7. Encrypts the password    │
     │                               │                                  │     (scrambles it so nobody   │
     │                               │                                  │     can read it, even hackers)│
     │                               │                                  │                               │
     │                               │                                  │  8. Saves user data with      │
     │                               │                                  │     status = "PENDING"        │
     │                               │                                  │─────────────────────────────►│
     │                               │                                  │  9. Database saves it         │
     │                               │                                  │◄─────────────────────────────│
     │                               │                                  │                               │
     │                               │                                  │  10. Records in audit log:    │
     │                               │                                  │      "User registered"        │
     │                               │                                  │─────────────────────────────►│
     │                               │                                  │                               │
     │                               │  11. Sends success message back │                               │
     │                               │◄─────────────────────────────────│                               │
     │  12. Shows success screen     │                                  │                               │
     │◄──────────────────────────────│                                  │                               │
     │                               │                                  │                               │
```

### Which Files Are Involved (in order):

| Step | File | What It Does |
|------|------|-------------|
| 1-2 | `frontend/src/app/(auth)/register/page.tsx` | Shows the form, checks inputs on screen |
| 3 | `frontend/src/lib/auth.tsx` → `frontend/src/lib/api.ts` | Sends the data to the server |
| 4 | `backend/src/routes/auth.routes.ts` | Receives the request at URL `/api/auth/register` |
| 4 | `backend/src/controllers/auth.controller.ts` | Validates the data again (double-checks) |
| 5-9 | `backend/src/services/auth.service.ts` | Does the actual work: checks email, encrypts password, saves to database |
| 10 | `backend/src/controllers/auth.controller.ts` | Records the action in the audit log |
| 11-12 | Response flows back through the chain | Shows success screen |

### Password Encryption (Why It Matters)

When someone types their password (e.g., "MyPassword123"), the system does NOT save "MyPassword123" in the database. Instead, it uses a tool called **bcrypt** to **scramble** the password into something like:

```
Original:   "MyPassword123"
Encrypted:  "$2a$12$LJ3m5R5Kx8erJH3K4v5P9Ou.J7wvQ6mYH8zj2c5K1L3m5R5K"
```

This scrambled version is called a **hash**. It's a one-way conversion — like turning an egg into an omelet, you can't turn it back. So even if a hacker steals the database, they can't figure out people's passwords.

The number `12` in the encryption means it was scrambled 12 times (called **salt rounds**), making it extremely hard to crack.

---

## 5. How Login Works

### The Journey of a Login (Step by Step)

```
 USER                          FRONTEND                         BACKEND                         DATABASE
   │                              │                                │                                │
   │ 1. Types email & password    │                                │                                │
   │    Clicks "Sign In"          │                                │                                │
   │─────────────────────────────►│                                │                                │
   │                              │ 2. Basic check:                │                                │
   │                              │    Valid email format?          │                                │
   │                              │    Password not empty?          │                                │
   │                              │                                │                                │
   │                              │ 3. Sends to backend            │                                │
   │                              │    POST /api/auth/login         │                                │
   │                              │───────────────────────────────►│                                │
   │                              │                                │ 4. Looks up user by email       │
   │                              │                                │───────────────────────────────►│
   │                              │                                │ 5. Database returns user data   │
   │                              │                                │◄───────────────────────────────│
   │                              │                                │                                │
   │                              │                                │ 6. IF user not found:           │
   │                              │                                │    → Error "Invalid email       │
   │                              │                                │       or password"              │
   │                              │                                │                                │
   │                              │                                │ 7. Compares typed password      │
   │                              │                                │    with stored encrypted        │
   │                              │                                │    password using bcrypt         │
   │                              │                                │                                │
   │                              │                                │ 8. IF passwords don't match:    │
   │                              │                                │    → Error "Invalid email       │
   │                              │                                │       or password"              │
   │                              │                                │                                │
   │                              │                                │ 9. IF account is PENDING:       │
   │                              │                                │    → Error "Account pending     │
   │                              │                                │       admin verification"       │
   │                              │                                │                                │
   │                              │                                │ 10. IF account is INACTIVE:     │
   │                              │                                │     → Error "Account has        │
   │                              │                                │        been deactivated"        │
   │                              │                                │                                │
   │                              │                                │ 11. ALL CHECKS PASSED! ✅       │
   │                              │                                │     Creates JWT tokens          │
   │                              │                                │     (2 digital ID badges)       │
   │                              │                                │                                │
   │                              │                                │ 12. Records audit log:          │
   │                              │                                │     "User logged in"            │
   │                              │                                │                                │
   │                              │ 13. Stores tokens in cookies   │                                │
   │                              │     (invisible storage in      │                                │
   │                              │      your browser)             │                                │
   │                              │◄───────────────────────────────│                                │
   │                              │                                │                                │
   │                              │ 14. Redirects to the correct   │                                │
   │                              │     dashboard based on role:   │                                │
   │                              │     ADMIN → /admin/users       │                                │
   │                              │     OFFICER → /officer/dashboard│                               │
   │                              │     EVALUATOR → /evaluator/dash│                                │
   │                              │     BIDDER → /bidder/dashboard │                                │
   │ 15. User sees their dashboard│                                │                                │
   │◄─────────────────────────────│                                │                                │
```

### Important Security Detail: Why "Invalid email or password"?

Notice the error message doesn't say "Email not found" or "Wrong password." It always says **"Invalid email or password"** — a deliberately vague message. This is a security best practice. If we said "Email not found," a hacker could test thousands of emails to find which ones exist in our system. By being vague, we don't give hackers any useful information.

---

## 6. How the "Security Guard" Works

### JWT Tokens Explained Like a Wristband

**File:** `backend/src/middleware/auth.ts`

Imagine you go to a waterpark. At the entrance, after showing your ticket, they give you a **waterproof wristband**. This wristband:

- Proves you paid (you're authenticated — logged in)
- Shows what zone you can access (your role — VIP, Standard, etc.)
- Has an expiry time (you can't use yesterday's wristband)

In our system, JWT tokens (JSON Web Tokens) work exactly like this wristband. When you log in successfully, the system creates **TWO tokens**:

| Token | Purpose | Lifespan | Real-World Analogy |
|-------|---------|----------|-------------------|
| **Access Token** | Your main ID badge — proves who you are on every page you visit | **15 minutes** | A day pass wristband |
| **Refresh Token** | A backup token that can create a new Access Token when it expires | **7 days** | A membership card that can get you a new wristband |

### How Tokens Are Stored: Cookies

These tokens are stored in your browser as **cookies** (small pieces of data your browser holds). These are NOT regular cookies — they're **httpOnly cookies**, which means:

- ✅ The server can read them
- ❌ JavaScript code on the page CANNOT read them
- This prevents hackers from stealing your tokens through malicious scripts

### What Happens on Every Page Visit

Every time you click something in the dashboard, your browser automatically sends the **Access Token cookie** along with the request. The backend's "security guard" (`authenticate` function) checks:

```
Step 1: Is there an Access Token cookie?
   ├── YES → Is it valid and not expired?
   │    ├── YES → ✅ Let the user through! Attach their identity to the request.
   │    └── NO → Go to Step 2
   └── NO → Go to Step 2

Step 2: Is there a Refresh Token cookie?
   ├── YES → Is it valid?
   │    ├── YES → Look up the user in the database
   │    │    ├── User exists and is ACTIVE → 
   │    │    │   ✅ Create a NEW Access Token, let them through!
   │    │    └── User doesn't exist or is deactivated → 
   │    │        ❌ "Authentication required" (send to login)
   │    └── NO → ❌ "Authentication required"
   └── NO → ❌ "Authentication required"
```

### The "Authorize" Function (Role Check)

Besides checking IF you're logged in, the system also checks if you have the RIGHT ROLE. For example:

- The `/api/users` route requires the ADMIN role
- The `/api/audit-logs` route requires the ADMIN role
- The `/api/notifications` route requires ANY logged-in user

This is done by the `authorize` function. Think of it as a second bouncer after the first one:

```
First Bouncer (authenticate):  "Are you a member?" → checks your wristband
Second Bouncer (authorize):     "Are you VIP?"      → checks your wristband zone
```

In the code, this looks like:
```
router.use(authenticate, authorize("ADMIN"));
```
This means: First check if logged in, THEN check if they're an ADMIN.

### How Logout Works

When you click "Logout":

1. The system tells the backend: "I'm logging out"
2. The backend records in the audit log: "User logged out"
3. The backend **deletes** both cookies (clears them)
4. The frontend redirects you to the login page

Without the cookies, your browser can't prove who you are anymore. You're effectively "forgotten" by the system.

---

## 7. How the Admin Manages Users

### 7.1 Creating Internal Users

**Who can do this:** Only the ADMIN

**What internal users are:** Officers, Evaluators, and other Admins. Bidders register themselves through the public registration page.

**Step by step:**
1. Admin clicks "＋ Create User"
2. Fills in: Full Name, Email, Password, Role
3. If Role is "Procurement Officer" → extra fields appear: Department, Position, Organization
4. Clicks "Create User"
5. System validates all fields
6. System checks: does this email already exist? (No duplicate emails allowed)
7. System encrypts the password
8. System saves the user with status = **ACTIVE** (internal users are pre-trusted, no pending state)
9. If role is Procurement Officer, an officer profile is also created
10. An audit log entry is recorded: "Created user account"

### 7.2 Activating a Pending Account

When a bidder registers, their account is PENDING. The admin must activate it.

1. Admin goes to User Management page
2. Filters by Status = "PENDING" (or notices the pending count on the Monitoring page)
3. Clicks ⋯ on a pending user → "Activate"
4. A confirmation popup appears: "Are you sure you want to activate Sara Tewodros?"
5. Admin clicks "Activate"
6. System changes the user's status from PENDING to ACTIVE
7. System creates a NOTIFICATION for that user: "Your account has been activated. You can now log in."
8. An audit log entry is recorded: "Activated user account"

### 7.3 Deactivating an Account

1. Admin clicks ⋯ on an active user → "Deactivate"
2. A confirmation popup appears (red "Deactivate" button for danger)
3. Admin confirms
4. Status changes to INACTIVE
5. A notification is sent to the user: "Your account has been deactivated."
6. That user can no longer log in (the login service rejects inactive accounts)
7. Audit log entry recorded

**Safety rule:** An admin CANNOT deactivate their OWN account. The system blocks this with an error: "You cannot change your own status."

### 7.4 Changing a User's Role

1. Admin clicks ⋯ → "Change Role"
2. A popup shows a dropdown with all roles: Admin, Procurement Officer, Evaluator, Bidder
3. If changing to Procurement Officer and the user doesn't already have an officer profile, extra fields appear (Department, Position)
4. Admin selects the new role and clicks "Update Role"
5. System updates the role in the database
6. If changing to Procurement Officer, creates the officer profile
7. Audit log entry: "Changed user role — Changed to EVALUATOR"

**Safety rule:** An admin CANNOT change their OWN role.

---

## 8. How Audit Logging Works

### What is an Audit Log?

Think of it like a **security camera that writes down what it sees** instead of recording video. Every important action creates a text entry in the log. It's a permanent, unchangeable record of what happened in the system.

### What Gets Logged

| Action | When It's Recorded | Logged By |
|--------|-------------------|-----------|
| User registered | Someone creates a new account | `auth.controller.ts` |
| User logged in | Someone successfully logs in | `auth.controller.ts` |
| User logged out | Someone logs out | `auth.controller.ts` |
| Created user account | Admin creates an internal user | `user.controller.ts` |
| Activated user account | Admin activates a pending user | `user.controller.ts` |
| Deactivated user account | Admin deactivates a user | `user.controller.ts` |
| Changed user role | Admin changes someone's role | `user.controller.ts` |

### How It's Recorded (Two Methods)

**Method 1: Manual logging in controllers** — After an action succeeds, the controller manually writes an entry:

```
This is what happens inside the code (simplified):

1. User clicks "Activate" on the admin page
2. Controller receives the request
3. Controller calls the service to do the work
4. IF the work succeeds:
   5. Controller writes to the audit_logs table:
      - action: "Activated user account"
      - entityType: "User"
      - entityId: 7 (the user being activated)
      - performedBy: 1 (the admin who did it)
      - ipAddress: "192.168.1.5"
```

**Method 2: Automatic middleware logging** (`backend/src/middleware/audit.ts`) — A clever mechanism that automatically logs any successful action. It works by "intercepting" the response before it's sent back, and if the response is successful (status 200-299), it records an audit log. Think of it as a CCTV camera that automatically records — nobody needs to press a button.

### What's Stored in Each Log Entry

| Field | Meaning | Example |
|-------|---------|---------|
| action | What happened | "User logged in" |
| entityType | What kind of thing was involved | "User" |
| entityId | The specific item's ID number | 7 |
| performedBy | Who did it (user ID) | 1 |
| ipAddress | The computer's internet address | "192.168.1.5" |
| timestamp | When it happened (auto-set) | "2026-03-05 14:30:22" |

---

## 9. How Monitoring Works

### What the Monitoring Page Shows

The Monitoring page (`frontend/src/app/(dashboard)/admin/monitoring/page.tsx`) is powered by a single API call to `/api/users/stats`. This calls the `getAdminStats()` function in `user.service.ts`, which gathers all the numbers in ONE request:

**What gets calculated:**

1. **Total Users** — counts all users grouped by role (how many admins, officers, evaluators, bidders)
2. **Pending Accounts** — counts users with PENDING status (needs admin attention)
3. **Total Tenders** — counts all tenders grouped by status (draft, published, awarded)
4. **Total Bids** — counts all bids in the system
5. **Recent Activity** — fetches the 20 most recent audit log entries (who did what and when)

**Auto-refresh:** The monitoring page re-fetches this data every **30 seconds** without the admin doing anything. So the numbers on screen are always close to real-time.

### How the Stats Are Gathered (Behind the Scenes)

The `getAdminStats` function runs **5 database queries at the same time** (in parallel — meaning they don't wait for each other, they all run simultaneously for speed):

1. Count users grouped by role → `{ ADMIN: 2, BIDDER: 27, ... }`
2. Count users grouped by status → `{ ACTIVE: 35, PENDING: 5, INACTIVE: 2 }`
3. Count tenders grouped by status → `{ DRAFT: 3, PUBLISHED: 12, ... }`
4. Count total bids → `87`
5. Fetch 20 most recent audit log entries

---

## 10. How Notifications Work

### How Notifications Are Created

Notifications are NOT typed by hand. They are **automatically created by the system** when certain events happen. Think of notifications like the **"ding" alerts** on your phone.

**Example events that create notifications (related to my feature):**

| Event | Who Gets Notified | Message |
|-------|------------------|---------|
| Admin activates an account | The user whose account was activated | "Your account has been activated. You can now log in." |
| Admin deactivates an account | The user whose account was deactivated | "Your account has been deactivated." |

These are created inside the `user.service.ts` file in the `updateUserStatus` function. After changing the user's status, it creates a notification record in the database.

**Other parts of the system** (Student 2 and 3's features) also create notifications for events like: "New tender published", "Your bid has been selected", etc.

### How Notifications Are Displayed

**The Bell (frontend/src/components/layout/NotificationBell.tsx):**
1. Every 30 seconds, the bell asks the server: "How many unread notifications do I have?"
2. The server responds with a count (e.g., 3)
3. The bell shows this count as a red badge
4. When you click the bell, it fetches the 5 most recent notifications
5. Clicking a notification: marks it as read AND takes you to the relevant page
6. "Mark all read" marks ALL your notifications as read at once

**The Full Page (frontend/src/app/(dashboard)/notifications/page.tsx):**
1. Shows ALL notifications with pagination (20 per page)
2. You can delete individual notifications (trash icon appears on hover)
3. "Mark all as read" button at the top

### The Notification Types (Icons)

Each notification type gets a specific icon so users can quickly see what it's about:

| Type | Icon | When It Appears |
|------|------|----------------|
| TENDER_PUBLISHED | 📄 File | New tender published |
| BID_SUBMITTED | 📄 File | Someone submitted a bid |
| COMMITTEE_ASSIGNED | 👥 People | You're assigned as evaluator |
| BID_SELECTED | 🏆 Award | Your bid won |
| BID_NOT_SELECTED | 🛡 Shield | Your bid didn't win |
| ACCOUNT_STATUS | 👥 People | Your account status changed |
| CLARIFICATION_ANSWERED | 💬 Chat | A question was answered |
| DEBRIEFING_RESPONDED | 💬 Chat | Debriefing response received |

### Smart Navigation

When you click a notification, the system figures out WHERE to take you based on your role and the notification type:

- If the notification is about a **Tender** and you're a **Procurement Officer** → takes you to `/officer/tenders/5`
- If it's about a **Tender** and you're a **Bidder** → takes you to `/bidder/tenders/5`
- If it's about a **Tender** and you're an **Evaluator** → takes you to `/evaluator/tenders/5/evaluate`
- If it's about a **Debriefing Request** and you're an **Officer** → takes you to `/officer/debriefings`

---

## 11. How the Sidebar and Navigation Work

### Role-Based Menu Items

**File:** `frontend/src/components/layout/Sidebar.tsx`

The sidebar shows DIFFERENT menu items based on who is logged in. It's like having different keypads that only show the floors you're allowed to visit in an elevator:

| Role | Menu Items They See |
|------|-------------------|
| **ADMIN** | 👥 Users, 📜 Audit Logs, 📊 Monitoring, 🔔 Notifications |
| **PROCUREMENT_OFFICER** | 📊 Dashboard, 📄 Tenders, 📈 Reports, 💬 Debriefings, 🔔 Notifications |
| **EVALUATOR** | 📊 Dashboard, ✅ My Evaluations, 🔔 Notifications |
| **BIDDER** | 📊 Dashboard, 🔍 Browse Tenders, 📂 My Bids, 🔔 Notifications |

### How It Decides What to Show

1. When you log in, the system knows your role (it's stored in the JWT token)
2. The sidebar component receives your role as a "prop" (input)
3. It looks up the menu items for your role from a predefined list
4. It renders only those items
5. The currently active page is highlighted (lighter color) so you know where you are

### Route Protection (URL-Level Security)

**File:** `frontend/src/app/(dashboard)/layout.tsx`

Even if someone manually types a URL they shouldn't access (like a bidder typing `/admin/users` in the browser address bar), the system protects against this:

```
Allowed routes by role:
  ADMIN:                /admin/*    and  /notifications
  PROCUREMENT_OFFICER:  /officer/*  and  /notifications
  EVALUATOR:            /evaluator/* and  /notifications
  BIDDER:               /bidder/*   and  /notifications
```

If you try to visit a URL outside your allowed list → you're immediately redirected to your own dashboard. No error message, just silently moved to where you belong.

---

## 12. The Database Tables

### What is a Database?

A database is like a **collection of Excel spreadsheets** stored on the server computer. Each "table" is like one spreadsheet with rows and columns. The data is permanent — even if the server restarts, nothing is lost.

Our system uses **PostgreSQL** (a popular, free, secure database) and **Prisma** (a tool that makes it easy to talk to the database from our code).

### My Tables Explained

#### Table 1: `users` (The Master User List)

This is the MOST important table. Every person who uses the system has a row here.

| Column | What It Stores | Example | Analogy |
|--------|---------------|---------|---------|
| `id` | A unique number for each user (auto-assigned, starts at 1) | 1, 2, 3, 4... | Employee badge number |
| `full_name` | The person's full name | "Ahmed Hassan" | Name on your badge |
| `email` | Their email address (must be unique — no duplicates) | "ahmed@gov.et" | Your login username |
| `password` | Their encrypted (scrambled) password | "$2a$12$LJ3m5..." | The secret code |
| `role` | What type of user they are | "ADMIN" or "BIDDER" | Your job title |
| `status` | Whether they can use the system | "ACTIVE", "PENDING", or "INACTIVE" | Active/suspended employee |
| `created_at` | When they joined | "2026-01-15 10:30:00" | Date of hire |
| `updated_at` | When their record was last changed | "2026-03-05 14:32:00" | Last HR update |

**Rules:**
- `email` must be unique — no two users can have the same email
- `password` is NEVER stored in plain text — always encrypted
- `role` can only be one of: ADMIN, PROCUREMENT_OFFICER, EVALUATOR, BIDDER
- `status` can only be: ACTIVE, INACTIVE, or PENDING
- New self-registered users start as PENDING
- Admin-created users start as ACTIVE

#### Table 2: `bidders` (Extra Info for Bidders)

This is a COMPANION table to `users`. Not all users are bidders, so the extra bidder-specific information is kept separately. Each row here links to exactly one row in the `users` table.

| Column | What It Stores | Example |
|--------|---------------|---------|
| `id` | Unique bidder profile number | 1 |
| `bidder_type` | "ORGANIZATION" or "INDIVIDUAL" | "ORGANIZATION" |
| `organization_name` | Company name (only for organizations) | "ABC Construction PLC" |
| `tin_number` | Tax Identification Number | "0012345678" |
| `trade_license_number` | Trade license (optional, for organizations) | "TL-2024-1234" |
| `contact_person` | Who to call | "Sara Tewodros" |
| `phone_number` | Their phone | "+251-911-123456" |
| `address` | Physical address | "Bole, Addis Ababa" |
| `user_id` | Links to which user this belongs to (connects to the `users` table) | 5 |

**The link:** `user_id` in this table matches `id` in the `users` table. So if user #5 is a bidder, there's a row here with `user_id = 5`. This relationship is called a **foreign key** — think of it as a cross-reference.

#### Table 3: `procurement_officers` (Extra Info for Officers)

Same concept as bidders — extra information for users who are officers.

| Column | What It Stores | Example |
|--------|---------------|---------|
| `id` | Unique officer profile number | 1 |
| `department` | Their department | "Infrastructure" |
| `position` | Their job position | "Senior Officer" |
| `organization_name` | Their organization | "Federal Government" |
| `user_id` | Links to the `users` table | 3 |

#### Table 4: `notifications` (Alert Messages)

Every notification sent to any user is stored here.

| Column | What It Stores | Example |
|--------|---------------|---------|
| `id` | Unique notification number | 1 |
| `message` | The notification text | "Your account has been activated." |
| `notification_type` | Category of notification | "ACCOUNT_STATUS" |
| `is_read` | Has the user seen it? | `false` (not yet) |
| `entity_type` | What kind of thing is this about | "User" or "Tender" |
| `entity_id` | The specific item number | 7 |
| `sent_date` | When the notification was sent | "2026-03-05 14:32:00" |
| `user_id` | Who this notification is FOR | 5 |

#### Table 5: `audit_logs` (Activity Records)

The permanent record of every important action.

| Column | What It Stores | Example |
|--------|---------------|---------|
| `id` | Unique log entry number | 1 |
| `action` | What happened | "Activated user account" |
| `details` | Extra details (optional) | "Changed to EVALUATOR" |
| `entity_type` | What kind of thing was involved | "User" |
| `entity_id` | Which specific thing | 7 |
| `ip_address` | Computer address of who did it | "192.168.1.5" |
| `timestamp` | When it happened | "2026-03-05 14:32:05" |
| `performed_by` | Who did it (links to `users` table) | 1 |

### How Tables Relate to Each Other

```
┌──────────────┐
│    users     │
│  (id, name,  │
│   email...)  │
└──────┬───────┘
       │ id
       │
       ├─────────────── user_id ──► ┌──────────────┐
       │                            │   bidders    │ (extra bidder info)
       │                            └──────────────┘
       │
       ├─────────────── user_id ──► ┌──────────────────────┐
       │                            │ procurement_officers │ (extra officer info)
       │                            └──────────────────────┘
       │
       ├─────────────── user_id ──► ┌──────────────┐
       │                            │ notifications│ (alerts for this user)
       │                            └──────────────┘
       │
       └─────────── performed_by ──► ┌──────────────┐
                                     │  audit_logs  │ (actions by this user)
                                     └──────────────┘
```

All tables connect back to the `users` table. The `users` table is the CENTER of my feature.

---

## 13. How the Files Connect

### The Three-Layer Architecture

The project follows a pattern called **"Three-Layer Architecture"**. Think of it like a restaurant:

```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1: FRONTEND (The Dining Room)                        │
│  What the customer sees and interacts with                  │
│  Files: page.tsx, Sidebar.tsx, NotificationBell.tsx, etc.   │
│  Analogy: The menu, the table, the plates                   │
└─────────────────────┬───────────────────────────────────────┘
                      │ Sends requests over the internet
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 2: BACKEND (The Kitchen)                              │
│  Processes requests, applies business rules, does the work  │
│  Sub-layers:                                                 │
│    Routes     = The order counter (receives orders)          │
│    Controllers = The head chef (coordinates)                 │
│    Services    = The line cooks (do the actual cooking)      │
│    Middleware   = Kitchen rules (wash hands, check allergies)│
│  Files: auth.routes.ts, auth.controller.ts, auth.service.ts│
└─────────────────────┬───────────────────────────────────────┘
                      │ Reads/writes data
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 3: DATABASE (The Pantry/Storage)                      │
│  Where all ingredients (data) are stored permanently         │
│  Files: schema.prisma, db.ts                                │
│  Analogy: The refrigerator and shelves                       │
└─────────────────────────────────────────────────────────────┘
```

### Detailed File Flow for Each Operation

#### Registration Flow:

```
register/page.tsx  →  auth.tsx (register function)  →  api.ts (sends HTTP POST)
      │                                                       │
      │                                                       ▼
      │                                              auth.routes.ts
      │                                              (receives at /api/auth/register)
      │                                                       │
      │                                                       ▼
      │                                              auth.controller.ts
      │                                              (validates data)
      │                                                       │
      │                                                       ▼
      │                                              auth.service.ts
      │                                              (registerBidder function)
      │                                              - checks email uniqueness
      │                                              - encrypts password
      │                                                       │
      │                                                       ▼
      │                                              db.ts → prisma → DATABASE
      │                                              (saves to users + bidders tables)
      │                                                       │
      ◄───────────────── response flows back ─────────────────┘
```

#### Login Flow:

```
login/page.tsx  →  auth.tsx (login function)  →  api.ts (sends HTTP POST)
      │                                                    │
      │                                                    ▼
      │                                           auth.routes.ts → auth.controller.ts
      │                                                    │
      │                                                    ▼
      │                                           auth.service.ts (loginUser function)
      │                                           - finds user by email
      │                                           - compares password with bcrypt
      │                                           - checks account status
      │                                                    │
      │                                                    ▼
      │                                           auth.controller.ts
      │                                           - generates JWT tokens
      │                                           - sets cookies
      │                                           - records audit log
      │                                                    │
      ◄──────────────── response + cookies ────────────────┘
      │
      ▼
auth.tsx: stores user info, redirects to role-based dashboard
```

#### Admin User Management Flow:

```
admin/users/page.tsx  →  api.ts (sends HTTP PATCH)
      │                         │
      │                         ▼
      │                user.routes.ts
      │                (receives request)
      │                         │
      │                         ▼
      │                auth.ts middleware ← FIRST: checks if user is logged in
      │                         │
      │                         ▼
      │                auth.ts authorize("ADMIN") ← SECOND: checks if user is ADMIN
      │                         │
      │                         ▼
      │                user.controller.ts (updateStatus/updateRole/createUser)
      │                         │
      │                         ▼
      │                user.service.ts (does the actual work)
      │                - updates database
      │                - creates notification for affected user
      │                         │
      │                         ▼
      │                user.controller.ts writes audit log entry
      │                         │
      ◄─────── response ───────┘
```

### The server.ts File (The Main Switch)

**File:** `backend/src/server.ts`

This is the **control panel** that wires everything together. When the backend starts up, this file:

1. Sets up security protections (CORS, Helmet)
2. Enables JSON handling (so the backend can understand data from the frontend)
3. Enables cookie handling (so it can read/write JWT tokens)
4. Connects ALL routes to their URL paths:
   - `/api/auth` → `auth.routes.ts`
   - `/api/users` → `user.routes.ts`
   - `/api/audit-logs` → `audit.routes.ts`
   - `/api/notifications` → `notification.routes.ts`
   - and all other routes for Student 2 and 3's features
5. Sets up error handling (if anything crashes, show a nice error instead of a broken page)
6. Starts listening on port 5000 (the "address" where the backend lives)

---

## 14. Defense Questions and Answers

### Q1: What technology did you use for the frontend, and why?

**Answer:** We used **Next.js** with **React** and **TypeScript**. Next.js is like a toolkit for building web pages. React lets us break the page into small reusable pieces (called **components** — like LEGO blocks). TypeScript adds safety by catching mistakes before the code runs, like spell-check for code. We chose React because it's the most popular tool for building modern web applications, and Next.js adds features like automatic page routing (the URL automatically maps to a file).

### Q2: What technology did you use for the backend, and why?

**Answer:** We used **Node.js** with **Express** and **TypeScript**. Node.js lets us run JavaScript on the server (the "brain" computer). Express is a popular framework that makes it easy to handle web requests. We chose this combination because it uses the same language (JavaScript/TypeScript) for both frontend and backend, which makes development faster and more consistent.

### Q3: What database did you use, and why?

**Answer:** We used **PostgreSQL** with **Prisma ORM**. PostgreSQL is a free, powerful, and reliable database — trusted by governments and large companies. Prisma is a tool that makes it easy to talk to the database without writing complex database queries by hand. We chose PostgreSQL because it's secure, supports complex data relationships, and is suitable for government procurement systems that need reliability.

### Q4: How do you store passwords? Is it secure?

**Answer:** We NEVER store passwords in plain text. When a user creates a password, we use a library called **bcrypt** to **hash** (encrypt) it. Hashing is a one-way process — like turning flour into bread, you can't turn bread back into flour. We use **12 salt rounds**, which means the password is scrambled 12 times, making it extremely hard to reverse. Even if someone steals the entire database, they can't figure out the actual passwords.

### Q5: What is JWT, and how does it work in your system?

**Answer:** JWT stands for **JSON Web Token**. It's like a **digital ID badge** the system gives you after you successfully log in. This badge contains your user ID, email, and role. Every time you click something, your browser automatically sends this badge so the system knows who you are without asking you to log in again. We use TWO tokens: an **Access Token** (expires in 15 minutes for security) and a **Refresh Token** (lasts 7 days — it can create a new Access Token when the old one expires, so you don't have to keep logging in).

### Q6: How do you prevent unauthorized access?

**Answer:** We use **three layers of protection**:
1. **Authentication middleware** — checks if the user has a valid JWT token (are they logged in?)
2. **Authorization middleware** — checks if the user has the right role (are they allowed to do this?)
3. **Frontend route guards** — the dashboard layout checks if you're visiting a URL allowed for your role. If not, you're redirected to your dashboard.

### Q7: Why do new bidder accounts need admin approval?

**Answer:** This is a security measure common in government systems. Since this is a public procurement system dealing with government contracts and taxpayer money, we can't just let anyone in. The admin verification step ensures that:
- The bidder is a real person/company
- Their TIN (Tax Identification Number) and trade license are valid
- There are no duplicate or fraudulent accounts
It's like checking someone's ID before giving them a building access pass.

### Q8: What happens if a user's token expires?

**Answer:** The Access Token expires every 15 minutes. When it expires, the system doesn't immediately log you out. Instead, it checks for the **Refresh Token** (which lasts 7 days). If the Refresh Token is still valid, the system automatically creates a new Access Token behind the scenes — the user doesn't even notice. This gives the best of both worlds: security (short-lived Access Tokens) and convenience (users don't have to keep logging in).

### Q9: How does the system know which dashboard to show each user?

**Answer:** When a user logs in, their **role** is known (it's returned from the database and stored in the JWT token). A function called `getRoleDashboard` maps each role to a specific starting page:
- ADMIN → `/admin/users`
- PROCUREMENT_OFFICER → `/officer/dashboard`
- EVALUATOR → `/evaluator/dashboard`
- BIDDER → `/bidder/dashboard`

The sidebar component also reads the user's role and shows only the menu items for that role.

### Q10: What is an audit log and why is it important?

**Answer:** An audit log is a **permanent, automatic record** of every important action taken in the system — like a security camera that writes down everything it sees. It records WHO did WHAT, WHEN, and from WHERE (IP address). This is critical for government procurement systems because:
- It ensures **transparency** — you can prove that actions were taken properly
- It provides **accountability** — if something goes wrong, you can trace it back
- It supports **compliance** — government auditors can review the logs
- It deters **fraud** — people are less likely to do something wrong if they know it's being recorded

### Q11: How do notifications work? Are they real-time?

**Answer:** Notifications are not real-time in the strict sense (we don't use WebSockets or push notifications). Instead, the notification bell **polls** the server every 30 seconds — meaning it asks "do I have new notifications?" every half minute. When important events happen (like an account activation or a new tender being published), the system creates a notification record in the database. The next time the user's bell polls, it picks up the new notification. We chose this approach because it's simpler and reliable, and a 30-second delay is acceptable for a procurement system.

### Q12: What is the difference between the `users` table and the `bidders` table?

**Answer:** The `users` table stores **basic information** that ALL users share: name, email, password, role, status. The `bidders` table stores **extra information** that only bidders have: TIN number, trade license, organization name, contact person, etc. They are linked by the `user_id` column. This design is called **table normalization** — it avoids storing empty columns. For example, an Admin doesn't have a TIN number, so it would be wasteful to have a TIN column in the users table that's empty for non-bidders.

### Q13: What is Prisma, and what does `schema.prisma` do?

**Answer:** Prisma is an **ORM (Object-Relational Mapper)** — think of it as a **translator** between our code and the database. Instead of writing complex SQL queries (the language databases understand), we write simple commands in our code like `prisma.user.findUnique({ where: { email: "ahmed@gov.et" } })`, and Prisma translates that into the proper database query. The `schema.prisma` file is the **blueprint** that defines all our tables, their columns, the data types, and the relationships between tables. It's like an architectural plan for the database.

### Q14: How does the "Create User" feature differ from "Registration"?

**Answer:** They serve different purposes:
- **Registration** is for **bidders** who sign up **themselves** through the public registration page. Their accounts start as **PENDING** and need admin approval.
- **Create User** is for the **admin** to create internal staff accounts (Officers, Evaluators, other Admins). These accounts start as **ACTIVE** immediately because the admin is a trusted person.

Registration is self-service and public. Create User is admin-only and internal.

### Q15: What happens when an admin deactivates a user who is currently logged in?

**Answer:** Their current session continues to work until their **Access Token** expires (within 15 minutes max). When the Access Token expires and the system tries to use the Refresh Token, it looks up the user in the database and checks their status. Since the status is now INACTIVE, the system refuses to create a new Access Token. The user is effectively logged out and cannot log back in.

### Q16: What is input validation and why do you do it twice (frontend and backend)?

**Answer:** Input validation means **checking that the data is correct** before processing it. For example: Is the email in a valid format? Is the password at least 8 characters? We do it in TWO places:
1. **Frontend validation** — gives the user instant feedback (red error messages under fields) without waiting for the server. This is for user convenience.
2. **Backend validation** — the same checks run again on the server. This is for security. A skilled attacker could bypass the frontend entirely and send data directly to the server. The backend validation ensures no bad data ever enters the system.

We use a library called **Zod** for both, which defines the rules ("must be a valid email", "must be at least 8 characters") and applies them consistently.

### Q17: What is CORS, and why does the server configure it?

**Answer:** CORS stands for **Cross-Origin Resource Sharing**. Our frontend runs on `localhost:3000` and our backend runs on `localhost:5000`. By default, web browsers block requests between different addresses for security. CORS is the permission slip that tells the browser: "Yes, `localhost:3000` is allowed to talk to `localhost:5000`." Without this configuration, the frontend couldn't communicate with the backend at all.

### Q18: What is the `api.ts` file and what does it do?

**Answer:** It's a **communication helper**. It creates a pre-configured connection to the backend server. Instead of each page writing the full server address and setting headers every time, they just use this helper. It also includes an **interceptor** — a watchdog that monitors all server responses. If any response says "401 Unauthorized" (meaning you're not logged in), it automatically redirects you to the login page. This way, if your session expires anywhere in the app, you're gracefully sent to log in again.

### Q19: How does the system handle errors?

**Answer:** We have a structured error handling system:
1. **ApiError class** — a custom error type with a status code and message. For example, `new ApiError(409, "Email already exists")` creates a "conflict" error.
2. **Controllers** use try/catch blocks — if anything goes wrong, the error is caught and passed to the error handler.
3. **Global error handler** in `server.ts` — catches any unhandled errors and returns a clean JSON response instead of crashing the entire server.
4. **Frontend** — catches errors from API calls and shows them as red popup messages (using a library called "Sonner" for toast notifications).

### Q20: What security measures are implemented in your authentication system?

**Answer:** We implemented multiple security measures:
1. **Password hashing** with bcrypt (12 salt rounds) — passwords can't be read even if database is stolen
2. **JWT tokens** stored in httpOnly cookies — can't be stolen by malicious scripts
3. **Short-lived Access Tokens** (15 minutes) — limits the damage window if a token is compromised
4. **Refresh Token rotation** — long-term session without keeping a long-lived Access Token
5. **Account status checks** — PENDING and INACTIVE accounts can't log in
6. **Double validation** — both frontend and backend validate input
7. **Role-based access control** — users can only access features permitted by their role
8. **CORS configuration** — only our frontend can talk to our backend
9. **Helmet middleware** — adds security-related HTTP headers (prevents common web attacks)
10. **Audit logging** — every significant action is recorded for accountability
11. **Same error messages** for wrong email vs. wrong password — prevents email enumeration attacks

---

## Quick Reference: All My Files in One Place

### Frontend Files
| File | Purpose |
|------|---------|
| `frontend/src/app/page.tsx` | Landing page |
| `frontend/src/app/(auth)/layout.tsx` | Auth pages frame |
| `frontend/src/app/(auth)/login/page.tsx` | Login page |
| `frontend/src/app/(auth)/register/page.tsx` | Registration page |
| `frontend/src/app/(dashboard)/layout.tsx` | Dashboard frame + role protection |
| `frontend/src/app/(dashboard)/admin/users/page.tsx` | User management |
| `frontend/src/app/(dashboard)/admin/audit-logs/page.tsx` | Audit logs viewer |
| `frontend/src/app/(dashboard)/admin/monitoring/page.tsx` | System monitoring |
| `frontend/src/app/(dashboard)/notifications/page.tsx` | Full notifications page |
| `frontend/src/components/layout/Sidebar.tsx` | Left menu navigation |
| `frontend/src/components/layout/Header.tsx` | Top header bar |
| `frontend/src/components/layout/NotificationBell.tsx` | Notification bell dropdown |
| `frontend/src/lib/auth.tsx` | Authentication state management |
| `frontend/src/lib/api.ts` | Backend communication helper |

### Backend Files
| File | Purpose |
|------|---------|
| `backend/src/server.ts` | Main entry point — starts everything |
| `backend/src/config/db.ts` | Database connection |
| `backend/src/routes/auth.routes.ts` | Auth URL paths |
| `backend/src/controllers/auth.controller.ts` | Auth request handler |
| `backend/src/services/auth.service.ts` | Auth business logic |
| `backend/src/middleware/auth.ts` | Security guard (JWT + roles) |
| `backend/src/routes/user.routes.ts` | User management URL paths |
| `backend/src/controllers/user.controller.ts` | User management handler |
| `backend/src/services/user.service.ts` | User management logic |
| `backend/src/routes/notification.routes.ts` | Notification URL paths |
| `backend/src/controllers/notification.controller.ts` | Notification handler |
| `backend/src/services/notification.service.ts` | Notification logic |
| `backend/src/routes/audit.routes.ts` | Audit log URL paths |
| `backend/src/controllers/audit.controller.ts` | Audit log handler |
| `backend/src/services/audit.service.ts` | Audit log logic |
| `backend/src/middleware/audit.ts` | Automatic audit logging |
| `backend/src/middleware/upload.ts` | File upload handler |
| `backend/src/utils/ApiError.ts` | Error helper |
| `backend/src/utils/ApiResponse.ts` | Response helper |
| `backend/src/utils/helpers.ts` | Pagination helper |

### Database Files
| File | Purpose |
|------|---------|
| `backend/prisma/schema.prisma` | Database blueprint — defines all tables |
