# Changelog

All notable changes to dev-B5 are recorded here.

## v0.8.1 — Rental, Fleet, Finance & Maintenance Expansion
- Added rental search by customer, phone, vehicle, plate or rental number, with Open, History and All views.
- Added fleet filters for type, make, source/company, status and daily-rate range, plus flexible sorting.
- Fleet tiles now drill into vehicle details, rental history, maintenance history and profitability.
- Added vehicle purchase cost/date tracking and vehicle-specific expenses.
- Partial payments now leave a persistent outstanding customer/rental balance rather than requiring full settlement.
- Added automatic payment reference generation.
- Card payments automatically add a 5% surcharge to both the rental charges and payment total.
- Added Reports for projected rental income, recorded cash flow, customer IOUs and vehicle profitability in USD.
- Added unique single-use promo-code infrastructure supporting 5%, 10%, 15%, 20% and one-free-day offers.
- Added vehicle maintenance records and kilometre-based reminder thresholds at 5,000 km, 3,000 km and 1,000 km.
- Added the required Supabase finance, promotion, expense and maintenance schema with authenticated RLS policies.

## v0.8.0 — Client Workflow Enhancements
- Added dynamic pickup/drop-off location management from Availability.
- Added Add New Location immediately below Any and an English Lebanon locality reference list.
- Made rental cards clickable for detailed customer, vehicle, rental and financial information.
- Calendar booking colours now change between rental agreements/customers.
- Added Calendar search, type/source/status/price filters and sorting controls.

## v0.7.10 — Mobile Menu Controls & Fresh Audit History
- Added a visible close button to the mobile sidebar.
- Added a tap-outside backdrop so touching the remaining screen closes the mobile menu.
- Added Escape-key support for closing the navigation where available.
- The menu continues to close automatically after selecting a navigation item.
- Cleared 721 existing development/import audit records from Supabase to establish a clean demo audit baseline.
- Added a private SQL record of the completed audit reset under `_private/sql/`.
- No fleet, customer, supplier, location or rental data was deleted.

## v0.7.9 — Actionable Overdue Rentals
- Made the Dashboard overdue warning clickable.
- Added a drill-down list of overdue rentals.
- Each overdue record now shows customer, vehicle, expected return time and elapsed overdue time.
- Added direct Extend and Return Vehicle actions.
- Added Open Rental to navigate directly to and highlight the matching rental agreement.
- Clarified that overdue means the expected return time has passed while the rental remains active.

## v0.7.8 — User-Friendly Audit Log
- Replaced raw JSON in the Manager audit table with concise plain-English summaries.
- Humanised audit action names and retained expandable technical details.

Earlier development history remains represented by the Git commit history and previous project changelog versions.
