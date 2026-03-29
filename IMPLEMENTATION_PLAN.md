# Online Tender Management System - Implementation Plan

## Technology Decisions

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend Framework | Next.js 14 (App Router) | SSR, file-based routing, API integration |
| UI Library | shadcn/ui + Tailwind CSS | Clean professional components, utility-first styling |
| Forms | react-hook-form + zod | Type-safe validation, good UX |
| Data Fetching | @tanstack/react-query | Caching, loading states, refetching |
| Icons | lucide-react | Consistent icon set, works with shadcn |
| Backend Framework | Express.js + TypeScript | REST API, middleware ecosystem |
| ORM | Prisma | Type-safe DB access, migrations, seeding |
| Database | PostgreSQL | Relational, JSONB for evaluation criteria |
| Auth | JWT (access + refresh tokens) | Stateless, httpOnly cookies |
| Password Hashing | bcryptjs | Industry standard |
| File Uploads | multer | Multipart form handling, local storage |
| Validation | zod (shared between frontend/backend) | Single source of truth for schemas |
| PDF Export | jspdf + jspdf-autotable | Client-side PDF generation for reports |
| Dates | date-fns | Lightweight date formatting |

## Project Structure

```
tender-management/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── rbac.ts
│   │   │   ├── audit.ts
│   │   │   └── upload.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── tender.routes.ts
│   │   │   ├── bid.routes.ts
│   │   │   ├── evaluation.routes.ts
│   │   │   ├── clarification.routes.ts
│   │   │   ├── notification.routes.ts
│   │   │   ├── report.routes.ts
│   │   │   └── audit.routes.ts
│   │   ├── controllers/
│   │   │   └── (mirrors routes)
│   │   ├── services/
│   │   │   └── (mirrors controllers)
│   │   ├── utils/
│   │   │   ├── ApiError.ts
│   │   │   ├── ApiResponse.ts
│   │   │   └── helpers.ts
│   │   └── server.ts
│   ├── uploads/
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── register/page.tsx
│   │   │   ├── (dashboard)/
│   │   │   │   ├── layout.tsx              ← sidebar layout
│   │   │   │   ├── admin/
│   │   │   │   │   ├── users/page.tsx
│   │   │   │   │   ├── audit-logs/page.tsx
│   │   │   │   │   └── monitoring/page.tsx
│   │   │   │   ├── officer/
│   │   │   │   │   ├── dashboard/page.tsx
│   │   │   │   │   ├── tenders/
│   │   │   │   │   │   ├── page.tsx         ← list
│   │   │   │   │   │   ├── new/page.tsx     ← create
│   │   │   │   │   │   └── [id]/
│   │   │   │   │   │       ├── page.tsx     ← detail/manage
│   │   │   │   │   │       ├── bids/page.tsx
│   │   │   │   │   │       └── evaluate/page.tsx
│   │   │   │   │   ├── reports/page.tsx
│   │   │   │   │   └── debriefings/page.tsx
│   │   │   │   ├── evaluator/
│   │   │   │   │   ├── dashboard/page.tsx
│   │   │   │   │   └── tenders/[id]/evaluate/page.tsx
│   │   │   │   └── bidder/
│   │   │   │       ├── dashboard/page.tsx
│   │   │   │       ├── tenders/
│   │   │   │       │   ├── page.tsx         ← browse
│   │   │   │       │   └── [id]/
│   │   │   │       │       ├── page.tsx     ← detail
│   │   │   │       │       └── bid/page.tsx ← submit bid
│   │   │   │       ├── my-bids/page.tsx
│   │   │   │       └── notifications/page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx                    ← landing/redirect
│   │   ├── components/
│   │   │   ├── ui/                         ← shadcn components
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   └── NotificationBell.tsx
│   │   │   └── shared/
│   │   │       ├── DataTable.tsx
│   │   │       ├── StatusBadge.tsx
│   │   │       ├── FileUpload.tsx
│   │   │       └── ConfirmDialog.tsx
│   │   ├── lib/
│   │   │   ├── api.ts                      ← axios instance
│   │   │   ├── auth.tsx                    ← auth context
│   │   │   └── utils.ts
│   │   ├── hooks/
│   │   │   └── use-*.ts
│   │   └── types/
│   │       └── index.ts
│   ├── public/
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
└── PROJECT_SCOPE.md
```

## UI Layout Decisions

- **Auth pages** (login, register): Centered card on a clean background, no sidebar
- **Dashboard layout**: Fixed left sidebar (collapsible) + top header with notification bell + main content area
- **Sidebar items**: Different per role, icons from lucide-react
- **Color scheme**: Blue primary (#2563eb), neutral grays, green for success, red for errors, amber for warnings
- **Tables**: shadcn DataTable with pagination, sorting, filtering
- **Forms**: Multi-section cards with clear labels, inline validation
- **Notifications**: Bell icon in header with dropdown showing recent, badge count for unread
- **Status badges**: Colored pills (Draft=gray, Published=blue, Under Evaluation=amber, Awarded=green, Cancelled=red)
- **File uploads**: Drag-and-drop zone with file list, size/type validation client-side
- **Modals**: Confirmation dialogs for destructive or irreversible actions (publish, award, etc.)

---

## Implementation Steps

Each step is independent and builds on previous ones. Complete them in order.

---

### STEP 1: Project Setup, Database Schema & Seed Data

**What this does**: Initializes the full project skeleton (backend + frontend), sets up PostgreSQL with Prisma, creates ALL database tables from the scope, seeds an admin user and sample data.

**After this step you have**: A running backend server connected to PostgreSQL with all tables created. A running Next.js frontend with Tailwind + shadcn configured. No pages or APIs yet beyond health check.

<details>
<summary><strong>PROMPT FOR STEP 1</strong> (click to expand)</summary>

```
I need you to initialize a full-stack project for an Online Tender Management System. Set up the complete project skeleton with database schema. Do NOT build any pages or API endpoints yet — just the foundation.

PROJECT LOCATION: /home/lame/Desktop/tendor-management

Read the file /home/lame/Desktop/tendor-management/PROJECT_SCOPE.md first — it contains the full system specification including all entities, fields, and relationships.

## BACKEND SETUP

Create `/home/lame/Desktop/tendor-management/backend/` with:

1. Initialize Node.js + TypeScript project
   - package.json with scripts: "dev", "build", "start", "seed", "migrate"
   - tsconfig.json targeting ES2020, strict mode
   - Install dependencies:
     - express, cors, cookie-parser, helmet, morgan
     - prisma, @prisma/client
     - bcryptjs, jsonwebtoken
     - multer
     - zod
     - dotenv
     - @types/* for all above
     - ts-node, tsx, typescript as devDependencies

2. Create `backend/.env`:
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tender_management"
   JWT_ACCESS_SECRET="tender-access-secret-key-change-in-production"
   JWT_REFRESH_SECRET="tender-refresh-secret-key-change-in-production"
   JWT_ACCESS_EXPIRES_IN="15m"
   JWT_REFRESH_EXPIRES_IN="7d"
   PORT=5000
   UPLOAD_DIR="./uploads"
   MAX_FILE_SIZE=10485760
   ```

3. Create `backend/prisma/schema.prisma` with ALL entities from the scope document:
   - User (base for all users — id, fullName, email, password hashed, role ENUM: ADMIN/PROCUREMENT_OFFICER/EVALUATOR/BIDDER, status ENUM: ACTIVE/INACTIVE/PENDING, createdAt, updatedAt)
   - Bidder (bidderType ENUM: ORGANIZATION/INDIVIDUAL, organizationName optional, tinNumber, tradeLicenseNumber optional, contactPerson, phoneNumber, address, userId FK unique)
   - ProcurementOfficer (department, position, organizationName, userId FK unique)
   - Tender (title, description, category ENUM: GOODS/WORKS/CONSULTING, eligibilityCriteria text, requiredDocuments text[], evaluationCriteria Json — array of {name, weight}, minimumTechnicalScore Float default 70, technicalWeight Float default 80, financialWeight Float default 20, bidSecurityRequired Boolean, bidSecurityAmount Float optional, publishDate optional, clarificationDeadline DateTime, submissionDeadline DateTime, status ENUM: DRAFT/PUBLISHED/UNDER_EVALUATION/AWARDED/CANCELLED, createdBy FK to User, createdAt, updatedAt)
   - TenderAddendum (tenderId FK, addendumNumber Int, description text, newDeadline DateTime optional, issuedBy FK to User, issuedDate DateTime default now)
   - Clarification (tenderId FK, question text, answer text optional, askedBy FK to User, answeredBy FK to User optional, askedDate DateTime default now, answeredDate DateTime optional)
   - Bid (tenderId FK, bidderId FK to User, technicalProposal text, bidAmount Float, bidSecurityInfo text optional, submissionDate DateTime default now, status ENUM: SUBMITTED/OPENED/TECHNICALLY_QUALIFIED/TECHNICALLY_DISQUALIFIED/EVALUATED/SELECTED/NOT_SELECTED, createdAt — add unique constraint on [tenderId, bidderId] to prevent duplicate bids)
   - BidDocument (bidId FK, fileName, fileType, filePath, fileSize Int, documentCategory ENUM: TECHNICAL/FINANCIAL/BID_SECURITY/OTHER, uploadDate DateTime default now)
   - EvaluationCommitteeAssignment (tenderId FK, userId FK, assignedDate DateTime default now, assignedBy FK to User — unique constraint on [tenderId, userId])
   - Evaluation (bidId FK, evaluatorId FK to User, criteriaScores Json — array of {criteriaName, score}, totalScore Float, remarks text optional, evaluationType ENUM: TECHNICAL/FINANCIAL, evaluationDate DateTime default now — unique constraint on [bidId, evaluatorId, evaluationType])
   - EvaluationSummary (bidId FK unique, tenderId FK, avgTechnicalScore Float, avgFinancialScore Float optional, combinedScore Float optional, rank Int optional, isTechnicallyQualified Boolean, isWinner Boolean default false)
   - DebriefingRequest (bidId FK, bidderId FK to User, requestDate DateTime default now, response text optional, respondedBy FK to User optional, respondedDate DateTime optional)
   - Notification (userId FK, message text, notificationType String, isRead Boolean default false, entityType String optional, entityId Int optional, sentDate DateTime default now)
   - AuditLog (action String, details text optional, entityType String optional, entityId Int optional, performedBy FK to User, ipAddress String optional, timestamp DateTime default now)

   Use proper cascade deletes, indexes on foreign keys, and @map for snake_case table names.

4. Create `backend/src/server.ts` — basic Express server with:
   - CORS (allow localhost:3000)
   - JSON body parser
   - Cookie parser
   - Helmet
   - Morgan logging
   - Health check route GET /api/health
   - Static file serving for /uploads
   - Error handling middleware
   - Listen on PORT from env

5. Create `backend/src/config/db.ts` — Prisma client singleton

6. Create `backend/src/utils/ApiError.ts` — custom error class with statusCode
7. Create `backend/src/utils/ApiResponse.ts` — standard response wrapper { success, message, data }
8. Create `backend/src/utils/helpers.ts` — placeholder for shared helpers

9. Create `backend/prisma/seed.ts` that:
   - Creates a default admin user: email=admin@tender.gov.et, password=Admin@123, role=ADMIN, status=ACTIVE
   - Creates 2 sample procurement officers
   - Creates 3 sample evaluation committee members
   - Creates 2 sample bidder accounts (1 organization, 1 individual) with status=ACTIVE
   - Console logs the created credentials

10. Create `backend/uploads/.gitkeep`

## FRONTEND SETUP

Create `/home/lame/Desktop/tendor-management/frontend/` with:

1. Initialize Next.js 14 with App Router, TypeScript, Tailwind CSS, ESLint
   - Install additional dependencies:
     - @tanstack/react-query
     - react-hook-form, @hookform/resolvers, zod
     - axios
     - date-fns
     - lucide-react
     - jspdf, jspdf-autotable
     - class-variance-authority, clsx, tailwind-merge (for shadcn)

2. Initialize shadcn/ui:
   - Create `frontend/components.json` config for shadcn (new-york style, blue primary)
   - Install these shadcn components: button, input, label, card, table, badge, dialog, dropdown-menu, select, textarea, tabs, toast, toaster, sonner, separator, sheet, skeleton, avatar, form, calendar, popover, command, checkbox, radio-group, switch, tooltip, alert

3. Create `frontend/src/lib/api.ts`:
   - Axios instance with baseURL=http://localhost:5000/api
   - withCredentials: true
   - Response interceptor for 401 (redirect to /login)

4. Create `frontend/src/lib/utils.ts` — cn() utility for tailwind class merging

5. Create `frontend/src/types/index.ts` — TypeScript interfaces matching ALL Prisma models (User, Bidder, Tender, Bid, etc.) plus enums for Role, Status, TenderStatus, BidStatus, etc.

6. Create `frontend/src/app/layout.tsx` — root layout with Inter font, Toaster, QueryClientProvider

7. Create `frontend/src/app/page.tsx` — simple landing page that redirects to /login

8. Create `frontend/tailwind.config.ts` — extend with the shadcn theme colors

## FINAL STEPS

1. Create a root `package.json` at /home/lame/Desktop/tendor-management/ with scripts:
   - "dev": runs both backend and frontend concurrently
   - "dev:backend": cd backend && npm run dev
   - "dev:frontend": cd frontend && npm run dev

2. Create `.gitignore` at root covering node_modules, .env, uploads/*, dist/, .next/

3. Run: npm install in both backend and frontend
4. Run: npx prisma migrate dev --name init (in backend/)
5. Run: npx prisma db seed (in backend/)
6. Verify both servers start without errors

Do NOT create any API routes, controllers, services, or pages beyond what's listed above. Just the skeleton, database, and config.
```

</details>

---

### STEP 2: Authentication System (Backend + Frontend)

**What this does**: Implements JWT-based registration, login, logout, auth middleware, role-based access control middleware, and the frontend auth pages (login + bidder registration).

**After this step you have**: Users can register as bidders (org or individual), login, and see a placeholder dashboard based on their role. Auth is fully working with protected routes.

<details>
<summary><strong>PROMPT FOR STEP 2</strong> (click to expand)</summary>

```
I need you to implement the complete authentication system for the Online Tender Management System. This includes backend auth APIs, middleware, and the frontend login + registration pages.

Read /home/lame/Desktop/tendor-management/PROJECT_SCOPE.md for full context.

The project skeleton already exists at /home/lame/Desktop/tendor-management/ with:
- backend/ — Express + TypeScript + Prisma (all tables already migrated)
- frontend/ — Next.js 14 + TypeScript + Tailwind + shadcn/ui configured

## BACKEND — Auth Routes & Middleware

### 1. Create `backend/src/middleware/auth.ts`
- `authenticate` middleware:
  - Read access token from cookie `access_token`
  - Verify with JWT_ACCESS_SECRET
  - Attach `req.user = { id, email, role }` to request
  - If expired, try refresh token from cookie `refresh_token`, issue new access token
  - If both invalid, return 401
- `authorize(...roles: Role[])` middleware:
  - Check if req.user.role is in the allowed roles array
  - If not, return 403 "Access denied"

### 2. Create `backend/src/middleware/audit.ts`
- `auditLog(action: string, entityType?: string)` middleware factory
- After the route handler completes successfully, insert a record into AuditLog table
- Capture: action, entityType, entityId (from req.params.id or response), performedBy (req.user.id), ipAddress (req.ip)
- This middleware will be used on all state-changing routes in later steps

### 3. Create `backend/src/routes/auth.routes.ts` with these endpoints:

**POST /api/auth/register** — Bidder self-registration
- Body: { email, password, fullName, bidderType: "ORGANIZATION"|"INDIVIDUAL", organizationName?, tinNumber, tradeLicenseNumber?, contactPerson, phoneNumber, address }
- Validate with zod: email required valid email, password min 8 chars with at least 1 uppercase + 1 number, fullName required, bidderType required, tinNumber required, phoneNumber required, address required. If bidderType=ORGANIZATION then organizationName is required.
- Check email uniqueness
- Hash password with bcryptjs (12 rounds)
- Create User with role=BIDDER, status=PENDING
- Create Bidder profile linked to user
- Return success message "Registration submitted. Your account is pending admin verification."
- Do NOT issue tokens (account is PENDING)

**POST /api/auth/login**
- Body: { email, password }
- Validate with zod
- Find user by email
- Compare password with bcrypt
- Check user.status === ACTIVE (if PENDING: "Account pending verification", if INACTIVE: "Account deactivated")
- Generate access token (15m) with payload { id, email, role }
- Generate refresh token (7d) with payload { id }
- Set both as httpOnly, sameSite=lax, secure=false (dev), path=/ cookies
- Return { user: { id, fullName, email, role, status } }
- Log audit: "User logged in"

**POST /api/auth/logout**
- Clear both cookies
- Log audit: "User logged out"
- Return success

**GET /api/auth/me**
- Protected (authenticate middleware)
- Return current user with their profile (bidder or officer details)
- Include: user fields + bidder/officer profile if exists

### 4. Create corresponding controller and service files:
- `backend/src/controllers/auth.controller.ts`
- `backend/src/services/auth.service.ts`

### 5. Register auth routes in server.ts

## FRONTEND — Auth Context & Pages

### 1. Create `frontend/src/lib/auth.tsx` — AuthProvider context
- State: user (User | null), isLoading (boolean)
- On mount: call GET /api/auth/me to check if already logged in
- Expose: user, isLoading, login(email, password), register(data), logout()
- login(): POST /api/auth/login, set user state, redirect based on role:
  - ADMIN → /admin/users
  - PROCUREMENT_OFFICER → /officer/dashboard
  - EVALUATOR → /evaluator/dashboard
  - BIDDER → /bidder/tenders
- register(): POST /api/auth/register, show success toast
- logout(): POST /api/auth/logout, clear user, redirect to /login
- Wrap the app with this provider in layout.tsx

### 2. Create `frontend/src/app/(auth)/layout.tsx`
- Centered layout: flex items-center justify-center min-h-screen bg-gray-50
- If user already logged in, redirect to dashboard

### 3. Create `frontend/src/app/(auth)/login/page.tsx`
- Card with logo/title "Tender Management System"
- Form fields: Email (input), Password (input type=password)
- Login button
- Link to /register at bottom: "Don't have an account? Register as a bidder"
- Use react-hook-form + zod validation
- Show error toasts on failure
- On success, redirect based on role

### 4. Create `frontend/src/app/(auth)/register/page.tsx`
- Card with title "Bidder Registration"
- Step 1: Account type selection — two cards: "Organization" or "Individual Consultant"
- Step 2: Form fields based on selection:
  - **Organization**: Organization Name*, TIN Number*, Trade License Number, Contact Person*, Phone*, Address*, Email*, Password*, Confirm Password
  - **Individual**: Full Name*, Profession/Expertise*, National ID (as TIN field)*, Phone*, Address*, Email*, Password*, Confirm Password
- Use react-hook-form + zod with conditional validation based on bidderType
- Submit button
- On success: show success message "Registration submitted! An administrator will review and activate your account." with link back to login
- Link to /login: "Already have an account? Login"

### 5. Create `frontend/src/app/(dashboard)/layout.tsx` — Protected dashboard layout
- Check auth — if not logged in, redirect to /login
- If logged in but account not ACTIVE, show "Account pending" page
- Layout: Sidebar (left, 256px wide, collapsible) + Header (top) + Main content
- Sidebar component with role-based navigation:
  **ADMIN**: Users, Audit Logs, Monitoring
  **PROCUREMENT_OFFICER**: Dashboard, Tenders, Reports, Debriefings
  **EVALUATOR**: Dashboard, My Evaluations
  **BIDDER**: Browse Tenders, My Bids, Notifications
- Header: App name on left, notification bell placeholder + user avatar/name dropdown (with logout) on right
- Active sidebar item highlighted

### 6. Create placeholder pages (just a heading with the page name so routing works):
- /admin/users → "User Management"
- /admin/audit-logs → "Audit Logs"
- /admin/monitoring → "System Monitoring"
- /officer/dashboard → "Procurement Officer Dashboard"
- /officer/tenders → "My Tenders"
- /officer/tenders/new → "Create Tender"
- /officer/reports → "Reports"
- /officer/debriefings → "Debriefing Requests"
- /evaluator/dashboard → "Evaluator Dashboard"
- /bidder/tenders → "Browse Tenders"
- /bidder/my-bids → "My Bids"
- /bidder/notifications → "Notifications"

Make sure everything compiles and runs. I should be able to:
1. Open http://localhost:3000 → redirected to /login
2. Click "Register" → fill out bidder registration → see success message
3. Login with admin@tender.gov.et / Admin@123 → see admin sidebar + "User Management" placeholder
4. Login with a seeded officer → see officer sidebar
5. Login with a seeded bidder (if active) → see bidder sidebar
```

</details>

---

### STEP 3: Admin Panel — User Management, Roles, Monitoring, Audit Logs

**What this does**: Full admin functionality — view/filter users, activate pending bidders, deactivate accounts, create internal users, assign roles, audit log viewer, system monitoring dashboard.

**After this step you have**: Admin can manage all users, verify and activate bidder accounts, view audit logs, and see system stats.

<details>
<summary><strong>PROMPT FOR STEP 3</strong> (click to expand)</summary>

```
I need you to implement the complete Admin Panel for the Online Tender Management System.

Read /home/lame/Desktop/tendor-management/PROJECT_SCOPE.md for the full specification.

The project is at /home/lame/Desktop/tendor-management/. Auth system is already working (JWT login/register, auth middleware, role-based access). The Prisma schema has all tables already migrated.

## BACKEND API ENDPOINTS

### User Management — `backend/src/routes/user.routes.ts`

All endpoints require authenticate + authorize(ADMIN).

**GET /api/users** — List all users with filtering
- Query params: role (optional), status (optional), search (optional — searches fullName/email), page (default 1), limit (default 20)
- Return paginated users with their bidder/officer profiles included
- Return: { users: [...], total, page, totalPages }

**GET /api/users/:id** — Get single user with full profile
- Return user + bidder profile (with TIN, trade license, etc.) or officer profile

**POST /api/users** — Create internal user (officer, evaluator, admin)
- Body: { email, password, fullName, role: PROCUREMENT_OFFICER|EVALUATOR|ADMIN, department?, position?, organizationName? }
- Only for creating internal users — NOT bidders (they self-register)
- Validate with zod
- If role=PROCUREMENT_OFFICER, also create ProcurementOfficer profile with department, position, organizationName
- Set status=ACTIVE immediately
- Audit log: "Created user account"

**PATCH /api/users/:id/status** — Activate or deactivate
- Body: { status: "ACTIVE" | "INACTIVE" }
- Cannot deactivate yourself
- Audit log: "Activated user account" or "Deactivated user account"
- Create notification for the affected user: "Your account has been activated/deactivated"

**PATCH /api/users/:id/role** — Change user role
- Body: { role: "ADMIN" | "PROCUREMENT_OFFICER" | "EVALUATOR" | "BIDDER" }
- Cannot change your own role
- If changing to PROCUREMENT_OFFICER and no officer profile exists, require department/position in body and create it
- Audit log: "Changed user role"

### Audit Logs — `backend/src/routes/audit.routes.ts`

**GET /api/audit-logs** — List audit logs with filtering
- Require ADMIN role
- Query params: userId (optional), action (optional), entityType (optional), startDate (optional), endDate (optional), page, limit
- Return paginated logs with user fullName included
- Return: { logs: [...], total, page, totalPages }

### System Stats — add to user routes or separate

**GET /api/admin/stats** — System monitoring data
- Require ADMIN role
- Return:
  - totalUsers (by role breakdown)
  - usersByStatus (active, inactive, pending counts)
  - totalTenders (by status breakdown)
  - totalBids
  - recentActivity (last 10 audit log entries with user names)

### Create controllers and services for all above.

## FRONTEND PAGES

### 1. `/admin/users/page.tsx` — User Management Page

- Page title: "User Management"
- Top bar: "Create User" button (opens dialog) + search input + role filter dropdown + status filter dropdown
- Data table with columns: Name, Email, Role (colored badge), Status (colored badge), Registered Date, Actions
- Status badges: ACTIVE=green, INACTIVE=red, PENDING=amber
- Role badges: ADMIN=purple, PROCUREMENT_OFFICER=blue, EVALUATOR=cyan, BIDDER=gray
- Actions column: dropdown menu with:
  - "View Details" → opens detail dialog
  - "Activate" (if pending/inactive) → confirm dialog → PATCH status
  - "Deactivate" (if active) → confirm dialog → PATCH status
  - "Change Role" → dialog with role selector → PATCH role
- Pagination at bottom
- **View Details dialog**: Shows all user info. For bidders: organization name, TIN, trade license, contact person, phone, address. For officers: department, position, organization.
- **Create User dialog**: Form with fields — Full Name, Email, Password, Role (dropdown: Procurement Officer, Evaluator, Admin). If Procurement Officer selected, show additional fields: Department, Position, Organization Name. Submit creates the user.
- Use @tanstack/react-query for data fetching with refetch on mutations
- Toast notifications on all actions

### 2. `/admin/audit-logs/page.tsx` — Audit Logs Page

- Page title: "Audit Logs"
- Filters bar: User search/select, Action type dropdown, Date range picker (from/to), Entity type dropdown
- Data table columns: Timestamp (formatted), User, Action, Entity Type, Entity ID, IP Address, Details
- Rows are read-only (no actions)
- Pagination
- "Export" button placeholder (will be implemented in reports step)

### 3. `/admin/monitoring/page.tsx` — System Monitoring Dashboard

- Page title: "System Monitoring"
- Grid of stat cards (2x3 or 3x2):
  - Total Users (with breakdown: X admins, X officers, X evaluators, X bidders)
  - Pending Accounts (number — with "Review" link to /admin/users?status=PENDING)
  - Total Tenders (with breakdown by status)
  - Total Bids
  - Active Users (logged in today — or just total active status)
- Below cards: "Recent Activity" section — table showing last 20 audit log entries (timestamp, user, action)
- Use stat cards from shadcn Card component with icons from lucide-react

Make sure everything compiles and works end to end. Admin should be able to:
1. Login → see monitoring dashboard stats
2. Go to Users → see list of all users
3. Filter by role/status, search by name
4. Click a pending bidder → View Details → see their TIN/trade license → Activate
5. Create a new procurement officer account
6. View audit logs for all actions taken
```

</details>

---

### STEP 4: Tender Management (Procurement Officer)

**What this does**: Full tender lifecycle management by procurement officers — create tender with evaluation criteria, edit drafts, publish, issue addenda, manage clarifications, view tender status.

**After this step you have**: Officers can create tenders with weighted evaluation criteria, publish them, issue addenda, and answer bidder clarification questions.

<details>
<summary><strong>PROMPT FOR STEP 4</strong> (click to expand)</summary>

```
I need you to implement the complete Tender Management system for Procurement Officers.

Read /home/lame/Desktop/tendor-management/PROJECT_SCOPE.md for the full specification — especially the Tender Lifecycle, UC-8 through UC-5 (Create Tender, Publish, Addendum, Clarifications).

Project is at /home/lame/Desktop/tendor-management/. Auth + Admin are already working.

## BACKEND API ENDPOINTS

### Tender Routes — `backend/src/routes/tender.routes.ts`

**POST /api/tenders** — Create tender (PROCUREMENT_OFFICER only)
- Body: { title, description, category: GOODS|WORKS|CONSULTING, eligibilityCriteria, requiredDocuments: string[], evaluationCriteria: [{name, weight}], minimumTechnicalScore, technicalWeight, financialWeight, bidSecurityRequired, bidSecurityAmount?, clarificationDeadline, submissionDeadline }
- Validate with zod:
  - title required, min 10 chars
  - description required, min 50 chars
  - evaluationCriteria must have at least 1 item, all weights must sum to 100
  - technicalWeight + financialWeight must equal 100
  - minimumTechnicalScore between 0 and 100
  - clarificationDeadline must be before submissionDeadline
  - submissionDeadline must be in the future
  - If bidSecurityRequired, bidSecurityAmount is required
- Set status=DRAFT, createdBy=req.user.id
- Audit log: "Created tender"
- Return the created tender

**GET /api/tenders** — List tenders
- If PROCUREMENT_OFFICER: return their own tenders (created by them)
- If BIDDER: return only PUBLISHED tenders (and not past deadline unless they already bid)
- If EVALUATOR: return only tenders they're assigned to evaluate
- If ADMIN: return all tenders
- Query params: status, category, search (title), page, limit
- Include: bid count, addendum count, createdBy user name

**GET /api/tenders/:id** — Get tender detail
- Return tender with: addenda, clarifications (with asker name hidden for bidders, visible for officers), evaluation criteria, bid count
- BIDDER: can only see PUBLISHED+ tenders
- OFFICER: can see their own tenders in any status
- EVALUATOR: can see only assigned tenders

**PUT /api/tenders/:id** — Update tender (DRAFT only)
- Only the officer who created it can edit
- Only if status=DRAFT
- Validate same as create
- Audit log: "Updated tender"

**PATCH /api/tenders/:id/publish** — Publish tender
- Only creator, only if DRAFT
- Validate all required fields are filled
- Set status=PUBLISHED, publishDate=now
- Create notification for ALL active bidders: "New tender published: {title}"
- Audit log: "Published tender"

**PATCH /api/tenders/:id/cancel** — Cancel tender
- Only creator, only if DRAFT or PUBLISHED
- Set status=CANCELLED
- If was PUBLISHED: notify all bidders who submitted bids
- Audit log: "Cancelled tender"

### Addendum Routes — `backend/src/routes/tender.routes.ts` (nested)

**POST /api/tenders/:id/addenda** — Issue addendum (PROCUREMENT_OFFICER)
- Body: { description, newDeadline? }
- Only if tender is PUBLISHED
- Auto-increment addendumNumber
- If newDeadline provided and is after current submissionDeadline, update tender's submissionDeadline
- Create notification for ALL active bidders: "Addendum #{n} issued for: {title}"
- Audit log: "Issued addendum"

**GET /api/tenders/:id/addenda** — List addenda for a tender

### Clarification Routes — `backend/src/routes/clarification.routes.ts`

**POST /api/tenders/:id/clarifications** — Ask question (BIDDER only)
- Body: { question }
- Only if tender is PUBLISHED and clarificationDeadline has NOT passed
- askedBy=req.user.id
- Create notification for the tender's creator (officer): "New clarification question on: {title}"
- Audit log: "Asked clarification"

**PATCH /api/clarifications/:id/answer** — Answer question (PROCUREMENT_OFFICER only)
- Body: { answer }
- Only the tender's creator can answer
- Set answeredBy, answeredDate
- Create notification for ALL active bidders: "Clarification answered on: {title}"
- Audit log: "Answered clarification"

**GET /api/tenders/:id/clarifications** — List Q&A for a tender
- For BIDDER: hide askedBy identity (show as "Anonymous Bidder")
- For OFFICER: show askedBy name
- Return ordered by askedDate desc

### Create all controllers and services.

## FRONTEND PAGES

### 1. `/officer/dashboard/page.tsx` — Officer Dashboard
- Page title: "Dashboard"
- Stat cards row:
  - Total Tenders (by me)
  - Draft Tenders
  - Published Tenders
  - Awarded Tenders
- Recent tenders table (last 5): Title, Category, Status badge, Deadline, Bids count, Actions (View)
- Quick action button: "Create New Tender"

### 2. `/officer/tenders/page.tsx` — My Tenders List
- Page title: "My Tenders"
- Top bar: "Create Tender" button + status filter + category filter + search
- Data table columns: Title, Category badge, Status badge, Published Date, Submission Deadline, Bids, Actions
- Actions dropdown: View, Edit (draft only), Publish (draft only), Cancel (draft/published)
- Pagination

### 3. `/officer/tenders/new/page.tsx` — Create Tender Form
- Page title: "Create New Tender"
- Multi-section form in a card:
  **Section 1 — Basic Information**:
  - Title (input)
  - Category (select: Goods, Works, Consulting Services)
  - Description (textarea, large)
  - Eligibility Criteria (textarea)

  **Section 2 — Documents & Requirements**:
  - Required Documents (dynamic list — add/remove string items like "Company Registration Certificate", "Tax Clearance", "Technical Proposal Document", etc.)

  **Section 3 — Evaluation Criteria**:
  - Dynamic rows: Criteria Name (input) + Weight % (number input) + Remove button
  - "Add Criteria" button
  - Show total weight with validation (must = 100)
  - Technical vs Financial weight split: two number inputs that must sum to 100
  - Minimum Technical Qualifying Score: number input (default 70)

  **Section 4 — Deadlines & Bid Security**:
  - Clarification Deadline (date-time picker)
  - Submission Deadline (date-time picker)
  - Bid Security Required (checkbox/switch)
  - If checked: Bid Security Amount (number input)

  **Bottom**: "Save as Draft" button + "Save & Publish" button
- Full zod validation with inline error messages
- On save: redirect to tender detail page with success toast

### 4. `/officer/tenders/[id]/page.tsx` — Tender Detail / Manage Page
- Page title: tender title
- Status badge prominently displayed
- **Info tab**: All tender details displayed in a clean layout (read-only)
- **Addenda tab**: List of addenda with number, date, description. "Issue Addendum" button (if PUBLISHED) opens a dialog with description textarea + optional new deadline picker.
- **Clarifications tab**: List of Q&A. Unanswered questions highlighted. Each question has an "Answer" button that opens an inline form or dialog. Answered questions show both Q and A.
- **Action buttons** (contextual based on status):
  - DRAFT: "Edit" (goes to edit page), "Publish" (confirm dialog), "Cancel" (confirm dialog)
  - PUBLISHED: "Issue Addendum", "Cancel" (confirm dialog)
  - Show bid count and link to bids page (implemented in later step)
- **Edit page** (`/officer/tenders/[id]/edit` or reuse the create form): Same form as create, pre-filled. Only for DRAFT.

Make sure everything works end to end. Officer should be able to:
1. Login → see dashboard with stats
2. Create a tender with 4 evaluation criteria summing to 100%
3. See it in the tenders list as Draft
4. Edit the draft, change details
5. Publish the tender
6. Issue an addendum extending the deadline
7. See a clarification question from a bidder and answer it
8. Cancel a tender (draft or published)
```

</details>

---

### STEP 5: Bidder Portal — Browse Tenders, Clarifications & Bid Submission

**What this does**: Full bidder experience — browse/search/filter published tenders, view full details with addenda and Q&A, ask clarification questions, submit bids with file uploads, track own bids.

**After this step you have**: Bidders can find tenders, ask questions, and submit complete bids with technical + financial proposals and document attachments.

<details>
<summary><strong>PROMPT FOR STEP 5</strong> (click to expand)</summary>

```
I need you to implement the complete Bidder Portal — tender browsing, clarification questions, and bid submission with file uploads.

Read /home/lame/Desktop/tendor-management/PROJECT_SCOPE.md for full context — especially UC-3 (Browse Tenders), UC-4 (Ask Clarification), UC-6 (Submit Bid), and the bid validation rules.

Project is at /home/lame/Desktop/tendor-management/. Auth, Admin, and Tender Management are already working. Officers can create and publish tenders.

## BACKEND API ENDPOINTS

### File Upload Middleware — `backend/src/middleware/upload.ts`
- Configure multer:
  - Storage: disk storage in `backend/uploads/` directory
  - Organize files into subdirectories by bid: `uploads/bids/{bidId}/`
  - Filename: `{timestamp}-{originalname}`
  - File filter: allow PDF, DOCX, DOC, XLSX, XLS, JPG, JPEG, PNG only
  - Size limit: 10MB per file (from env MAX_FILE_SIZE)
- Export the configured multer instance

### Bid Routes — `backend/src/routes/bid.routes.ts`

**POST /api/tenders/:tenderId/bids** — Submit bid (BIDDER only)
- Accept multipart/form-data (use multer for file uploads)
- Fields: technicalProposal (text), bidAmount (number), bidSecurityInfo (text, optional based on tender.bidSecurityRequired)
- Files: multiple files with field names "technicalDocs" and "otherDocs"
- Validation:
  - Tender must be PUBLISHED
  - Submission deadline must NOT have passed
  - Bidder must not have already submitted a bid for this tender (unique [tenderId, bidderId] constraint)
  - bidAmount must be positive
  - technicalProposal must not be empty
  - If tender requires bid security, bidSecurityInfo must be provided
  - At least one technical document must be uploaded
- Create Bid with status=SUBMITTED
- Create BidDocument entries for each uploaded file (categorize as TECHNICAL for technicalDocs, OTHER for otherDocs)
- Create notification for the tender's officer: "New bid submitted for: {tender.title} by {bidder.organizationName || bidder.fullName}"
- Create notification for the bidder: "Your bid for {tender.title} has been submitted successfully"
- Audit log: "Submitted bid"
- Return the created bid

**GET /api/bids/my-bids** — Get current bidder's bids (BIDDER only)
- Return all bids by the current user
- Include: tender title, tender status, bid status, submission date, bid amount
- Order by submissionDate desc
- Query params: page, limit

**GET /api/bids/:id** — Get bid detail
- BIDDER: can only see their own bid
- OFFICER: can see bids for their tenders
- EVALUATOR: can see bids for assigned tenders (financial hidden during tech eval — handled in eval step)
- Return bid with documents, tender title, evaluationSummary if exists

**GET /api/tenders/:tenderId/bids** — List bids for a tender
- OFFICER only (tender creator)
- Return all bids with bidder info (org name / full name), bid amount, status, submission date, document count
- Query params: page, limit

### Static file serving
- Make sure `backend/uploads/` is served statically at `/uploads/` path
- Add auth check for file downloads: only the bid owner, the tender officer, assigned evaluators, and admins can download bid documents
  - Create a route: **GET /api/files/:documentId** that checks permissions then streams the file

### Create all controllers and services.

## FRONTEND PAGES

### 1. `/bidder/tenders/page.tsx` — Browse Tenders
- Page title: "Browse Tenders"
- Top bar: Search input (searches title/description) + Category filter (All, Goods, Works, Consulting) + Sort (Deadline: soonest first, Newest first)
- Tender cards (grid layout, 1-2 columns):
  Each card shows:
  - Title (bold, linked to detail page)
  - Category badge
  - Status badge (should all be "Published" or "Open")
  - Description (truncated to 2 lines)
  - Submission Deadline (with countdown: "3 days left" or "Closes in 5 hours" — use date-fns)
  - Bid Security: "Required (ETB {amount})" or "Not Required"
  - Number of addenda issued (if any)
  - "View Details" button
- Empty state: "No open tenders available at the moment."
- Pagination

### 2. `/bidder/tenders/[id]/page.tsx` — Tender Detail Page
- Page title: tender title
- Top section: Category badge, Status badge, Deadline countdown
- **Tabs**:

  **Overview tab**:
  - Description (full text)
  - Eligibility Criteria
  - Required Documents (list)
  - Evaluation Criteria table (Criteria Name | Weight %)
  - Technical Weight vs Financial Weight
  - Minimum Technical Score
  - Bid Security: Required/Not Required + Amount
  - Deadlines: Clarification deadline, Submission deadline (formatted nicely, with "Passed" label if past)
  - "Submit Bid" button (large, primary) — only visible if:
    - Deadline not passed
    - Bidder hasn't already submitted
    - If already submitted, show "You have already submitted a bid" message with link to view it

  **Addenda tab**:
  - List of addenda: Addendum #{n} — Date — Description
  - If new deadline was set, show it
  - Empty state: "No addenda issued"

  **Clarifications tab**:
  - List of Q&A pairs: Question (by "Anonymous Bidder") | Answer (by officer name) or "Pending answer"
  - "Ask a Question" form at top (only if clarification deadline not passed):
    - Textarea for question
    - Submit button
    - Note: "Your identity will be kept anonymous"
  - If clarification deadline passed: show "Clarification period has ended"
  - Empty state: "No clarifications yet"

### 3. `/bidder/tenders/[id]/bid/page.tsx` — Submit Bid Page
- Check: if deadline passed → redirect back with error
- Check: if already submitted → redirect to bid detail
- Page title: "Submit Bid for: {tender title}"
- Multi-section form:

  **Section 1 — Technical Proposal**:
  - Technical Summary (textarea — describe your approach, methodology, experience)
  - Technical Documents (file upload area):
    - Drag and drop zone or click to browse
    - Show uploaded files list with: name, size, remove button
    - Accept: PDF, DOCX, DOC, XLSX, XLS, JPG, PNG
    - Max 10MB per file
    - At least 1 file required
    - Show the "Required Documents" from the tender as a checklist reminder

  **Section 2 — Financial Proposal**:
  - Bid Amount (number input, with ETB currency label)
  - Must be positive

  **Section 3 — Bid Security** (only shown if tender requires it):
  - Bank Guarantee Reference Number (input)
  - Issuing Bank (input)
  - Guarantee Amount (number input)
  - Validity Date (date picker)
  - All fields required if section is shown

  **Section 4 — Supporting Documents** (optional):
  - File upload area for any additional documents
  - Same file type/size constraints

  **Bottom**:
  - Review summary: Show all entered data in a read-only preview
  - Confirm checkbox: "I confirm that all information provided is accurate and complete"
  - "Submit Bid" button (disabled until checkbox checked)
  - Confirm dialog: "Once submitted, your bid cannot be modified. Are you sure?"

- On submit: POST to /api/tenders/:id/bids as multipart form data
- On success: redirect to /bidder/my-bids with success toast

### 4. `/bidder/my-bids/page.tsx` — My Bids
- Page title: "My Bids"
- Data table columns: Tender Title (linked), Category, Bid Amount, Submitted Date, Bid Status (badge), Tender Status (badge), Actions
- Bid Status badges: SUBMITTED=blue, OPENED=cyan, TECHNICALLY_QUALIFIED=green, TECHNICALLY_DISQUALIFIED=red, SELECTED=green+bold, NOT_SELECTED=gray
- Actions: "View Details" → opens bid detail page
- **Bid detail** (can be a dialog or separate page):
  - Tender info summary
  - Technical summary
  - Bid amount
  - Bid security info
  - Uploaded documents list (with download links)
  - Status timeline (show progression of status changes)
  - If SELECTED or NOT_SELECTED: show evaluation results (own scores, rank) — implemented in later step
  - If NOT_SELECTED: show "Request Debriefing" button — implemented in later step

### 5. `/bidder/dashboard/page.tsx` — Bidder Dashboard
- Page title: "Dashboard"
- Stat cards: Active Tenders (published count), My Bids (total), Pending Results, Won Bids
- Recent published tenders (last 5 cards with "View" links)
- My recent bids (last 5 with status)

Make sure everything works. Bidder should be able to:
1. Login → see dashboard
2. Browse tenders → filter by category → search
3. Click a tender → see full details, addenda, clarifications
4. Ask a clarification question → see it appear (anonymous)
5. Click "Submit Bid" → fill out technical proposal, upload files, enter amount, fill bid security → submit
6. See the bid in "My Bids" with status = Submitted
7. Cannot submit again for the same tender
8. Cannot submit after deadline
```

</details>

---

### STEP 6: Bid Opening & Evaluation System

**What this does**: The core evaluation flow — bid opening by officer, committee assignment, independent technical evaluation by each member, auto-calculated financial evaluation, combined scoring and ranking.

**After this step you have**: The complete two-phase evaluation system where committee members independently score bids, financial scores are auto-calculated, and bids are ranked.

<details>
<summary><strong>PROMPT FOR STEP 6</strong> (click to expand)</summary>

```
I need you to implement the complete Bid Opening and Evaluation system. This is the most complex part of the system.

Read /home/lame/Desktop/tendor-management/PROJECT_SCOPE.md — especially "Evaluation Process (Detailed)", UC-7 through UC-10, and the evaluation example table.

Project is at /home/lame/Desktop/tendor-management/. Auth, Admin, Tender Management, and Bidder Portal are working. Officers can create/publish tenders, bidders can submit bids.

## BACKEND API ENDPOINTS

### Bid Opening — add to `backend/src/routes/bid.routes.ts`

**PATCH /api/tenders/:tenderId/open-bids** — Open bids (PROCUREMENT_OFFICER only)
- Only the tender creator
- Only if tender is PUBLISHED and submission deadline has PASSED
- Must have at least 1 bid submitted
- Update all bids for this tender: status → OPENED
- Set tender status → UNDER_EVALUATION
- Create a bid opening record: save to audit log with details containing JSON of all bids: [{bidderName, bidAmount, bidSecurityProvided, submissionDate, documentCount}]
- Create notification for all bidders who submitted: "Bids for {title} have been opened"
- Audit log: "Opened bids for tender"
- Return the list of opened bids

**GET /api/tenders/:tenderId/bid-opening-record** — Get bid opening record
- Accessible by: tender creator (officer), bidders who submitted a bid for this tender, assigned evaluators
- Return: tender title, opening date, list of bids [{bidderName (org name or full name), bidAmount, bidSecurityStatus, submissionDate, documentCount}]

### Evaluation Committee — add to `backend/src/routes/evaluation.routes.ts`

**POST /api/tenders/:tenderId/committee** — Assign committee (PROCUREMENT_OFFICER only)
- Body: { memberIds: number[] } — array of user IDs with EVALUATOR role
- Only tender creator
- Only if tender status is UNDER_EVALUATION
- Must be at least 3 members
- Validate all IDs are users with role=EVALUATOR and status=ACTIVE
- Create EvaluationCommitteeAssignment entries
- Create notification for each member: "You have been assigned to evaluate: {title}"
- Audit log: "Assigned evaluation committee"

**GET /api/tenders/:tenderId/committee** — Get committee members
- Return list of assigned evaluators with name, email, and whether they've completed evaluation

### Technical Evaluation

**GET /api/tenders/:tenderId/evaluation/technical** — Get bids for technical evaluation (EVALUATOR only)
- Only if assigned to this tender's committee
- Return all OPENED bids with:
  - Bidder name (org name or full name)
  - Technical proposal text
  - Technical documents (file links)
  - Bid security info
  - Do NOT include bidAmount (financial proposal hidden during tech eval)
- Also return: tender's evaluationCriteria (names + weights), minimumTechnicalScore
- Also return: this evaluator's existing scores (if any, so they can see/edit their own incomplete work)
- Do NOT return other evaluators' scores

**POST /api/tenders/:tenderId/evaluation/technical** — Submit technical evaluation (EVALUATOR only)
- Body: { evaluations: [{ bidId, criteriaScores: [{criteriaName, score}], remarks }] }
- Must include scores for ALL bids
- Each criteriaScore.score must be between 0 and the criteria's weight (e.g., if Methodology has weight 30, score must be 0-30)
- Calculate totalScore for each bid (sum of criteria scores)
- Create/update Evaluation entries with evaluationType=TECHNICAL
- Audit log: "Submitted technical evaluation"

**GET /api/tenders/:tenderId/evaluation/technical/status** — Check tech eval completion
- Return: { totalMembers, completedMembers, isComplete, bids: [{bidId, bidderName, evaluatorScores: [{evaluatorName, totalScore}], avgScore, isQualified}] }
- Only show full results if ALL members have submitted
- isComplete = true when all members submitted

**PATCH /api/tenders/:tenderId/evaluation/technical/finalize** — Finalize technical evaluation (PROCUREMENT_OFFICER only)
- Only when isComplete = true (all evaluators submitted)
- For each bid:
  - Calculate avgTechnicalScore = average of all evaluators' totalScores
  - If avgTechnicalScore >= tender.minimumTechnicalScore: isTechnicallyQualified = true, bid status → TECHNICALLY_QUALIFIED
  - Else: isTechnicallyQualified = false, bid status → TECHNICALLY_DISQUALIFIED
  - Create/update EvaluationSummary with avgTechnicalScore, isTechnicallyQualified
- Create notification for all evaluators: "Technical evaluation finalized. Financial evaluation can begin."
- Audit log: "Finalized technical evaluation"

### Financial Evaluation

**GET /api/tenders/:tenderId/evaluation/financial** — Get financial data (EVALUATOR + OFFICER)
- Only after technical evaluation is finalized
- Return only TECHNICALLY_QUALIFIED bids with:
  - Bidder name
  - Bid amount (NOW revealed)
  - Technical score (average)
- Also return: tender's technicalWeight, financialWeight
- System auto-calculates:
  - lowestBidAmount = min of all qualified bids' amounts
  - For each bid: financialScore = (lowestBidAmount / bid.bidAmount) * 100
  - combinedScore = (technicalWeight/100 * avgTechnicalScore) + (financialWeight/100 * financialScore)
  - Rank by combinedScore descending (rank 1 = highest)
- Update EvaluationSummary with avgFinancialScore, combinedScore, rank
- Return the ranked list

**PATCH /api/tenders/:tenderId/evaluation/financial/finalize** — Finalize financial evaluation (PROCUREMENT_OFFICER only)
- Recalculate and save final EvaluationSummary for all qualified bids
- Update all qualified bids' status to EVALUATED
- Audit log: "Finalized financial evaluation"

### Create all controllers and services.

## FRONTEND PAGES

### 1. Update `/officer/tenders/[id]/page.tsx` — Add evaluation management

Add new tabs or sections to the existing tender detail page:

**Bids tab** (new):
- If tender PUBLISHED and deadline passed and bids exist: Show "Open Bids" button
- If bids OPENED: Show bid list table (Bidder, Amount, Bid Security, Submitted, Documents, Status)
- Each bid row: expandable to show technical proposal text + document download links
- "View Bid Opening Record" button

**Evaluation tab** (new):
- Step 1: Committee Assignment
  - If no committee assigned: Show multi-select of available evaluators (EVALUATOR role users) + "Assign Committee" button (min 3)
  - If assigned: Show committee member list with completion status (green check / pending icon)

- Step 2: Technical Evaluation Progress
  - Show progress: "3/3 evaluators completed" or "1/3 evaluators completed"
  - When all complete: Show results table (Bidder | Evaluator 1 Score | Evaluator 2 Score | ... | Average | Qualified?)
  - "Finalize Technical Evaluation" button (enabled when all complete)

- Step 3: Financial Evaluation Results
  - Only visible after technical finalization
  - Show ranked table: Rank | Bidder | Avg Tech Score | Bid Amount | Financial Score | Combined Score
  - Highlight the recommended winner (rank 1) in green
  - "Finalize Financial Evaluation" button

### 2. Create `/evaluator/dashboard/page.tsx` — Evaluator Dashboard
- Page title: "My Evaluations"
- List of assigned tenders as cards:
  - Tender title, category, status
  - Evaluation status: "Pending Technical Evaluation", "Technical Submitted — Awaiting others", "Financial Evaluation Available", "Evaluation Complete"
  - "Evaluate" button

### 3. Create `/evaluator/tenders/[id]/evaluate/page.tsx` — Technical Evaluation Page
- Page title: "Technical Evaluation: {tender title}"
- Show evaluation criteria table at top: Criteria Name | Weight (max score)
- For EACH bid, show a card/section:
  - Bidder name (org or individual)
  - Technical proposal text (collapsible)
  - Document links (download buttons)
  - Scoring form: For each criterion → input field (0 to max weight) with label
  - Total score (auto-calculated, read-only)
  - Remarks textarea
- At bottom: "Submit All Evaluations" button
- Validation: all criteria must be scored for all bids, scores within range
- Confirmation dialog before submit
- After submit: show "Evaluation submitted. Waiting for other committee members."
- If already submitted: show their scores as read-only with a "Submitted" badge

### 4. Financial Evaluation View (part of evaluator tender page)
- After technical is finalized, show financial results:
  - Ranked table: Rank | Bidder | Tech Score | Bid Amount | Financial Score | Combined Score
  - Read-only for evaluators (financial scoring is automatic)
  - Show "Evaluation Complete" status

Make sure everything works end to end:
1. Officer publishes tender → Bidders submit bids → Deadline passes
2. Officer opens bids → sees all bids with amounts
3. Officer assigns 3 evaluators
4. Each evaluator logs in → sees assigned tender → scores all bids on each criterion → submits
5. Officer sees "3/3 complete" → finalizes technical → sees qualified/disqualified bids
6. Financial evaluation auto-calculates → shows ranked results with combined scores
7. Officer finalizes financial evaluation
```

</details>

---

### STEP 7: Award Decision, Results Publication & Debriefing

**What this does**: Officer confirms the winner, publishes results to all bidders, bidders view their scores/ranking, losing bidders request debriefings, officers respond.

**After this step you have**: The complete post-evaluation flow including award, transparent result publication, and debriefing.

<details>
<summary><strong>PROMPT FOR STEP 7</strong> (click to expand)</summary>

```
I need you to implement the Award Decision, Results Publication, and Debriefing system.

Read /home/lame/Desktop/tendor-management/PROJECT_SCOPE.md — especially UC-11 (Award), UC-12 (Publish Results), UC-13 (Debriefing).

Project is at /home/lame/Desktop/tendor-management/. The full evaluation system is working — officers can finalize evaluations with ranked bids.

## BACKEND API ENDPOINTS

### Award — add to `backend/src/routes/evaluation.routes.ts`

**PATCH /api/tenders/:tenderId/award** — Confirm award (PROCUREMENT_OFFICER only)
- Only tender creator
- Only if tender is UNDER_EVALUATION and financial evaluation is finalized (all qualified bids have status=EVALUATED)
- Body: { winningBidId } — must be the rank 1 bid (system recommends, officer confirms)
- Update winning bid: status → SELECTED, isWinner=true in EvaluationSummary
- Update all other bids: status → NOT_SELECTED
- Update tender: status → AWARDED
- Audit log: "Awarded tender"
- Return updated tender

**PATCH /api/tenders/:tenderId/publish-results** — Publish results (PROCUREMENT_OFFICER only)
- Only if tender is AWARDED
- Create notifications:
  - To winning bidder: "Congratulations! Your bid for '{title}' has been selected."
  - To all other bidders who submitted: "The evaluation for '{title}' is complete. Your bid was not selected. You may request a debriefing."
- Audit log: "Published tender results"

**GET /api/tenders/:tenderId/results** — Get results
- If BIDDER: only if tender is AWARDED and results published
  - Return: winner name + amount, own bid's scores (avgTechnicalScore, financialScore, combinedScore, rank), total bids, evaluation criteria used
  - Do NOT show other bidders' individual scores — only their own + winner info
- If OFFICER: full results — all bids with all scores, rankings, evaluator remarks
- If EVALUATOR (assigned): full results for their assigned tender

### Debriefing — `backend/src/routes/debriefing.routes.ts`

**POST /api/bids/:bidId/debriefing** — Request debriefing (BIDDER only)
- Only if the bid belongs to this bidder
- Only if bid status is NOT_SELECTED
- Only one debriefing request per bid
- Create DebriefingRequest
- Create notification for the tender's officer: "Debriefing requested for '{tenderTitle}' by {bidderName}"
- Audit log: "Requested debriefing"

**GET /api/debriefings** — List debriefing requests
- OFFICER: return all debriefing requests for their tenders (with tender title, bidder name, bid info, request date, response status)
- BIDDER: return their own debriefing requests
- Include: tender title, bid amount, bidder name, request date, response text, response date

**PATCH /api/debriefings/:id/respond** — Respond to debriefing (PROCUREMENT_OFFICER only)
- Body: { response }
- Only the tender's officer
- Set respondedBy, respondedDate, response
- Create notification for bidder: "Your debriefing request for '{tenderTitle}' has been answered."
- Audit log: "Responded to debriefing"

### Create all controllers and services.

## FRONTEND UPDATES

### 1. Update `/officer/tenders/[id]/page.tsx` — Add Award section

After financial evaluation is finalized, add:

**Award section** in the Evaluation tab:
- Show the ranked results table one more time
- Highlight rank 1 bid in green
- "Award to Rank #1 Bidder" button (confirm dialog: "Award this tender to {bidderName} for ETB {amount}? This action cannot be undone.")
- After award: show "Tender Awarded" status with winner details
- "Publish Results" button (confirm dialog: "This will notify all bidders of the results.")
- After publishing: show "Results Published" badge

### 2. Update `/bidder/my-bids/page.tsx` — Add results view

When a bid has status SELECTED or NOT_SELECTED:
- Show a results section in the bid detail:
  - **If SELECTED**: Green banner "Your bid has been selected!"
    - Show: Your scores (tech, financial, combined), your rank, tender title
  - **If NOT_SELECTED**: Info banner "Your bid was not selected"
    - Show: Your scores (tech, financial, combined), your rank, winner name + amount
    - "Request Debriefing" button (if no debriefing requested yet)
    - If debriefing requested: show request status
    - If debriefing responded: show the response text

### 3. Create `/officer/debriefings/page.tsx` — Debriefing Management

- Page title: "Debriefing Requests"
- Data table columns: Tender Title, Bidder Name, Bid Amount, Requested Date, Status (Pending/Responded), Actions
- Status: Pending=amber badge, Responded=green badge
- Actions: "Respond" (for pending) → opens dialog with:
  - Read-only info: Bidder name, tender title, bid amount, bidder's scores
  - Response textarea: officer writes explanation of strengths/weaknesses
  - "Send Response" button
- After responding: status changes to Responded

### 4. Update bidder tender detail page — show results after award

On `/bidder/tenders/[id]/page.tsx`, add a **Results tab** (only visible when tender is AWARDED):
- Show: Winner name, winner bid amount
- Show own scores if the bidder submitted a bid
- Show debriefing request status

Make sure the full flow works:
1. Evaluation finalized → Officer sees ranked bids → Awards to rank 1
2. Officer publishes results
3. Winning bidder sees "Selected" on their bid with green banner
4. Losing bidder sees "Not Selected" with their scores → requests debriefing
5. Officer sees debriefing request → writes response
6. Losing bidder sees the debriefing response
```

</details>

---

### STEP 8: Notification System

**What this does**: Complete in-app notification system — bell icon with unread count, dropdown with recent notifications, full notification page, mark as read, all notification triggers wired up.

**After this step you have**: All system events generate proper notifications, and users see them in real time via the header bell icon.

<details>
<summary><strong>PROMPT FOR STEP 8</strong> (click to expand)</summary>

```
I need you to implement the complete in-app Notification System.

Read /home/lame/Desktop/tendor-management/PROJECT_SCOPE.md — especially the "Notification Triggers" table listing ALL events that generate notifications.

Project is at /home/lame/Desktop/tendor-management/. All main features are working. Previous steps already create notifications in the database via service calls. Now we need the frontend to display them.

## BACKEND API ENDPOINTS

### Notification Routes — `backend/src/routes/notification.routes.ts`

**GET /api/notifications** — Get user's notifications
- Authenticated (any role)
- Return notifications for current user, ordered by sentDate desc
- Query params: isRead (optional boolean), page (default 1), limit (default 20)
- Return: { notifications: [...], total, unreadCount }

**GET /api/notifications/unread-count** — Get unread count only
- Return: { count: number }
- This endpoint will be polled frequently so keep it fast

**PATCH /api/notifications/:id/read** — Mark one as read
- Set isRead=true
- Only if notification belongs to current user

**PATCH /api/notifications/read-all** — Mark all as read
- Update all unread notifications for current user to isRead=true

**DELETE /api/notifications/:id** — Delete a notification
- Only if it belongs to current user

### Notification Service — `backend/src/services/notification.service.ts`

Create a centralized notification helper that other services can import:

```typescript
async function createNotification(userId: number, message: string, type: string, entityType?: string, entityId?: number): Promise<void>

async function notifyAllBidders(message: string, type: string, entityType?: string, entityId?: number): Promise<void>

async function notifyTenderBidders(tenderId: number, message: string, type: string): Promise<void>

async function notifyUser(userId: number, message: string, type: string, entityType?: string, entityId?: number): Promise<void>


### Audit all existing service files

Go through ALL existing services and make sure notifications are created for every event in the notification triggers table. Specifically verify these are all working:

1. Tender published → all active bidders
2. Addendum issued → all active bidders
3. Clarification answered → all active bidders
4. New clarification question → tender's officer
5. Bid submitted → bidder + officer
6. Bids opened → all bidders for that tender
7. Committee assigned → assigned evaluators
8. Technical evaluation complete → officer
9. Award made / results published → all bidders for that tender
10. Debriefing requested → officer
11. Debriefing responded → bidder
12. Account activated → bidder
13. Account deactivated → affected user

If any are missing, add them to the existing service functions. Use the centralized notification service.

### Create controller and register routes.

## FRONTEND

### 1. Create `frontend/src/components/layout/NotificationBell.tsx`

- Bell icon (lucide Bell) in the header
- Badge showing unread count (red circle with number, hidden if 0)
- On click: dropdown/popover showing last 5 notifications:
  - Each notification: icon based on type + message text + time ago (using date-fns formatDistanceToNow)
  - Unread ones have a blue dot / slightly different background
  - Click a notification: mark as read + navigate to relevant page based on entityType/entityId:
    - Tender-related → /officer/tenders/{id} or /bidder/tenders/{id}
    - Bid-related → /bidder/my-bids
    - Account-related → no navigation
  - "Mark all as read" link at top
  - "View all notifications" link at bottom → goes to notifications page
- Poll GET /api/notifications/unread-count every 30 seconds to update badge
- Use @tanstack/react-query with refetchInterval for polling

### 2. Update the dashboard Header component
- Replace the notification placeholder with the NotificationBell component
- Should work for all roles

### 3. Create `/bidder/notifications/page.tsx` — Full Notifications Page
- Page title: "Notifications"
- "Mark all as read" button at top
- List of notifications (not a table — a list with cards/items):
  - Icon based on type (megaphone for tender, file for bid, check for award, etc.)
  - Message text
  - Timestamp (formatted: "2 hours ago" or "March 25, 2026")
  - Read/unread visual indicator (blue dot or background shade)
  - Click to navigate + mark as read
  - Delete button (X icon) on hover
- Pagination or "Load more" button
- Empty state: "No notifications yet"

### 4. Add notification page to ALL role sidebars
- Add "Notifications" nav item with unread badge count to the sidebar for all roles (not just bidder)
- Route: /{role}/notifications (or just /notifications — create a shared page)
- Actually, simplify: create ONE notifications page at `/notifications/page.tsx` accessible by all authenticated users, and add it to all sidebars

Make sure everything works:
1. Officer publishes a tender → Bidder sees notification bell badge increment → Click → see notification → Click notification → goes to tender
2. Bidder submits bid → Officer sees notification
3. All existing notification triggers produce visible notifications
4. Mark as read works, mark all works
5. Notification count updates without full page refresh (polling)
```

</details>

---

### STEP 9: Reports & PDF Export

**What this does**: All report types — tender summary, bid evaluation, procurement activity, bidder participation, bid opening record, audit trail. View on screen + export as PDF.

**After this step you have**: Officers and admins can generate all specified reports and export them as PDF documents.

<details>
<summary><strong>PROMPT FOR STEP 9</strong> (click to expand)</summary>

```
I need you to implement the complete Reports system with PDF export.

Read /home/lame/Desktop/tendor-management/PROJECT_SCOPE.md — especially the "Reports" section listing all report types, who generates them, and who can see them.

Project is at /home/lame/Desktop/tendor-management/. All features are working.

## BACKEND API ENDPOINTS

### Report Routes — `backend/src/routes/report.routes.ts`

**GET /api/reports/tender-summary** — Tender Summary Report (PROCUREMENT_OFFICER)
- Query params: status (optional), category (optional), startDate (optional), endDate (optional)
- Return: list of tenders with { title, category, status, publishDate, submissionDeadline, totalBids, winnerName, winnerAmount, createdByName }
- Also return summary stats: { totalTenders, byStatus: {draft, published, underEvaluation, awarded, cancelled}, byCategory: {goods, works, consulting} }

**GET /api/reports/bid-evaluation/:tenderId** — Bid Evaluation Report (PROCUREMENT_OFFICER, EVALUATOR assigned)
- Return comprehensive evaluation data for one tender:
  - Tender info (title, category, dates, criteria)
  - Committee members list
  - For each bid: { bidderName, bidAmount, technicalScores: [{evaluatorName, criteriaScores, totalScore}], avgTechnicalScore, isQualified, financialScore, combinedScore, rank, isWinner, evaluatorRemarks }
  - This is the official evaluation record

**GET /api/reports/procurement-activity** — Procurement Activity Report (PROCUREMENT_OFFICER)
- Query params: startDate (required), endDate (required)
- Return: { period, tendersCreated, tendersPublished, tendersAwarded, tendersCancelled, totalBidsReceived, averageBidsPerTender, tenders: [{title, category, status, bidsCount, awardedTo, awardAmount}] }

**GET /api/reports/bidder-participation** — Bidder Participation Report (PROCUREMENT_OFFICER)
- Query params: startDate (optional), endDate (optional), tenderId (optional)
- Return: { bidders: [{bidderName, bidderType, totalBids, wonBids, tenders: [{tenderTitle, bidAmount, status}]}] }

**GET /api/reports/bid-opening/:tenderId** — Bid Opening Record (any authenticated user who has access to the tender)
- Return: { tenderTitle, openingDate, totalBids, bids: [{bidderName, bidAmount, bidSecurityProvided, submissionDate, documentCount}] }

**GET /api/reports/audit-trail** — Audit Trail Report (ADMIN only)
- Query params: startDate, endDate, userId (optional), action (optional)
- Return: { logs: [{timestamp, userName, action, entityType, entityId, details, ipAddress}], total }

### Create controller and service files.

## FRONTEND

### 1. Create `/officer/reports/page.tsx` — Reports Page

- Page title: "Reports"
- Report type selector cards (grid of 4 cards):

  **Tender Summary Report** card:
  - Icon: FileText
  - Click → opens filter panel: Status dropdown, Category dropdown, Date range picker
  - "Generate Report" button
  - Results shown below in a data table
  - Summary stats shown above the table as stat cards
  - "Export PDF" button

  **Bid Evaluation Report** card:
  - Icon: ClipboardCheck
  - Click → opens tender selector (dropdown of awarded tenders)
  - "Generate Report" button
  - Results: Full evaluation details — criteria table, per-bid scores from each evaluator, averages, ranking
  - "Export PDF" button

  **Procurement Activity Report** card:
  - Icon: BarChart
  - Click → opens date range picker (required)
  - "Generate Report" button
  - Results: Summary stats + activity table
  - "Export PDF" button

  **Bidder Participation Report** card:
  - Icon: Users
  - Click → opens filters: Date range, specific tender (optional)
  - "Generate Report" button
  - Results: Bidder table with participation details
  - "Export PDF" button

### 2. PDF Export — implement using jspdf + jspdf-autotable

Create a utility file `frontend/src/lib/pdf-export.ts` with functions:

```typescript
exportTenderSummaryPDF(data, filters)
exportBidEvaluationPDF(data)
exportProcurementActivityPDF(data, dateRange)
exportBidderParticipationPDF(data)
exportBidOpeningRecordPDF(data)
exportAuditTrailPDF(data)
```

Each function should:
- Create a new jsPDF document (A4, portrait)
- Add header: "Online Tender Management System" + report title + generation date
- Add filter/parameter info (date range, tender name, etc.)
- Add the data as formatted tables using jspdf-autotable
- For Bid Evaluation: include criteria breakdown table + summary ranking table
- Add page numbers in footer
- Download the PDF with a descriptive filename like "Tender_Summary_Report_2026-03-29.pdf"

### 3. Add Bid Opening Record access

On the officer's tender detail page (bids tab): Add "Download Bid Opening Record" button that generates the PDF.

On the bidder's tender detail page (after bids opened): Add "View Bid Opening Record" link that opens a dialog/page showing the record, with "Download PDF" button.

### 4. Update `/admin/audit-logs/page.tsx` — Add export

- Add "Export PDF" button that calls exportAuditTrailPDF with current filters
- Add date range filter if not already present

Make sure everything works:
1. Officer → Reports → Generate each report type with different filters
2. Export each as PDF → verify PDF has proper formatting, headers, tables
3. Bid Evaluation Report shows the complete evaluation breakdown per evaluator
4. Bid Opening Record is accessible by both officers and bidders
5. Admin can export audit logs as PDF
```

</details>
```
---

### STEP 10: Polish, Integration & Final Touches

**What this does**: Wire everything together — auto-close expired tenders, complete the monitoring dashboard, ensure all audit logs are captured, handle edge cases, add loading/error states everywhere, and make the UI polished.

**After this step you have**: A complete, production-ready Online Tender Management System matching the full PROJECT_SCOPE.md spec.

<details>
<summary><strong>PROMPT FOR STEP 10</strong> (click to expand)</summary>

```
I need you to finalize and polish the Online Tender Management System. This is the last step — everything should be complete and working end to end after this.

Read /home/lame/Desktop/tendor-management/PROJECT_SCOPE.md and verify every single requirement is implemented.

Project is at /home/lame/Desktop/tendor-management/. All major features are built. Now I need you to:

## 1. AUTO-CLOSE EXPIRED TENDERS

Create a utility function (called on relevant API requests, not a cron job) that checks for published tenders whose submissionDeadline has passed and have not been opened yet. These should be handled gracefully:
- On every GET /api/tenders request, check if any PUBLISHED tenders have expired deadlines
- Don't auto-change status — but include an "isExpired" computed field in the response so the UI can show "Deadline Passed - Awaiting Bid Opening" badge
- On the officer's tender list, show a warning badge for tenders where deadline passed but bids haven't been opened

## 2. COMPLETE THE ADMIN MONITORING DASHBOARD

Update `/admin/monitoring/page.tsx` with real data from GET /api/admin/stats:
- Total Users card with role breakdown (pie chart or just numbers)
- Pending Accounts card with count + "Review" link
- Tenders by Status card with status breakdown
- Total Bids card
- Recent Activity table (last 20 actions from audit log)
- Make sure the stats endpoint returns all necessary data

## 3. AUDIT EVERY ACTION

Review ALL controllers/services and verify these actions create audit logs:
- User registration, login, logout
- Account activation/deactivation
- Role changes
- Tender create, update, publish, cancel
- Addendum issued
- Clarification asked, answered
- Bid submitted
- Bids opened
- Committee assigned
- Technical evaluation submitted
- Technical evaluation finalized
- Financial evaluation finalized
- Award confirmed
- Results published
- Debriefing requested, responded
- Report generated

If any are missing, add the audit log calls now.

## 4. FIX EDGE CASES AND VALIDATION

- Verify a bidder CANNOT access officer/admin/evaluator pages (redirect)
- Verify an officer CANNOT access admin pages
- Verify an evaluator CANNOT see bids for tenders they're not assigned to
- Verify financial proposals are truly hidden during technical evaluation (API must not return bidAmount in technical evaluation endpoint)
- Verify a bidder cannot submit a bid after the deadline (both frontend and backend check)
- Verify a tender cannot be published if clarificationDeadline >= submissionDeadline
- Verify evaluation criteria weights sum to exactly 100
- Verify technicalWeight + financialWeight = 100
- Verify minimum 3 committee members enforced
- Verify duplicate bid prevention (unique constraint + API check)
- Test: What happens when there's only 1 bid? Should still work through the full evaluation flow.
- Test: What happens when all bids are technically disqualified? The tender should still be able to be cancelled/closed.

## 5. UI POLISH

### Loading states:
- Add skeleton loaders on all pages while data is loading (use shadcn Skeleton component)
- Add loading spinners on all form submit buttons while requests are in flight
- Disable buttons during API calls to prevent double-clicks

### Error states:
- Add error boundaries or error messages when API calls fail
- Show meaningful error messages from the backend (not raw error objects)
- 404 page for invalid routes

### Empty states:
- Every list/table should have a proper empty state with icon + message + action button:
  - No tenders: "No tenders found. Create your first tender." (for officer)
  - No bids: "No bids submitted yet."
  - No notifications: "You're all caught up!"
  - No evaluations: "No evaluations assigned to you."

### Responsive design:
- Sidebar should be collapsible on smaller screens (sheet/drawer)
- Tables should be scrollable horizontally on mobile
- Forms should stack properly on mobile
- Cards should adjust grid layout

### Confirm dialogs for all irreversible actions:
- Publish tender
- Cancel tender
- Submit bid
- Submit evaluation
- Award tender
- Publish results

### Toast notifications:
- Success toast on every successful action
- Error toast on every failed action
- Use sonner (already installed via shadcn)

## 6. ROLE-BASED DASHBOARD REDIRECTS

- `/` → redirect to role-appropriate dashboard
- `/admin` → redirect to `/admin/monitoring`
- `/officer` → redirect to `/officer/dashboard`
- `/evaluator` → redirect to `/evaluator/dashboard`
- `/bidder` → redirect to `/bidder/tenders`
- Any unauthorized route → redirect to correct dashboard
- Not logged in → redirect to `/login`

## 7. VERIFY THE COMPLETE FLOW

Walk through the entire system and fix anything broken:

**Flow 1: Full tender lifecycle**
1. Admin creates procurement officer + 3 evaluators + activates a bidder
2. Officer creates tender with 4 criteria (sum=100), tech weight 80%, financial 20%, min score 70
3. Officer publishes tender
4. Bidder sees tender, asks clarification
5. Officer answers clarification
6. Bidder submits bid with documents
7. Deadline passes → Officer opens bids
8. Officer assigns 3 evaluators
9. Each evaluator scores the bid
10. Officer finalizes technical → bid qualified
11. Financial scores calculated
12. Officer finalizes financial → Officer awards → publishes results
13. Bidder sees result

**Flow 2: Multiple bidders with disqualification**
1. 4 bidders submit bids
2. After technical evaluation, 1 is disqualified (below 70)
3. Only 3 proceed to financial
4. Ranking calculated, winner selected

**Flow 3: Debriefing**
1. Losing bidder requests debriefing
2. Officer responds
3. Bidder sees response

Fix any issues found during this verification.

## 8. FINAL SEED DATA UPDATE

Update the seed script to include realistic test data:
- 1 admin account
- 2 procurement officers
- 4 evaluator accounts
- 5 bidder accounts (3 organizations, 2 individuals) — all ACTIVE
- 2 sample tenders (1 published with bids, 1 draft)
- Sample bids on the published tender

Make sure `npm run seed` resets and recreates all test data.

After all this, the system should be 100% complete per PROJECT_SCOPE.md. Every use case, every validation rule, every notification trigger, every access control entry should be working.
```

</details>

---

## Step Dependency Map

```
Step 1 (Setup + DB)
  └── Step 2 (Auth)
       ├── Step 3 (Admin)
       ├── Step 4 (Tender Mgmt)
       │    └── Step 5 (Bidder Portal)
       │         └── Step 6 (Evaluation)
       │              └── Step 7 (Award + Debriefing)
       ├── Step 8 (Notifications) — can start after Step 2, but wires into Steps 3-7
       ├── Step 9 (Reports) — needs Steps 3-7 complete
       └── Step 10 (Polish) — needs everything complete
```

## Execution Order

| Order | Step | What It Delivers |
|-------|------|-----------------|
| 1st | Step 1 | Running project skeleton + database |
| 2nd | Step 2 | Auth working, login/register, protected routes |
| 3rd | Step 3 | Admin can manage users |
| 4th | Step 4 | Officers can create/publish tenders |
| 5th | Step 5 | Bidders can browse and submit bids |
| 6th | Step 6 | Full evaluation system |
| 7th | Step 7 | Award and debriefing |
| 8th | Step 8 | All notifications visible |
| 9th | Step 9 | Reports with PDF export |
| 10th | Step 10 | Everything polished and verified |
