## Campus Connect

Campus Connect is a Next.js + Supabase app for:

- Student attendance via **QR scan**
- Faculty attendance sessions via **QR generation**
- Student ↔ faculty **appointment requests**

## Getting Started

### 1) Install dependencies

From `campus-connect/`:

```bash
npm install
```

### 2) Configure environment variables

Create a `.env.local` file in `campus-connect/`:

```bash
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Optional (demo helpers)
NEXT_PUBLIC_MOCK_COURSE_ID=...
NEXT_PUBLIC_SCAN_FALLBACK_SESSION_ID=...
```

### 3) Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Supabase schema / functions

This repo includes:

- Database schema + RLS policies: `supabase/migrations/*`
- Edge function used for QR attendance marking: `supabase/functions/mark-attendance`

### App routes

- `/login`: sign in
- `/register`: sign up (creates a profile row via DB trigger)
- `/student/dashboard`: view attendance history
- `/student/scan`: scan attendance QR
- `/student/appointments`: request appointments
- `/faculty/dashboard`: create attendance session QR (demo course id)
- `/faculty/appointments`: review appointment requests

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
