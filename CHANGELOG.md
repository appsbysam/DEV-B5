# Changelog

All notable changes to dev-B5 are recorded here.

## v0.9.28 — Supplier Management & Birthday Messages
**Released: 10 September 2026**
- Audited the Suppliers Action List against the existing app and completed the remaining supplier workflows.
- Preserved the existing supplier management, edit/deactivate and cars-supplied functionality, and added safe permanent deletion for suppliers with no linked history.
- Added supplier types for vehicle, tyre, brake, parts, product and service suppliers.
- Added persistent products/services supplier history, including date, type, description, amount, vehicle, reference and notes.
- Added a per-customer Happy Birthday message preference. It can only be enabled when the customer has a date of birth and provides a prepared WhatsApp birthday message for staff.

## v0.9.27 — Monthly Reminders & Calendar Filters
**Released: 10 September 2026**
- Added per-customer monthly reminder preferences: Automatic Email, Automatic SMS, Automatic Email + SMS, Manager Review / Manual Send, and Automatic WhatsApp.
- Enforced one reminder choice at a time and disabled choices when the customer profile is missing the required email address or mobile number.
- Restricted month-end reminder generation to the last day of the month for enabled monthly-account customers with an outstanding balance, with monthly deduplication retained.
- Added prepared Email, SMS and WhatsApp actions for manager/manual sending; automatic external delivery remains provider-ready until sender integrations are configured.
- Added Calendar filtering by Customer Name and Vehicle Make alongside the existing vehicle filters.

## v0.9.26 — Payments & Finance Completion
**Released: 10 September 2026**
- Completed the remaining Payments & Finance Action List requirements.
- Added persistent customer-level visibility of outstanding balances across rentals and later visits.
- Added database-generated unique payment references and configurable accepted payment methods in Settings.
- Confirmed Card as a payment method and added the configured 5% card surcharge, with staff able to turn the surcharge off for an individual card payment.
- Added base/surcharge payment tracking and a Full Cash Flow report combining rental receipts, other cash inflows and business/vehicle expenses while reducing duplicate expense counting.

## v0.9.25b — Focus Refresh Fix
**Released: 10 September 2026**
- Returning to B5 after switching browser tabs or Alt-Tabbing no longer triggers an unnecessary visual app refresh/re-render.
- Silent Supabase token refresh events keep the current screen, route and scroll position intact for the same signed-in user.
- Preserved normal browser refresh, route restoration, scroll restoration, sign-in/sign-out handling and sidebar navigation.

## v0.9.25a — Scroll Persistence & Customer Search
**Released: 10 September 2026**
- Refreshing the app now restores the same vertical scroll position on the current page instead of jumping to the top.
- Preserved the existing current-page/hash refresh behaviour.
- Restored a permanent live search field to Customers, matching name, phone/mobile, email, licence number and passport number.
- Added a live matching-customer count while retaining direct customer-row access.

## v0.9.25 — Reports Completion & Future Income
**Released: 10 September 2026**
- Completed the remaining Reports requirements.
- Added a combined individual-vehicle report showing rental income, vehicle expenses and net result.
- Added an overall business income, expense and net-result report.
- Consolidated expected income into Next 7 days, Next calendar month and Custom date range selections.

## v0.9.24h — Action List & Mobile Navigation Fix
**Released: 10 September 2026**
- Restored Action List category expand/collapse controls and completed-category highlighting.
- Added a direct mobile sidebar safeguard so selecting navigation closes the sidebar.

## v0.9.24 — Fleet Lifecycle & Sales
**Released: 9 September 2026**
- Added Fleet Sales, vehicle lifecycle controls, sale recording and expanded vehicle management.

## v0.9.23a — Window Focus Navigation Fix
**Released: 9 September 2026**
- Fixed page rollback after switching away from B5 and returning while preserving normal refresh routing.

## v0.9.23 — User Password Management
**Released: 9 September 2026**
- Added manager password resets and self-service password changes.

## v0.9.22 — Fleet Filters & Action List Refinement
**Released: 9 September 2026**
- Added Fleet filters and Action List category controls.

## v0.9.21 — Persistent Page Navigation
**Released: 9 September 2026**
- Refreshing restores the current page and Manager subsection through URL routing.

## v0.9.20 — Editable Action List
**Released: 9 September 2026**
- Added editing for Action List requirements.

## v0.9.19 — Manager Action List
**Released: 9 September 2026**
- Added the manager-only persistent Action List.

## v0.9.18 — First Login Authentication Fix
**Released: 8 September 2026**
- Hardened first-login temporary-password handling and password policy.

## v0.9.17 — Customer Database Search
**Released: 8 September 2026**
- Added live Customer search across name, phone, email, licence and passport details.

## v0.9.16 — Secure Contract Signing
**Released: 8 September 2026**
- Added secure browser-based contract signing.

## v0.9.15 — Fixed Mobile Navigation Header
**Released: 27 August 2026**
- Made the mobile navigation header fixed while scrolling.

## v0.9.14 — Operational Controls & Customer Accounts
**Released: 27 August 2026**
- Added customer filtering, GPS, discount approvals, contract protections and monthly-account controls.

## v0.9.13 — Seamless Vehicle Action Modals
**Released: 25 August 2026**
- Kept vehicle financial and maintenance actions inside the open vehicle context.