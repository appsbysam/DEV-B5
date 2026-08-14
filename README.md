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


## Version 2 — imported business data

This version preloads source data extracted from:

- Daily 14--8.docx
- maher firass 2026 (1).docx

Imported records:
- Own fleet: 110
- External/partner vehicles: 71
- Raw booking entries preserved for migration review: 277

Important: the source files contain mixed/ambiguous date formats and operational notes. These dates have **not** been silently normalised. They remain preserved in `imported-data.js` for the next migration-review stage.

The source files did not provide a reliable daily rate for each vehicle, so imported records deliberately show **Rate not loaded** instead of invented prices.


## dev-B5 Supabase connection

This package already contains the current development Supabase connection in `supabase.js`.

Project URL:
`https://hckccqvtxweulskcqhcn.supabase.co`

The publishable key is already inserted.

Run `schema.sql` in the Supabase SQL Editor before using live database tables.

Then review and run `seed-imported-catalogue.sql` to load the imported vehicle catalogue and supplier records.


## V3 — Live Supabase + responsive lock

This update:
- Makes Supabase the primary live data source for vehicles, suppliers, customers, locations, rental agreements and rental segments.
- Adds live Supabase inserts for new vehicles, customers and rental agreements/segments.
- Keeps imported data only as an offline/fallback display source.
- Adds `Any` to both Pickup Location and Drop-off Location in Availability filters.
- Locks the viewport for mobile use: no pinch-to-zoom, no browser input zoom, and no horizontal page expansion.
- Converts normal data tables to stacked mobile cards so they fit the screen without sideways page scrolling.
- Keeps the fleet timeline internally scrollable because a multi-day timeline cannot be meaningfully compressed into a phone width.

Note: live writes require the Supabase tables to permit the publishable key to access them. If Row Level Security is enabled, appropriate policies must exist.


## V4 — Supplier data cleanup

This update safely canonicalises only the supplier aliases confirmed by the business:

- BOSS / BoSS / Boss → **Boss**
- Jonny / jonny / Johnny → **Jonny**
- Mekano / mekano / Mikano → **Mekano**
- Halal case variants → **Halal**

Run `normalize-suppliers.sql` once in the Supabase SQL Editor after deploying this code update.

The migration reassigns all linked vehicle records to the canonical supplier ID before deleting duplicate supplier rows. It does not merge other similar-looking supplier names such as Majid/Majeed or Nada/nada because those were not explicitly approved for merging.

`imported-data.js` and `seed-imported-catalogue.sql` have also been normalised so the same duplicates are not recreated in fallback data or a future clean database build.
