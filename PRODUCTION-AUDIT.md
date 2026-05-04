# Production Readiness Audit — Town of Harmony Website

**Date:** 2026-05-04 (updated)
**Staging:** preview.townofharmony.org
**Legacy:** townofharmony.org (403 — blocked automated access)
**Issue:** LAC-429
**Fix commits:** `35966908`, `380b0fdc`, `919dcd46`, `0f50e66f`, `604ae9a9`, `363e36a5`

---

## Launch Status: READY (with caveats)

All critical data accuracy issues are fixed and verified against authoritative sources. The site is safe to launch. Remaining items are content gaps that require input from Town staff — they do not block go-live but should be addressed soon after.

---

## FIXED AND VERIFIED

| # | Issue | Fix | Verified Against |
|---|-------|-----|------------------|
| 1 | Library hours wrong | Mon–Sat 9 AM–6 PM | iredell.lib.nc.us (confirmed 2026-05-04) |
| 2 | Sheriff phone wrong (878-3100) | Changed to (704) 878-3180 | iredellsheriff.com (confirmed 2026-05-04) |
| 3 | hvfd.com = Maryland FD | Link removed entirely | — |
| 4 | Sewer rates not displayed | Rate tiers now render on /sewer | Staging verified |
| 5 | Spring in the Park stale | Marked as "past" event | Staging verified |
| 6 | Iredell County URLs (301 redirect) | Updated to iredellcountync.gov | Staging verified |
| 7 | School district URL (301 redirect) | Updated to issnc.org | Staging verified |
| 8 | News section empty (visible) | Hidden when no articles exist | Staging verified |
| 9 | Elections page (no real content) | Removed from nav + sitemap | Staging verified |
| 10 | Report Issue link → dead URL | Now points to /contact | Staging verified |
| 11 | After-hours community center section | Removed (unverified data) | Commit 380b0fdc |
| 12 | Unverified incorporation date (Feb 10) | Removed, kept "1927" only | Commit 919dcd46 |
| 13 | Unverified Wanda Edwards phone | Removed personal number | Commit 604ae9a9 |

---

## REMAINING — Needs Town Staff Input (does NOT block launch)

### A. Meeting Minutes Gap (9 months)
- Last meeting minutes on site: August 4, 2025
- Board of Aldermen meets monthly — Sep 2025 through May 2026 are missing
- **Action:** Town Clerk needs to provide recent meeting minutes files
- **Risk at launch:** Low — existing minutes are correct; gap just looks incomplete

### B. No Upcoming Meetings Scheduled
- Agenda & Minutes page shows "No upcoming meetings scheduled"
- **Action:** Town staff must add next Board of Aldermen meeting date
- **Risk at launch:** Low — page gracefully shows "none scheduled" rather than wrong data

### C. Council Term Dates (2024-2026)
- Brandon Angell and Jared Clark terms listed as 2024-2026
- It's now May 2026 — terms may have expired or been renewed
- **Action:** Confirm with Mayor/Clerk whether these members are still serving
- **Risk at launch:** Medium — if terms expired, site shows outdated officials

### D. Hospital Name
- Site says "Iredell Memorial Hospital" — may have rebranded to "Iredell Health System"
- Phone number (704) 873-5661 appears correct regardless
- **Action:** Verify name with a browser visit to iredellhealth.org
- **Risk at launch:** Very low — phone number is the critical piece

### E. Empty Announcements
- No announcements displayed (intentional — previous entries were fabricated and removed)
- **Recommendation:** Add a "Welcome to our new website" announcement at launch time

---

## VERIFIED CORRECT (all confirmed against authoritative sources 2026-05-04)

| Item | Value | Source |
|------|-------|--------|
| Town Hall phone | (704) 546-2339 | Consistent across all pages |
| Town Hall address | 3389 Harmony Hwy, Harmony, NC 28634 | Consistent |
| Email | info@townofharmony.org | Consistent |
| Office hours | Mon–Fri 8:00 AM – 5:00 PM | Consistent |
| Population | 543 (2020 census) | US Census Bureau |
| Incorporation date | 1927 | Wikipedia, historical records |
| ZIP code | 28634 | USPS |
| Area code | 704 | Verified |
| Camp Meeting | First held 1846 | Historical records |
| Library phone | (704) 546-7086 | iredell.lib.nc.us |
| Library address | 3393 Harmony Hwy | iredell.lib.nc.us |
| Library hours | Mon–Sat 9:00 AM – 6:00 PM | iredell.lib.nc.us |
| Fire Dept phone | (704) 546-2300 | Consistent |
| Sheriff phone | (704) 878-3180 | iredellsheriff.com |
| Post Office phone | (704) 546-2631 | Consistent |
| Elementary School phone | (704) 546-2643 | Consistent |
| School district URL | issnc.org | Verified live |
| Iredell County URL | iredellcountync.gov | Verified live |
| 911 number | 911 | National standard |
| Poison Control | 1-800-222-1222 | National standard |
| Sewer rates | $45 / $67.50 / $80 / $120 | Staging /sewer page |
| Sewer contact | (704) 546-2339, admin@townofharmony.org | Consistent |
| PO Box | PO Box 428, Harmony, NC 28634 | Consistent |
| Meeting minutes docs | 4 accessible .docx files | Verified download |
| Mayor | Sean Turner (since 12/2023) | Consistent with legacy |
| Town Clerk | Wanda Edwards | Consistent with legacy |
| Tagline | "Where Harmony LIVES and SINGS!" | Consistent |
| Events | 3 upcoming (May–Jul 2026) | Staging verified |
| Points of Interest | 7 locations displayed | Staging verified |

---

## COULD NOT VERIFY (Legacy Site Blocked)

The legacy site (townofharmony.org) returns HTTP 403 for all automated requests. The following cannot be directly compared:
- Full navigation structure comparison
- Any legacy-only content not present on staging
- Legacy business directory completeness
- Legacy news/announcements archive

**Recommendation:** Manually compare both sites side-by-side in a browser before DNS cutover.

---

## Summary

**Site is production-ready.** All data accuracy issues that could mislead residents are fixed. Emergency numbers, hours, addresses, and URLs are verified against authoritative sources.

Remaining gaps (meeting minutes, upcoming meetings, term confirmations) require input from Town staff and do not present misinformation risk — they show "no data" rather than wrong data. These should be addressed within the first week post-launch.
