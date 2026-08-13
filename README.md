# 5tarResult

Jobs + Exams + Study Material + Quiz/Mock Tests platform built with Next.js and Supabase.

## Run locally / Codespaces

```bash
npm install
npm run dev
```

Then open the development URL shown by Next.js.

## Supabase

Create `.env.local` from `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

Do not put the Supabase secret key in frontend code.

## Deploy

Push the repository to GitHub and import the repository into Vercel. Add the same two environment variables in Vercel Project Settings → Environment Variables.
