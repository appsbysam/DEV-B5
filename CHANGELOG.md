# Changelog

All notable changes to dev-B5 are recorded here.

## v0.7.7 — Critical Data Load Fix & White Icon Pack
- Fixed `customerDisplayName is not defined`, which stopped the Supabase load pipeline and caused dashboard values to display as zero.
- Restored searchable customer autocomplete and First Name / Family Name customer creation.
- Made the displayed version derive from `version.js`.
- Added versioned CSS/JavaScript asset URLs to reduce stale GitHub Pages caching.
- Changed Update Now to reopen the page with the deployed version query string.
- Rebuilt the login/sidebar logo on a white background.
- Rebuilt all favicon, Android/PWA, maskable and Apple Touch icons on white backgrounds.
- Restored Dashboard drill-down functionality.
- No Supabase database changes are required.

## v0.7.4 — Reconciled Fleet Statuses
- Updated availability logic to respect the reconciled Supabase operational status.
- `Needs Review` vehicles are no longer incorrectly counted as available.
- Unresolved `Out on Rental` records without a reliable rental segment fall back to `Needs Review`.
- Added a Needs Review dashboard statistic.
- Designed to work with the 15 August 2026 customer/rental reconciliation import.
- No additional SQL is required after the reconciliation already applied to Supabase.

## v0.7.3 — Today Dashboard Drill-Down
- Fixed the visible header version number so it matches the deployed application version.
- Reworked the Today page into compact summary tiles.
- Returns Today now displays a count first and opens its detailed list only when selected.
- Pickups Today now displays a count first and opens its detailed list only when selected.
- Vehicles Available in Office now displays only the count until the tile is selected.
- External Vehicles Requiring Action now uses the same drill-down pattern.
- Tapping an active Today tile again collapses the detail area.
- No Supabase database changes are required.

## v0.7.2 — Modal Exit & Smarter Update Checks
- Fixed the New Rental / Booking close X so it exits the modal immediately.
- Fixed the Cancel button so it exits without running booking validation.
- Required-field validation now runs only when Create Booking is submitted.
- Replaced the 10-minute repeating version check with a lighter update schedule.
- Version checks now run shortly after startup, again after 5 minutes, every 6 hours while open, and when the user returns after at least 30 minutes away.
- No Supabase database changes are required.

## v0.7.1 — Manager UI, User Profile & Update Checking
- Added Manager Mode shortcut to the desktop header while retaining it in the mobile navigation menu.
- Changed the signed-in identity to a clickable user name rather than displaying only the email address.
- Added My Profile popup with username, email, role, status, device type, browser, user ID and persistent device ID.
- Added copy controls for User ID and Device ID.
- Added persistent local device identification to client audit events.
- Redesigned Manager Mode into four compact dashboard tiles: User Access, Audit Log, Test Rates and System.
- Removed the always-expanded 181+ test-rate list; records now appear only when Test Rates is selected.
- Added drill-down User Access activity and audit filtering by user, action/log, area and date.
- Added searchable Test Rates drill-down.
- Added actual no-cache `version.js` update checking on startup and every 10 minutes.
- Added an Update Available prompt with optional immediate refresh.
- No Supabase SQL/database changes are required for this release.

## v0.7.0 — Manager Mode, Version Updates & Audit History
- Moved application version information into `version.js`.
- Added automatic What's New popup when a newly deployed version is detected.
- Added clickable version number to reopen release notes at any time.
- Added staff-profile roles with Manager / Staff support.
- Added a Manager Mode navigation item that is hidden completely for Staff users.
- Added manager-only user access overview.
- Added manager-only list of vehicles still using `.01` test rates.
- Added historical audit/activity area with search and filtering.
- Added app audit events for login, logout, page navigation, rental creation, extensions, vehicle changes, payments, returns, new customers and new vehicles.
- Added database-trigger audit support for insert/update/delete changes to major business tables.
- No SQL is included in the public GitHub package; the companion SQL belongs in `_private/sql/`.

## v0.6.3 — Mobile Rental Modal Fit
- Fixed the New Rental / Booking modal on mobile so it always stays within the device viewport.
- Removed horizontal/sideways modal movement.
- Forced modal form fields and grids to remain within the available screen width.
- Changed the rental modal to vertical scrolling only on smaller screens.
- Kept the modal header and action area contained while the form body scrolls.
- No Supabase database changes are required.

## v0.6.2 — Required Field Validation & Pre-Release Versioning
- Changed the visible application version from v6.1 to **v0.6.2** to clearly identify the app as pre-release software.
- Added required-field validation to the New Rental / Booking workflow.
- Missing required fields are now highlighted with a red border and a clear inline message.
- All missing required fields are highlighted together after validation fails.
- Validation styling is automatically removed as each field is corrected.
- Invalid return dates are highlighted directly on the Return field.
- No Supabase database or SQL changes are required for this release.

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
