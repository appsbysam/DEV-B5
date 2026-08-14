# Changelog

All notable changes to dev-B5 are recorded here.

## V6.1 — Demo Data & Customer Fix
- Fixed the New Rental customer selector so an empty customer list cannot submit an invalid UUID.
- Added a `Create new customer…` option directly inside the New Rental customer dropdown.
- New customers created there are inserted into Supabase immediately and selected automatically.
- Changed the connection label from `Live Supabase` to `Online`.
- Changed the sidebar build label from `GitHub + Supabase build` to `Demo Build`.
- Added companion SQL for five test customers, the standard test locations, and authenticated access policies for the new rental workflow tables.
- No existing vehicle or supplier data is modified by the SQL.

## V6.0 — Core Rental Demo
- Added a complete New Rental / Booking workflow.
- Added full date/time conflict detection before a vehicle can be booked.
- Added own-fleet, alternative/upgrade and external partner availability results.
- Added indicative pricing using daily rate, pickup fee, drop-off fee, other charges, discounts and deposits.
- Added security-bond creation separately from rental revenue.
- Added rental charge lines and payment recording.
- Added rental extensions with automatic conflict detection and replacement suggestions.
- Added vehicle swaps/upgrades/downgrades using rental segments so original vehicle history is preserved.
- Added automatic rate handling for replacement vehicles: keep existing rate, use replacement rate or enter custom rate.
- Added vehicle-return completion workflow.
- Improved Dashboard and Today views.
- Improved Fleet cards with current customer, return time and next booking.
- Improved 14-day Calendar timeline using live rental segments.
- Bumped visible application version to v6.0.

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
