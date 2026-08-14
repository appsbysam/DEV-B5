# Changelog

All notable changes to dev-B5 are recorded here.

## V5.1 — Session Refresh Fix & Version Display
- Fixed the authenticated-session restoration sequence after a browser refresh.
- Registered the Supabase auth-state listener before loading operational data.
- Reloads live Supabase data on INITIAL_SESSION, SIGNED_IN and TOKEN_REFRESHED events.
- Keeps the login gate active until a valid session is recovered.
- Added visible app version `v5.1` beneath the signed-in staff email on the desktop header.

## V5 — Staff Authentication & Public-Repo Hardening
- Added Supabase email/password staff sign-in.
- Added persistent authenticated sessions and Sign Out.
- Prevented the operational app from loading until a valid Supabase session exists.
- Removed imported-data.js from the public build so historical/imported business data is no longer bundled into the website source.
- Removed one-off SQL migration/setup files from the public repository package.
- Kept Supabase publishable-key browser configuration; no secret/service-role key is included.
- Prepared the frontend for authenticated-only RLS policies.
- Retained the locked responsive mobile/desktop layout and Any pickup/drop-off filters from V3/V4.

## V4 — Supplier Data Cleanup
- Merged confirmed supplier aliases while preserving linked vehicle records.
- Canonicalised Boss, Jonny, Mekano and Halal variants.
- Follow-up database cleanup canonicalised Nada, Majeed and Igor.

## V3 — Live Supabase & Responsive Layout
- Switched core operational screens to live Supabase data.
- Added Supabase writes for new vehicles, customers and rentals.
- Added Any pickup/drop-off availability filters.
- Locked mobile viewport and improved responsive tables.
