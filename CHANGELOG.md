# Changelog

All notable changes to dev-B5 are recorded here.

## v0.9.1 — Login Resilience & Sign Out
**Released: 24 August 2026**
- Restored authenticated read access to `vehicle_categories` in Supabase. This fixes the **permission denied for table vehicle_categories** startup error that could leave Dashboard data at zero and navigation unavailable until the app was relaunched.
- Added a guarded one-time retry when the initial mobile/PWA data load fails with a transient authentication, JWT, network or fetch error. The retry reuses the confirmed Supabase session and does not loop indefinitely.
- Re-applies Manager and per-user permission navigation after the initial/retried load so menu visibility remains consistent with the signed-in user's saved access.
- Added **Sign Out** at the bottom of the side menu for convenient mobile access.
- Added **Sign Out** inside the signed-in user's **My Profile** window; Manager Mode's edit-user profile remains unaffected.
- Retained the existing desktop/top-bar Sign Out control.
- Updated **Locations & Fees** mobile labels to use natural punctuation and spacing: `LOCATION: Beirut`, `PICKUP: $65.00`, `DROP-OFF: $65.00`, `BUFFER: 180 mins`.
- Supabase migration `restore_vehicle_categories_authenticated_read` enables RLS, grants authenticated SELECT access and adds an authenticated read policy for `vehicle_categories`.

## v0.9.0 — Secure Password Recovery
**Released: 24 August 2026**
- Added **Forgot Password?** to the staff sign-in screen.
- Staff can request a secure Supabase password-recovery email without manager intervention; the response deliberately does not reveal whether an entered email belongs to an account.
- Recovery links return the user to B5 in password-recovery mode, where a dedicated screen requires a new password and confirmation before the recovery session is signed out.
- The existing Manager Mode temporary-password plus **User must change password on first login** workflow remains available for new accounts and deliberate manager-assisted resets.
- Added **Keep me logged in** to the sign-in screen. Checked sign-ins are allowed to persist on the trusted device; unchecked sign-ins are treated as temporary browser-session access and are not accepted on a later fresh browser session.
- Explicit Sign Out clears the saved persistence preference and temporary-session marker.
- Successful email password recovery is written to the B5 audit log when available.
- No Supabase schema changes were required; password reset delivery uses the existing Supabase Auth recovery service.

## v0.8.99 — Branding & User Profile Polish
**Released: 24 August 2026**
- Increased the All Season logo on the staff sign-in screen using the existing optimised `assets/logo.webp` artwork rather than recreating the logo.
- Refined the Manager Mode User Profile modal so the permissions area scrolls independently and remains practical on smaller/mobile screens.
- Consolidated the user-profile actions into one bottom footer row: **Cancel**, **Reset to Role Defaults**, and **Save User**.
- Removed the separate bottom Close action while a Manager User Profile is open; the top-right X remains available as an additional dismissal control.
- Prepared installed/PWA branding to use the existing repository icon assets for a more prominent splash presentation; no Supabase changes were required.

## v0.8.98 — Permission & Access Control Hardening
**Released: 24 August 2026**
- Fixed the signed-in staff profile loader so it now retrieves `permission_role`, individual `permissions`, notification preferences and first-login password state from Supabase rather than falling back to role defaults.
- User Profile permission switches now take effect after save/login: inaccessible sections are removed from navigation and direct navigation to restricted pages is blocked.
- Added permission dependency enforcement so child actions cannot remain available when their parent area is disabled; for example, Create/Edit/Return Rental permissions cannot bypass a disabled View Rentals permission.
- Re-applied permission visibility after dynamic renders so later-injected controls such as payment, return, extend/swap and promo actions remain consistent with the signed-in user's access.
- Manager Mode visibility now follows the saved Manager permission instead of relying only on the legacy `role` field.
- Inactive or missing staff profiles are now refused entry before the operational application starts and are signed back out with an explanatory message.
- Added database-side permission helpers and RLS hardening for core rental, customer, fleet and payment tables so critical access restrictions are enforced by Supabase as well as by the browser UI.
- Existing manager access was preserved during the security migration.

## v0.8.97 — Manager User Creation
**Released: 24 August 2026**
- Added **Add User** to Manager Mode → Users so authorised managers can create staff accounts without leaving B5.
- New-user setup includes Display Name / Username, email address, temporary password, base role and individual permission selection.
- Added cryptographically generated temporary passwords plus a Copy control; managers can also enter their own temporary password.
- Added **User must change password on first login**, enabled by default for newly created accounts.
- Users flagged for a first-login password change are blocked from the operational app until they successfully choose and confirm a new password.
- Added protected Supabase Edge Function `b5-manage-users` for privileged Auth user creation. The service-role credential remains server-side and is not exposed to the browser.
- Added `staff_profiles.must_change_password` and the authenticated `b5_complete_first_login_password_change()` database function to safely clear the user's own first-login requirement after a successful password update.
- New user creation records an audit-log event.

## v0.8.96 — Flexible Rental Sorting
**Released: 24 August 2026**
- Added a compact **Sort by** control to the Rentals section.
- Rentals can now be sorted by Pickup Date, Rental / Contract #, Customer Name, Vehicle, or Vehicle Type.
- Added ascending/descending ordering; Pickup Date retains the existing **Newest First** behaviour as the default.
- Sorting works alongside the existing rental search and Open, History and All views.
- No Supabase schema or data changes were required for this release.

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