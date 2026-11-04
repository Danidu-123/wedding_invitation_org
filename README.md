# Thinidu & Chenaji — Wedding Invitation

Next.js 15 · TypeScript · Tailwind v4 · Framer Motion · Supabase · Vercel

## Deploy (one time)

The Vercel project `thinidu-chenaji-wedding` and its env vars already exist.

```bash
npm install
npx vercel link --yes --project thinidu-chenaji-wedding   # pick "atdeshan's projects"
npx vercel --prod
```

Your link: https://thinidu-chenaji-wedding.vercel.app (Vercel may append a suffix if taken — check the CLI output).

## Local dev

```bash
cp .env.example .env.local   # values are public (URL + publishable key)
npm run dev
```

## Structure

```
src/app/page.tsx              Public invitation
src/app/i/[code]/page.tsx     Personal invitation ("Dear <name>", RSVP linked to guest)
src/app/api/rsvp/route.ts     RSVP endpoint → submit_rsvp() RPC
src/app/admin/                Login + dashboard (protected by middleware + RLS)
src/components/invite/        Gate, PhotoGrid, Details, Location, Rsvp
src/components/admin/         Dashboard, GuestDialog
src/lib/config.ts             All wedding details — edit here
supabase/schema.sql           Database schema (already applied)
public/photos/1-6.jpg         Photos in display order
public/music/wedding.mp3      Background music
```

## Security model

- `guests` table: RLS — only emails in `admin_emails` can read/write.
- Guests never touch the table directly; they call `get_invite` (returns only their name) and `submit_rsvp` (validates, normalises phone, enforces the 20 Nov 2026 deadline).
- Add another admin: create the user in Supabase → Authentication → Users → Add user (auto-confirm), then
  `insert into admin_emails values ('their@email.com');`

## Recommended Supabase settings

- Authentication → Sign In / Providers → turn **off** "Allow new users to sign up".
- Authentication → enable leaked password protection.

## Changing the RSVP deadline

Update both `rsvpDeadline` in `src/lib/config.ts` and `v_deadline` in the `submit_rsvp` function.
