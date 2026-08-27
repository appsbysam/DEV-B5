# Changelog

All notable changes to dev-B5 are recorded here.

## v0.9.14 — Operational Controls & Customer Accounts
**Released: 27 August 2026**
- Added dynamic customer search/autocomplete across customer name, phone, email, licence and passport details.
- Added `gps_enabled` to vehicles and an at-a-glance GPS indicator for equipped fleet vehicles.
- Added manager-controlled ad-hoc discount requests with pending/approved/rejected state, requester, reason, approver and approval timestamp. The first manager approval applies the discount; later managers see the existing approval instead of approving it again.
- Added database-level protection preventing finalised/returned rental agreements from being updated or deleted. Managers use separate `contract_amendments` records so the original contract remains intact.
- Added monthly-account and monthly-reminder flags to customers plus a reminder log and manager-triggered email reminder workflow. This is deliberately manual initially and structured for later automation.
- Added RLS policies for discount requests, amendments and monthly reminder records.
- Added `v0914.js` and `v0914.css` and refreshed application asset revisions to v0.9.14.

## v0.9.13 — Seamless Vehicle Action Modals
**Released: 25 August 2026**
- Reworked the vehicle-card child-action workflow so **Purchase Details**, **Add Expense** and **Add Maintenance** no longer close the vehicle context and expose the Fleet list before opening.
- Child forms now reuse the already-open vehicle modal and swap its contents in place.
- Closing, cancelling or successfully completing a child form restores the same vehicle card immediately within the still-open modal.
- Retained the financial tile order: Purchase Cost, Expenses, Rental Income, then Operating Profit.
- No Supabase schema changes were required.

## v0.9.8 — Canonical PWA Repair
**Released: 24 August 2026**
- Removed the competing `service-worker.js` introduced during the previous repair and consolidated installability and push notifications onto the existing `sw.js` worker.
- Added a fetch handler and shell activation lifecycle to `sw.js` so Chromium-based browsers can recognise the application consistently as a PWA.
- Registered `sw.js` directly from `index.html` under the `/DEV-B5/` scope.
- Removed stale manifest/favicon references and restored canonical PWA paths.
- No Supabase changes were required.

## v0.9.7 — PWA Installability Repair
**Released: 24 August 2026**
- Added PWA installability repair work and refreshed application metadata.

## v0.9.6 — PWA Install Icon Recovery
**Released: 24 August 2026**
- Restored standard PWA icons while retaining maskable artwork.

## v0.9.5 — PWA Branding & Login Alignment
**Released: 24 August 2026**
- Refined PWA branding and aligned Keep me logged in / Forgot password on one row.

## v0.9.4 — PWA Install & Icon Repair
**Released: 24 August 2026**
- Restored a complete installable PWA icon/manifest configuration.

## v0.9.3 — White Rounded Branding
**Released: 24 August 2026**
- Restored white-background rounded B5 branding.

## v0.9.2 — Branding Refresh
**Released: 24 August 2026**
- Added refreshed B5 branding assets.

## v0.9.1 — Login Resilience & Sign Out
**Released: 24 August 2026**
- Improved startup resilience and added Sign Out access.

## v0.9.0 — Secure Password Recovery
**Released: 24 August 2026**
- Added secure password recovery and Keep me logged in.

## v0.8.99 — Branding & User Profile Polish
**Released: 24 August 2026**
- Improved sign-in branding and Manager user profile controls.

## v0.8.98 — Permission & Access Control Hardening
**Released: 24 August 2026**
- Enforced saved staff permissions across navigation and operational actions.

## v0.8.97 — Manager User Creation
**Released: 24 August 2026**
- Added Manager Mode user creation and first-login password-change workflow.

## v0.8.96 — Flexible Rental Sorting
**Released: 24 August 2026**
- Added configurable rental sorting.