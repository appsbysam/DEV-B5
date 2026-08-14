# All Season Car Rental — GitHub + Supabase Starter

This is a first working foundation for the All Season Car Rental management web app.

## What is already included

- Modern responsive interface using the supplied temporary logo
- Dashboard
- Today view
- Availability search
- Rental list
- Fleet timeline/calendar
- Fleet board
- Customers
- Suppliers / external vehicle sources
- Locations & fees
- Demo data
- Basic local add-vehicle / add-customer / add-rental actions
- Booking overlap checking
- Indicative rental calculation in availability search
- Pickup and drop-off fee calculation
- Supabase-ready database schema
- Browser localStorage persistence while in demo mode

## Important

The initial build deliberately runs in **Demo / Local Mode** even before Supabase is connected. This makes it easy to upload to GitHub Pages and demonstrate immediately.

When Supabase is connected, the next development stage should replace the local demo data layer with real Supabase CRUD operations.

## GitHub Pages deployment

1. Create a new GitHub repository, e.g. `all-season-car-rental`.
2. Upload all files from this package to the repository root.
3. In GitHub:
   - Settings
   - Pages
   - Build and deployment
   - Deploy from branch
   - Select `main` / root
4. Wait for GitHub Pages to publish the site.

## Supabase setup

1. Create a new Supabase project.
2. Open the Supabase SQL Editor.
3. Paste and run `schema.sql`.
4. Open `supabase.js`.
5. Replace:

   `YOUR_SUPABASE_URL`

   and:

   `YOUR_SUPABASE_ANON_KEY`

   with the values from Supabase Project Settings → API.

## Files

- `index.html` — application shell
- `app.css` — responsive styling
- `app.js` — application logic and demo data
- `supabase.js` — Supabase connection settings
- `schema.sql` — database foundation
- `assets/logo.png` — current temporary logo

## Recommended next build stage

After the visual layout is reviewed, the next stage should be:

1. Connect all screens to Supabase.
2. Add authentication.
3. Add full rental-agreement + rental-segment workflow.
4. Add extension/swap/upgrade handling.
5. Add payments and bond tracking.
6. Add proper location-fee overrides.
7. Add customer history.
8. Add Excel/Word migration tooling.
