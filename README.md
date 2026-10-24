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
