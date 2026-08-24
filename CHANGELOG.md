# Changelog

All notable changes to dev-B5 are recorded here.

## v0.9.7 — PWA Installability Repair
**Released: 24 August 2026**
- Added a dedicated service worker under the `/DEV-B5/` scope so supported Android browsers can recognise the site as an installable web application rather than only a generic website shortcut.
- Added a fresh `manifest-v097.webmanifest` with explicit `/DEV-B5/` app ID, start URL, scope and absolute application-icon paths.
- Added a runtime PWA bootstrap that replaces the stale `v0.9.1` manifest and shortcut-icon metadata still present in `index.html`.
- Retained the approved B5 white-background branding and existing login layout.
- No Supabase changes were required.

## v0.9.6 — PWA Install Icon Recovery
**Released: 24 August 2026**
- Restored the proven v0.9.4 standard **192×192** and **512×512** PWA icons for browser install/shortcut previews after Brave fell back to a generic letter icon with the v0.9.5 standard assets.
- Retained the v0.9.5 white-filled **maskable** icons for Android launcher and splash-screen framing, preserving the no-black-band treatment.
- Added explicit cache-busting to all manifest icon URLs so browsers fetch the intended assets instead of reusing stale icon metadata.
- Kept the v0.9.5 **Keep me logged in** / **Forgot password?** same-row alignment unchanged.
- No Supabase changes were required.

## v0.9.5 — PWA Branding & Login Alignment
**Released: 24 August 2026**
- Reframed the PWA icon artwork onto a full white canvas so Android launcher masking no longer exposes dark bands above or below the B5 branding.
- Added refreshed **192×192** and **512×512** standard and maskable PWA icon assets using the existing approved B5 artwork rather than recreating the logo.
- Adjusted the icon artwork proportions to make the branding more prominent in the Android splash treatment while retaining the dark B5 navy splash background.
- Corrected the staff sign-in options so **Keep me logged in** is left-aligned and **Forgot password?** is right-aligned on the same row, including narrow mobile screens.
- No Supabase changes were required.

## v0.9.4 — PWA Install & Icon Repair
**Released: 24 August 2026**
- Repaired the PWA manifest after the previous single-JPEG icon configuration caused supported Android browsers to fall back to shortcut behaviour and a generic letter icon.
- Added dedicated **192×192** and **512×512 PNG** application icons.
- Added dedicated **192×192** and **512×512 maskable PNG** icons for Android launchers.
- Restored a complete installable manifest configuration, including a stable app ID, standalone display mode, scope and start URL.
- Retained the dark B5 navy application/splash background and the approved white rounded B5 logo-card treatment.
- No login-screen or Supabase changes were required.

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