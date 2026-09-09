# Changelog

All notable changes to dev-B5 are recorded here.

## v0.9.19 — Manager Action List
**Released: 9 September 2026**
- Added a manager-only **Action List** to the sidebar containing the consolidated B5 client requirements and outstanding work.
- Added persistent check/uncheck status stored in Supabase with manager-only RLS protection.
- Every Action List status change is recorded in the existing audit log, including the responsible manager and whether the item was completed or reopened.
- Added grouped requirements and an overall completion count/percentage.
- Seeded the checklist with the agreed completed and outstanding items covering fleet, rentals, customers, payments, reports, suppliers, system/business setup and marketing.

## v0.9.18 — First Login Authentication Fix
**Released: 8 September 2026**
- Hardened the first-login temporary-password workflow so B5 verifies/restores the authenticated Supabase session before attempting `updateUser`, preventing the observed **Auth session missing** failure.
- Added a guard against duplicate `SIGNED_IN`/manual login processing for the same user while the password gate is opening.
- First-login and password-recovery screens now enforce the requested password rule: minimum 8 characters with at least one uppercase letter, one lowercase letter, one number and one symbol.
- Added visible first-login password guidance before submission.
- No database schema changes were required.

## v0.9.17 — Customer Database Search
**Released: 8 September 2026**
- Added a permanent live search/filter field to the main **Customers** database screen.
- Results narrow immediately as staff type, with matching across customer name, phone numbers, email, licence number and passport number.
- Filtered customer rows remain directly tappable/clickable and keyboard selectable to open the customer's account and rental history.
- Added a live result count showing the number of matching customer records.
- No Supabase/database changes were required.

## v0.9.16b — Contract Signature Integration Fix
**Released: 8 September 2026**
- Fixed the v0.9.16a contract-page integration so the signature enhancement reliably detects the loaded contract and renders the signing panels.
- Updated the contract signing CSS/JS asset revisions to `0.9.16b` to force a fresh browser load.
- Preserved the original signature field IDs behind the enhanced panels so the existing contract form-data and PDF workflow remain compatible.
- Added a contract-loaded listener plus a guarded load check for reliable rendering regardless of script/load timing.
- Prevented signatures from being cleared or replaced after a contract is finalised/closed.
- No customer-search changes are included in this release.

## v0.9.16a — Contract Signature Panels
**Released: 8 September 2026**
- Upgraded the existing contract signature areas with restrained pale blue-grey signing panels while preserving the approved contract layout and vehicle-damage workflow.
- Added direct in-contract signature capture for lessee and management using finger, stylus or mouse.
- Stored signatures render back into the contract with signer name and Sydney date/time and are captured by the existing HTML-to-PDF workflow.
- Added awaiting-signature states, clear/replace controls, and clean white signature surfaces for legible PDF output.
- Added a discreet verification strip containing contract number, signing time and an `ASR-` verification ID.
- Added `contract-signing.css` and `contract-signing.js`; the contract page loads this enhancement layer through its existing Supabase bootstrap so the large approved contract template itself does not need to be restructured.

## v0.9.16 — Secure Contract Signing
**Released: 8 September 2026**
- Added secure browser-based signing links for rental contracts; recipients do not need a B5 account or PDF software.
- Added touch/stylus/mouse signature capture with full signer name and signing timestamp retained against the contract.
- Added separate retained lessee and management signature fields to the contract record.
- Added one-contract signing tokens stored only as SHA-256 hashes, with seven-day expiry and single-use signed status.
- Added `contract_signing_requests` with RLS for staff-side request history and an Edge Function that limits public access to the specific tokenised contract/signing operation.
- Added a **Send for Signature** action to rental contract controls and a share/copy workflow for the secure link.
- Added `sign.html` as the customer-facing signing page and `v0916.js` for B5 signing controls.
- Preserved the existing contract and vehicle-damage workflow.

## v0.9.15 — Fixed Mobile Navigation Header
**Released: 27 August 2026**
- Changed the mobile topbar from sticky positioning to a genuinely fixed header so the hamburger menu remains available while scrolling long screens.
- Added the correct mobile content offset so page content starts below the fixed header instead of being obscured by it.
- Added safe-area handling for mobile devices with display cut-outs/status areas.
- Ensured the open sidebar and its backdrop layer above the fixed header.
- No Supabase/database changes were required.

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