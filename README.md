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


## V5 — Authentication

The public app package no longer includes imported business data or one-off SQL files.

The frontend now requires a valid Supabase Auth email/password session before the operational interface loads.

Important: after deploying V5, update Supabase RLS policies so operational tables are readable/writable by `authenticated` users rather than `anon`. Keep the SQL migration itself in your local `_private/sql/` folder rather than committing it to GitHub.


## V5.1 — Session refresh fix

Authentication startup now waits for/restores the persisted Supabase session before live operational data is loaded. The app also reloads live data after token refresh events. Desktop header displays version `v5.1` beneath the signed-in user.


## V6.0 — Core rental demo

This build is intended to be customer-demo capable. It adds the main operational workflow in one package:

1. New bookings/rentals
2. Availability and overlap checking
3. Similar/alternative vehicle suggestions
4. Indicative pricing and deposits/bonds
5. Extensions and vehicle swaps/upgrades
6. Improved dashboard/calendar/fleet views

The app uses the existing Supabase tables already created in the project. No SQL migration file is included in the public package.

Important: imported vehicle records that do not yet have a daily rate will display `Rate not loaded`; staff can update those rates later.


## v0.6.2 — Validation / demo refinement

This release starts the pre-1.0 versioning convention. The app is now shown as `v0.6.2`.

New Rental validates all required fields together. Missing fields receive a red border and inline error message, and the warning clears automatically as the user fixes each field.

No database changes are required.


## v0.6.3 — Mobile modal fix

The New Rental / Booking dialog is now constrained to the mobile viewport. The form uses a single-column layout on phones and scrolls vertically inside the modal without horizontal page or dialog movement.

No database changes are required.


## v0.7.0 — Manager mode, versioning and audit history

Version metadata now lives in `version.js`. Each new deployment can show a one-time What's New popup, and the version number in the header can reopen the release notes.

Manager-only functionality is controlled through `staff_profiles.role`. Normal Staff users do not see the Manager Mode navigation item.

The companion private SQL creates:
- `staff_profiles`
- `audit_log`
- role helper/RLS policies
- profile backfill for existing Supabase Auth users
- database audit triggers for major operational tables

Keep the SQL file in `_private/sql/`; it is intentionally not included in the public repository ZIP.


## v0.7.1 — Manager UI / profile refinement

Manager Mode is now a compact drill-down dashboard rather than an always-expanded report. Desktop managers get a header shortcut and mobile managers retain the navigation-menu entry.

The signed-in user's name is clickable and opens a My Profile panel inspired by the 171 Timesheet profile design, including role, status, device type, user ID and a persistent local device ID.

Audit records can be filtered by user, action, area and date. Test-rate rows are loaded visually only when the Test Rates tile is selected.

The version checker now fetches `version.js` with `cache: no-store` on startup and every 10 minutes. If a different deployed version is detected, the user receives an update prompt.

No database change is required.


## v0.7.2 — Modal exit and update-check refinement

The generic modal close X and Cancel controls are now explicit non-submit buttons. This prevents New Rental validation from firing when a user simply wants to leave the form. Only the Create Booking submit action validates required fields.

Version checks now use a lower-frequency schedule: startup, five minutes after startup, every six hours while open, and when the app becomes active again after at least 30 minutes.

No database changes are required.
