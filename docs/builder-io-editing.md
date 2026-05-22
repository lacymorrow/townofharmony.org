# Builder.io Editing Guide

How to manage content on the Town of Harmony website using Builder.io.

## Quick Start

1. Log in at [builder.io](https://builder.io) with the Town of Harmony workspace credentials.
2. Open a page or data model from the left sidebar.
3. Make changes in the visual editor.
4. Click **Publish** in the top-right corner.
5. Changes appear on the live site within 60 seconds (data models) or 1 hour (pages).

---

## How Content Works

The site pulls content from two sources:

- **Pages** -- Visual layouts built in Builder.io's drag-and-drop editor. These define what the visitor sees on routes like `/news`, `/events`, `/about`, etc.
- **Data models** -- Structured entries (news articles, events, team members, businesses, etc.) that feed into page components. Think of these as rows in a spreadsheet that components read from.

When you publish a change in Builder.io, the site fetches the updated content on its next revalidation cycle. No code deployment is needed.

---

## Editing Pages

### Accessing the Visual Editor

1. Go to **Content > Page** in the Builder.io sidebar.
2. Click any page to open it in the visual editor.
3. You'll see a live preview of the page with editable blocks.

### Using Town Components

Pages are built from pre-built Town of Harmony components. To add one:

1. Click the **+** button in the editor or drag from the **Insert** panel.
2. Search for a component by name (they all start with "Town").
3. Drop it onto the page.
4. Configure its properties in the right panel.

Available components:

| Component | Purpose | Key Properties |
|-----------|---------|----------------|
| **TownHero** | Hero banner with image and CTA | title, subtitle, image, ctaText, ctaHref |
| **TownQuickLinks** | Grid of icon links | links (list of icon, title, description, href) |
| **TownLatestNews** | Recent news articles | limit (number to show) |
| **TownUpcomingEvents** | Upcoming event list | limit (number to show) |
| **TownCommunitySpotlight** | Featured community content | badge, title, description, linkHref, image |
| **TownNewsGrid** | Full news listing with search/filters | itemsPerPage, showFilters, showSearch |
| **TownEventsList** | Event listing with filters | itemsPerPage, showFilters |
| **TownMeetingsList** | Government meetings list | itemsPerPage, showCalendar |
| **TownBusinessDirectory** | Business directory with search | itemsPerPage, showSearch |
| **TownElectionsList** | Elections listing | itemsPerPage |
| **TownTeamMembers** | Staff and officials | categoryFilter, limit |
| **TownPointsOfInterest** | Points of interest with categories | showCategoryFilter |
| **TownHistoryTimeline** | Historical timeline | type (all, period, landmark) |
| **TownResourcesList** | Documents, services, links | type filter |
| **TownNewsDetail** | Single news article | slug (auto-detected from URL) |
| **TownEventDetail** | Single event | slug (auto-detected from URL) |
| **TownMeetingDetail** | Single meeting with agenda/minutes | slug (auto-detected from URL) |
| **TownBusinessDetail** | Single business | slug (auto-detected from URL) |
| **TownElectionDetail** | Single election with candidates | slug (auto-detected from URL) |
| **TownPageHeader** | Section header bar | title, subtitle, variant (sage/wheat/barn-red) |
| **TownEmergencyServices** | Emergency contact list | (reads from data model, no config) |
| **TownEmergencyAlertsList** | Active emergency alerts | showAll, limit |
| **TownContactForm** | Contact submission form | (no config, security handled internally) |
| **TownAgendaMinutes** | Meeting agenda/minutes tabs | defaultTab (agenda or minutes) |
| **TownInteractiveMap** | Leaflet map of the town | height, minHeight |

### Page Settings

Each page has metadata in the **Page Settings** panel (gear icon):

- **URL** -- The path where this page appears (e.g., `/news`). Must match exactly for the page to render.
- **Title** -- Used in the browser tab and SEO.
- **Description** -- Used in search engine results and social sharing.

### Detail Page Templates

Detail pages like `/news/:slug` and `/events/:slug` use URL templates. The `:slug` part is a wildcard that matches any value. The corresponding detail component (e.g., TownNewsDetail) automatically reads the slug from the URL to display the right entry.

### Previewing Changes

Before publishing, click **Preview** in the top bar. You can also preview directly on the live site by appending `?builder.preview=true` to any page URL.

---

## Managing Data Models

Data models hold the structured content that components display. To edit them:

1. Go to **Models** in the Builder.io sidebar.
2. Select a model (e.g., `town-news`, `town-event`).
3. Click an existing entry to edit, or **+ New** to create one.
4. Fill in the fields and click **Publish**.

### Available Data Models

**Content collections** -- entries with detail pages:

| Model | Fields | Used By |
|-------|--------|---------|
| `town-news` | title, slug, excerpt, content, featuredImage, publishedAt, categories, tags, author | TownNewsGrid, TownNewsDetail, TownLatestNews |
| `town-event` | title, slug, description, eventDate, eventTime, location, organizer, categories | TownEventsList, TownEventDetail, TownUpcomingEvents |
| `town-meeting` | title, slug, type, meetingDate, meetingTime, location, agenda, minutes | TownMeetingsList, TownMeetingDetail |
| `town-business` | name, slug, description, category, email, phone, website, address | TownBusinessDirectory, TownBusinessDetail |
| `town-election` | title, slug, electionDate, registrationDeadline, candidates, pollingLocations | TownElectionsList, TownElectionDetail |

**Reference data** -- entries without their own pages:

| Model | Purpose |
|-------|---------|
| `town-team-member` | Mayor, aldermen, staff |
| `town-emergency-service` | Emergency contacts |
| `town-history-article` | Historical periods and landmarks |
| `town-point-of-interest` | Parks, buildings, attractions |
| `town-resource` | Documents, services, external links |
| `town-announcement` | Emergency alerts and announcements |
| `town-settings` | Site-wide settings (title, contact info, hours) |
| `town-navigation` | Menu links and quick links |
| `town-homepage-slide` | Homepage hero slides |
| `town-sewer-rate` | Sewer billing rates |
| `town-map-business` | Map pins (synced from Google Places) |

### Important: Slugs

For content collections (news, events, meetings, businesses, elections), the **slug** field determines the URL. A news article with slug `spring-cleanup-2025` appears at `/news/spring-cleanup-2025`. Changing a slug changes the URL and breaks any existing links to the old URL.

---

## How Changes Reach the Live Site

Builder.io content is fetched by the site with caching:

| Content Type | Cache Duration | What This Means |
|-------------|---------------|-----------------|
| Data model entries | 60 seconds | Edits to news, events, team members, etc., appear within ~1 minute |
| Pages | 1 hour (ISR) | Layout changes to pages appear within ~1 hour without a redeploy |
| Preview mode | No cache | Adding `?builder.preview=true` always shows the latest draft |

If you need a page change to appear immediately, a developer can trigger a redeployment on Vercel.

---

## Common Editing Tasks

### Add a News Article

1. Go to **Models > town-news > + New**.
2. Fill in: title, slug (URL-friendly, e.g., `town-hall-renovation`), excerpt, content, featuredImage, publishedAt, categories.
3. Set status to `published`.
4. Click **Publish**.
5. The article appears on `/news` within 60 seconds and at `/news/{slug}`.

### Update an Event

1. Go to **Models > town-event**.
2. Find and click the event.
3. Edit the fields (date, time, location, description).
4. Click **Publish**.

### Add a Team Member

1. Go to **Models > town-team-member > + New**.
2. Fill in: name, title, category (Executive / Board of Aldermen / Staff), email, phone, image.
3. Set `isActive` to true.
4. Set `priority` (built-in Builder.io field) to control display position.
5. Click **Publish**.

### Post an Emergency Alert

1. Go to **Models > town-announcement > + New**.
2. Fill in: title, message/content, level (`info`, `warning`, or `critical`).
3. Set `isActive` to true, `startsAt` to now.
4. Click **Publish**.
5. The alert appears on the emergency alerts page within 60 seconds.

### Edit the Homepage Layout

1. Go to **Content > Page** and open the Homepage.
2. Rearrange, add, or remove Town components in the visual editor.
3. Click **Publish**.
4. The updated layout appears within 1 hour (or immediately with `?builder.preview=true`).

### Update Sewer Rates

1. Go to **Models > town-sewer-rate**.
2. Edit the relevant rate entry (change `monthlyRate`, `description`, etc.).
3. Click **Publish**.

---

## For Developers

### Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `NEXT_PUBLIC_BUILDER_API_KEY` | Public API key for reading content | Yes (enables Builder) |
| `BUILDER_PRIVATE_KEY` | Private key for seed scripts (write access) | Only for seeding |

Builder auto-enables when `NEXT_PUBLIC_BUILDER_API_KEY` is set. The feature flag `NEXT_PUBLIC_FEATURE_BUILDER_ENABLED` is derived from its presence.

### Architecture

```
Builder.io CDN API
  |
  v
builder-data-server.ts  -- server-side data fetching (60s revalidation)
  |
  v
town-data.ts / town-data-client.ts  -- unified data layer
  |
  v
Town components (Server Components + "use client" where needed)
  |
  v
Pages: catch-all [...slug]/page.tsx (ISR, 1hr) or explicit routes
```

- `src/lib/builder-io/builder-io.tsx` -- Client component that renders Builder visual pages via `BuilderComponent`.
- `src/lib/builder-data-server.ts` -- `fetchBuilderContent()` and `fetchBuilderEntry()` for data models; `getBuilderPageContent()` for visual pages.
- `src/builder-registry.ts` -- Registers generic Builder components.
- `src/builder-registry-town.ts` -- Registers all 25 Town-specific components with their editable inputs.
- `src/lib/builder-model-definitions.ts` -- TypeScript definitions for all data model schemas.
- `src/app/(app)/(town)/[...slug]/page.tsx` -- Catch-all route that serves Builder pages with ISR.
- `src/app/(app)/(town)/page.tsx` -- Homepage with Builder content or hardcoded fallback.

### Explicit Routes (Not Served by Builder)

These paths have dedicated Next.js routes and skip the Builder catch-all:

`/`, `/accessibility`, `/map`, `/our-team`, `/pay/sewer`, `/pay/sewer/cancel`, `/pay/sewer/success`, `/privacy`, `/resources/community-center-reservation`, `/resources/park-reservation`, `/sewer`

### Seed Scripts

Seed scripts populate Builder.io with initial content from the static data in `src/data/town/`.

```bash
# Seed pages (creates visual page layouts)
pnpm exec tsx scripts/seed-builder-pages.ts
pnpm exec tsx scripts/seed-builder-pages.ts --dry-run          # preview only
pnpm exec tsx scripts/seed-builder-pages.ts --only-new         # skip existing
pnpm exec tsx scripts/seed-builder-pages.ts --overwrite-edited  # overwrite human edits

# Seed data models (creates data entries)
pnpm exec tsx scripts/seed-builder-data.ts
pnpm exec tsx scripts/seed-builder-data.ts --dry-run
pnpm exec tsx scripts/seed-builder-data.ts --models-only       # create models, skip data
pnpm exec tsx scripts/seed-builder-data.ts --data-only         # skip model creation
pnpm exec tsx scripts/seed-builder-data.ts --model=town-news   # seed one model

# Cleanup
pnpm exec tsx scripts/clean-builder-pages.ts
pnpm exec tsx scripts/clean-builder-data.ts

# Fix SEO fields
pnpm exec tsx scripts/fix-builder-seo.ts
```

The seed scripts are idempotent. They match existing entries by URL (pages) or key fields (data) and skip human-edited entries by default (detected via a 60-second edit threshold).

### Fallback Behavior

When Builder.io is not configured (`NEXT_PUBLIC_BUILDER_API_KEY` unset):

- The homepage renders hardcoded React components (HeroSection, QuickLinks, LatestNews, UpcomingEvents, CommunitySpotlight).
- Data-driven components read from static TypeScript files in `src/data/town/`.
- The catch-all route falls back to a small set of static params (agenda-minutes, permits, emergency/alerts, elections).
