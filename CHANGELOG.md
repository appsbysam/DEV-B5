# Changelog

All notable changes to dev-B5 are recorded here.

## v0.9.3 — White Rounded Branding
**Released: 24 August 2026**
- Reverted the staff sign-in branding from the transparent/dark treatment back to the original white-background B5 All Season logo.
- Added rounded corners and a subtle shadow to the sign-in logo so its white background reads as a deliberate logo card rather than a hard rectangular block.
- Reworked the installed-app/PWA splash icon to use the original white-background logo inside a rounded white panel while retaining the dark B5 splash backdrop.
- Kept **Keep me logged in** and **Forgot password?** on the same horizontal row and explicitly right-aligned **Forgot password?**.
- Added responsive sizing so the two login options remain on one line on smaller phones.
- No Supabase changes were required.

## v0.9.2 — Branding Refresh
**Released: 24 August 2026**
- Replaced the staff sign-in artwork with the newly approved transparent B5 All Season logo so it sits directly on the dark login card without the previous white rectangular background.
- Increased the responsive sign-in logo presentation for stronger visual prominence.
- Added `assets/logo-approved.svg` as the approved transparent application branding asset.
- Added a dedicated installed-app/PWA icon using the approved artwork with a tighter composition so the logo occupies substantially more of the Android splash icon area.
- Updated `manifest.webmanifest` to use the approved icon for standard and maskable PWA purposes and changed the splash background to B5 dark navy (`#0b1220`).
- No Supabase changes were required.

## v0.9.1 — Login Resilience & Sign Out
**Released: 24 August 2026**
- Restored authenticated read access to `vehicle_categories` in Supabase, fixing the startup permission error that could leave Dashboard data at zero and navigation unavailable until relaunch.
- Added a guarded one-time retry for transient authentication/network failures during initial mobile/PWA loading.
- Re-applies Manager and per-user navigation permissions after initial/retried loading.
- Added **Sign Out** at the bottom of the side menu and inside **My Profile**, while retaining the desktop/top-bar control.
- Updated **Locations & Fees** mobile labels to use natural punctuation and spacing.

## v0.9.0 — Secure Password Recovery
**Released: 24 August 2026**
- Added **Forgot Password?** with secure email recovery and an in-app new-password screen.
- Retained the Manager Mode temporary-password and first-login-change workflow for new accounts.
- Added **Keep me logged in** to control trusted-device session persistence.
- Added recovery activity to the audit trail where available.

## v0.8.99 — Branding & User Profile Polish
**Released: 24 August 2026**
- Increased the All Season logo on the staff sign-in screen.
- Refined the Manager Mode User Profile modal so the permissions area scrolls independently on smaller screens.
- Consolidated the footer actions into **Cancel**, **Reset to Role Defaults**, and **Save User**.

## v0.8.98 — Permission & Access Control Hardening
**Released: 24 August 2026**
- Fixed signed-in staff profile loading so individual saved permissions are actually enforced.
- Restricted navigation and actions according to saved user access, including parent/child permission dependencies.
- Added stronger backend enforcement for core operational writes and inactive-account handling.

## v0.8.97 — Manager User Creation
**Released: 24 August 2026**
- Added **Add User** to Manager Mode → Users with display name, email, temporary access credential, base role and individual permissions.
- Added a mandatory first-login credential-change option for newly created accounts.
- Added protected backend account creation and the supporting staff-profile state.

## v0.8.96 — Flexible Rental Sorting
**Released: 24 August 2026**
- Added a compact **Sort by** control to Rentals.
- Added sorting by Pickup Date, Rental / Contract #, Customer Name, Vehicle, or Vehicle Type, plus ascending/descending order.
- Sorting works alongside rental search and Open, History and All views.

## v0.8.1 — Rental, Fleet, Finance & Maintenance Expansion
- Added rental search by customer, phone, vehicle, plate or rental number, with Open, History and All views.
- Added fleet filters and sorting, vehicle drill-down, purchase tracking, expenses, partial-payment balances, payment references and card surcharges.
- Added operational and financial reports, promo-code infrastructure and vehicle maintenance/reminder tracking.
- Added the supporting Supabase finance, promotion, expense and maintenance schema.

## v0.8.0 — Client Workflow Enhancements
- Added dynamic pickup/drop-off location management from Availability and an English Lebanon locality reference list.
- Made rental cards clickable for detailed customer, vehicle, rental and financial information.
- Added Calendar colours, search, filters and sorting.

## v0.7.10 — Mobile Menu Controls & Fresh Audit History
- Added a visible close button, tap-outside backdrop and Escape-key support to mobile navigation.
- Reset the development/import audit history to establish a clean demo baseline without deleting operational data.

## v0.7.9 — Actionable Overdue Rentals
- Made the Dashboard overdue warning clickable with a drill-down list and direct Extend, Return Vehicle and Open Rental actions.

## v0.7.8 — User-Friendly Audit Log
- Replaced raw audit JSON with concise plain-English summaries while retaining expandable technical details.

Earlier development history remains represented by the Git commit history and previous project changelog versions.