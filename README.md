# NEMU Link Bio

A responsive link-in-bio builder with a public landing page, waitlist,
admin-only dashboard, shareable profiles, QR codes, and email capture.

Production: <https://linkbio.nemu-ai.com>

## Stack

- Next.js 16 on Vercel
- Supabase Auth for the admin email/password session
- Supabase Postgres for profiles and waitlist submissions
- Vercel Marketplace integration for environment variables

The application is deployed natively on Vercel and does not proxy requests to
another host.

## Local development

```bash
npm install
vercel link --project linkbio
vercel env pull .env.local
npm run db:migrate
npm run dev
```

Copy `.env.example` when running without Vercel CLI. Never commit `.env.local`
or a service-role key.

## Admin account

The dashboard only permits the email in `ADMIN_EMAIL`. To create or reset that
Supabase Auth user, set a temporary `ADMIN_INITIAL_PASSWORD` in `.env.local`
and run:

```bash
npm run admin:provision
```

Remove `ADMIN_INITIAL_PASSWORD` from the local file after provisioning. The
password is stored by Supabase Auth, not by the application database.

## Database

The schema lives in:

`supabase/migrations/20260726000000_initial_schema.sql`

Apply it with:

```bash
npm run db:migrate
```

Both tables have row-level security enabled. Browser clients have no direct
table policy; the Next.js server routes use the service-role key.

## Useful commands

- `npm run dev` — start the Next.js development server
- `npm run build` — create the production `.next` build
- `npm test` — run the production build verification
- `npm run db:migrate` — apply the Supabase schema
- `npm run admin:provision` — create or reset the one allowed admin user
