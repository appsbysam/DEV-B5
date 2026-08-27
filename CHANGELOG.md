# Changelog

All notable changes to dev-B5 are recorded here.

## v0.9.14 — Operational Controls & Customer Accounts
**Released: 27 August 2026**
- Changed Customer search into a true live filter of the displayed customer list across name, phone, email, licence and passport details. Filtered customer rows remain selectable and open a customer account/history view.
- Added `gps_enabled` to vehicles. GPS can be selected when adding a vehicle, changed from the vehicle details card, and is shown as an at-a-glance GPS badge on equipped fleet cards.
- Added staff ad-hoc discount requests with amount/reason, manager notifications, pending status and first-manager approval. Approval applies the discount once and records the approving manager; subsequent managers are told who already approved it.
- Added a Manager Mode discount-approval panel in addition to rental-card approval controls.
- Added database-level protection for finalised/returned contracts and their operational child records. Final contracts cannot be edited; managers instead add separate dated `contract_amendments`, preserving the original contract.
- Added monthly-account customer flags and monthly reminder eligibility. Managers receive one outstanding-balance reminder per eligible customer/month and can review the customer account before manually preparing an email reminder. Reminder activity is logged for later automation.
- Added/updated RLS and database functions supporting discount approval, contract immutability, amendments and monthly reminders.
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