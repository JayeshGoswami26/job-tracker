# Job Tracker

A modern full-stack Job Application Tracker built with **Next.js 16** (App Router), **React 19**, **TypeScript**, and **MongoDB Atlas**.

## Features

- **Application Queue & Follow-up Tracking:** Automatically tracks application statuses and alerts you when follow-ups are due or overdue.
- **Dynamic Ledger:** Full search and filtering by company, role, source, and status with responsive table-to-card mobile view.
- **Full-Stack Next.js:** Route handlers and data access layer operating directly inside Next.js with connection pooling for MongoDB Atlas.
- **Zero Native Dependencies:** Uses pure JavaScript/TypeScript driver (`mongodb`) for portability across platforms.

## Getting Started

### 1. Configure Environment Variables

Copy `.env.example` to `.env.local` and add your MongoDB Atlas connection string:

```bash
cp .env.example .env.local
```

Inside `.env.local`:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/job-tracker?retryWrites=true&w=majority
MONGODB_DB=job-tracker
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Tech Stack

- **Framework:** Next.js 16 (Turbopack, App Router)
- **UI:** React 19, Vanilla CSS Design System with light/dark theme support
- **Database:** MongoDB Atlas via official `mongodb` driver
- **Typography:** Inter & IBM Plex Mono via `next/font/google`

## Phase 1: private owner access

Website login uses Auth0 with the Google connection. All existing records belong to the one configured owner; this phase does not add multi-user tenancy or MCP bearer-token support.

### Local setup

1. Use Node.js 20 LTS or a newer supported LTS and run npm install.
2. Preserve MongoDB settings in .env.local and add the Auth0 variables documented in .env.example. Copy the client ID and secret from Auth0's **Job Tracker Web** Regular Web Application, not the downloaded Google client JSON.
3. Generate AUTH0_SECRET using the command in .env.example. Set AUTH0_OWNER_SUB to the exact Google user's Sub from the Auth0 connection test (or User Management → Users). There is no first-login owner registration.
4. Set APP_BASE_URL to http://localhost:3000 with no trailing slash. Register http://localhost:3000/auth/callback as an Allowed Callback URL and http://localhost:3000 as an Allowed Logout URL in Auth0.
5. Enable google-oauth2 for Job Tracker Web and run npm run dev. Sign in using the owner Google account.

### Vercel deployment

- Add all six Auth0 variables from .env.example to the Vercel production environment, keeping secrets private. Set APP_BASE_URL to https://job-trackersss.vercel.app and generate a different AUTH0_SECRET for production.
- Register https://job-trackersss.vercel.app/auth/callback and https://job-trackersss.vercel.app as callback and logout URLs respectively.
- Deploy only after setting the variables. Missing or invalid configuration denies requests with HTTP 503; there is no development bypass. Preview deployments need their own exact base URL, registered callbacks, and environment configuration.
- In a private browser window, verify that the homepage offers login and GET /api/applications returns JSON 401. Verify owner login, listing, create, edit, import, delete, and logout. Test mutations with disposable records. A different Google account must receive 403 from API routes and see an access-denied screen.
- Browser writes require an Origin header exactly matching APP_BASE_URL. Curl writes must supply that origin and a valid owner session cookie. Missing, null, or foreign origins are rejected.
- Private pages and API responses use no-store. The browser access-token endpoint is disabled. Sessions use SDK-encrypted HttpOnly cookies. Existing MongoDB records and DNS workarounds remain intact.

### Validation

Run npm run test:auth, npm run lint, npx tsc --noEmit, and npm run build. If the local Turbopack CSS worker fails, npx next build --webpack provides an alternate production-build check.

Phase 2 will implement the MCP endpoint, bearer-token validation, OAuth discovery, and client authorization. Current Auth0 API registration alone does not expose MCP tools.
