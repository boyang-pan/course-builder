# Course Builder — Setup Guide

## Prerequisites
- Node.js 18+
- Supabase project (for Postgres)
- Clerk account (for auth)
- Anthropic or OpenAI API key

## 1. Environment Variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

Required services:
- **Supabase**: `DATABASE_URL` and `DIRECT_URL` from Project Settings → Database
- **Clerk**: Keys from Clerk Dashboard → API Keys
- **AI**: Either `ANTHROPIC_API_KEY` (default) or `OPENAI_API_KEY`

## 2. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push schema to your Supabase database
npx prisma db push
```

## 3. Clerk Webhook

In Clerk Dashboard → Webhooks, create a webhook pointing to:
```
https://your-domain.com/api/webhooks/clerk
```

Subscribe to events: `user.created`, `user.updated`, `user.deleted`

Copy the signing secret to `CLERK_WEBHOOK_SECRET`.

## 4. Development

```bash
npm run dev
```

## 5. Deploy to Vercel

```bash
npx vercel
```

Add all environment variables in Vercel Dashboard → Settings → Environment Variables.

## Architecture

- **Left panel**: Chat interface — describe topics, receive status updates
- **Right panel**: Workspace — outline view, chapter reader, exercise grader
- **AI Flow**: User types topic → POST `/api/courses` → outline generated → course saved
- **Chapter flow**: Click chapter → POST `/api/courses/[id]/chapters` → streams content → saves chapter + exercises
- **Exercise flow**: Submit answer → POST `.../submissions` → AI grades → PASS/FAIL feedback

## Switching AI Providers

Set `AI_PROVIDER=openai` in `.env.local` and provide `OPENAI_API_KEY`.
