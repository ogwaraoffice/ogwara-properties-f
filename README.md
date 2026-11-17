
# Ogwara Properties

A mobile-first property discovery website for homes, land, rentals and short lets in Benin City, Edo State. Brand colors follow the Ogwara navy and teal identity.

## Technology

- React + Vite + Tailwind CSS
- Supabase Auth for real customer accounts
- Supabase Postgres for property listings and profiles
- Supabase Storage for property photos
- Cloudflare Pages deployment

## Important launch status

This repository is a launch foundation, not a live production service yet. Do not publish it until the Supabase setup below is complete, the administrator account is verified, the website domain is confirmed, and real property records/photos have been added and checked. No sample properties are displayed.

## 1. Create and configure Supabase

1. Create a Supabase project at https://supabase.com/.
2. Open SQL Editor and run the complete `supabase/schema.sql` file.
3. In Storage, create a **public** bucket named `property-images`.
4. In Project Settings → API, copy the Project URL and the anon/public key.
5. Copy `.env.example` to `.env.local` and fill in:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Never put a Supabase `service_role` key in this website or any `VITE_` variable.

## 2. Create the administrator

1. Start the site and sign up using **ogwaraoffice@gmail.com**.
2. Verify the email using the confirmation message from Supabase.
3. In Supabase SQL Editor, run this once:

```sql
update public.profiles p
set role = 'admin'
from auth.users u
where p.id = u.id
  and u.email = 'ogwaraoffice@gmail.com';
```

4. Sign out and sign in again. The Admin button should appear. Customer registrations are always assigned the `customer` role; users cannot grant themselves admin access.

## 3. Run locally

```bash
npm install
npm run dev
```

To test a production build:

```bash
npm run build
npm run preview
```

## 4. Cloudflare Pages

- Connect the GitHub repository to Cloudflare Pages.
- Build command: `npm run build`
- Build output directory: `dist`
- Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` under Pages → Settings → Environment variables for both Preview and Production.
- Redeploy after setting environment variables.
- Add the final custom domain and update canonical URL and sitemap to that domain before launch.

## Contact details

- Admin email: ogwaraoffice@gmail.com
- WhatsApp: +234 702 613 5346
- Calls: 0704 667 2738

## Property publishing rules

- Only the admin account can create property records or upload property photos.
- Customers can browse without signing in; they can create an account to use account features.
- Public visitors can only read listings marked `published = true`.
- Only mark a listing verified after actual checks have been completed.
- Never invent property details, prices, photos, ownership, availability or verification status.

## SEO before launch

The project includes a descriptive page title, meta description, Open Graph metadata, robots.txt and a sitemap starter. Strong Google visibility also depends on the final domain, crawlable property detail pages, unique accurate descriptions, fast image delivery, internal links, local business details, Google Search Console submission and ongoing useful content. Search ranking cannot be guaranteed.

## Brand assets

- `public/ogwara-properties-logo.png` — Ogwara Properties navy/teal logo concept.
