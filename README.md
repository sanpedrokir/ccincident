# CC Incident Management System

Internal web application for Customer Care (CC) engineers to record, track, and analyse VVIP incidents.

---

## Features

| Feature | Description |
|---------|-------------|
| **Incident Form** | Record VVIP incidents with full detail, urgency flag, and auto SLA calculation |
| **Incidents Table** | Browse all incidents with filters by month, agency, urgency, and SLA status |
| **Monthly Report** | AI-generated management summary with top incident types and SLA analysis |
| **Urgent Email Alert** | Automatic email to team when an urgent incident is submitted |
| **Daily Cron Report** | Auto email at 10pm SGT for MOF/MOM incidents each day |

---

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4**
- **Supabase** (PostgreSQL database)
- **Resend** (transactional email)
- **OpenAI GPT-4o-mini** (AI summary, with rule-based fallback if key not set)

---

## Setup Instructions

### 1. Clone / Open Project

```bash
cd pccs-app
npm install
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once created, open the **SQL Editor** in the Supabase dashboard
3. Copy and run the contents of `supabase/migrations/001_create_incidents.sql`
4. Verify the `incidents` table appears in **Table Editor**

### 3. Get Supabase Credentials

From your Supabase project -> **Settings -> API**:

| Variable | Where to find it |
|----------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL (e.g. `https://abcxyz.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` / `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` key (keep secret) |

### 4. Set Up Resend (Email)

1. Create a free account at [resend.com](https://resend.com)
2. Go to **API Keys** and create a new key
3. For a verified sender domain: verify your domain under **Domains**
4. For testing without a verified domain, use `onboarding@resend.dev` as `EMAIL_FROM`

| Variable | Value |
|----------|-------|
| `EMAIL_API_KEY` | Your Resend API key (starts with `re_`) |
| `EMAIL_FROM` | `CC System <you@yourdomain.com>` or `onboarding@resend.dev` for testing |

### 5. Set Up OpenAI (Optional)

1. Get an API key from [platform.openai.com/api-keys](https://platform.openai.com)
2. Set `OPENAI_API_KEY` in your `.env.local`

If `OPENAI_API_KEY` is not set, the system automatically uses a smart rule-based summary instead. The app works fully without OpenAI.

### 6. Create Environment File

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

EMAIL_API_KEY=re_your_resend_key
EMAIL_FROM=CC System <onboarding@resend.dev>

OPENAI_API_KEY=sk-your-openai-key

CRON_SECRET=your-random-secret-string
```

### 7. Run Locally

```bash
npm run dev
```

Open http://localhost:3000 and you will be redirected to `/submit`.

---

## Pages

| URL | Description |
|-----|-------------|
| `/submit` | Incident entry form |
| `/incidents` | Incident table with filters |
| `/report` | Monthly AI report |

---

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/incidents` | Create a new incident (triggers urgent email if needed) |
| `GET` | `/api/incidents` | Fetch incidents (query params: `month`, `year`, `agency`, `urgency`, `sla_met`) |
| `GET` | `/api/monthly-report?month=5&year=2026` | Generate monthly report with AI summary |
| `GET` | `/api/daily-report` | Daily cron endpoint - sends MOF/MOM report emails |

---

## Daily Report Cron Job (10pm SGT)

The daily report runs automatically when deployed to **Vercel**. The `vercel.json` file configures:

```
Schedule: 0 14 * * *  (14:00 UTC = 22:00 SGT)
```

The endpoint is protected by `CRON_SECRET`. For manual testing:

```bash
curl -H "Authorization: Bearer your-cron-secret" http://localhost:3000/api/daily-report
```

---

## SLA Logic

- **SLA Met = Yes** when resolution is within 24 hours of incident start
- **SLA Met = No** when resolution takes more than 24 hours
- All date/times are treated as Singapore Time (SGT, UTC+8)

---

## Deploying to Vercel

1. Push the `pccs-app` folder to a GitHub repository
2. Import at vercel.com/new
3. Add all environment variables from `.env.local` in the Vercel dashboard
4. Deploy - cron jobs activate automatically on Vercel Pro/Enterprise plans

---

## Database Schema

Table: `incidents`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key, auto-generated |
| vvip_name | text | Required |
| vvip_agency_name | text | Required |
| engineer_name | text | Required |
| incident_type | text | Required |
| incident_detail | text | Required |
| urgency | boolean | Default: false |
| incident_date | date | Required |
| time_of_call | time | Required |
| resolution_completion_date | date | Required |
| resolution_completion_time | time | Required |
| form_entry_date | date | Auto: today SGT |
| incident_start_datetime | timestamptz | Computed by API |
| resolution_completion_datetime | timestamptz | Computed by API |
| sla_met | text | 'Yes' or 'No', computed by API |
| created_at | timestamptz | Auto |
| updated_at | timestamptz | Auto-updated by trigger |
