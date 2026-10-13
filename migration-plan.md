# Town of Harmony Website Migration Plan

## Django/Wagtail to Next.js/Shipkit Migration

### Overview

This document outlines the comprehensive migration plan for transitioning the Town of Harmony website from Django/Wagtail CMS to a modern Next.js/Shipkit stack.

### Tech Stack Comparison

| Component    | Current (Django)     | New (Next.js)                |
| ------------ | -------------------- | ---------------------------- |
| Framework    | Django + Wagtail CMS | Next.js 15 + Shipkit         |
| Database     | PostgreSQL           | PostgreSQL with Drizzle ORM  |
| Auth         | Django Auth          | NextAuth.js v5 / Better Auth |
| CMS          | Wagtail              | Payload CMS v3               |
| File Storage | Local Media          | S3-compatible storage        |
| Styling      | Template-based       | Tailwind CSS + Shadcn/UI     |
| Email        | Django Email         | Resend                       |
| Cache        | Redis                | Redis                        |
| Deployment   | Docker               | Vercel/Docker                |

### Migration Phases

## Phase 1: Database Schema Migration

**Status: Pending**

### Core Models to Migrate:

#### 1. User & Authentication

- **Django Model**: `django.contrib.auth.User`
- **Next.js Schema**: Use Better Auth with extended user schema
- **Fields to Map**:
  - username → email (primary identifier)
  - email → email
  - first_name, last_name → name
  - is_staff, is_superuser → role (admin/user)
  - date_joined → createdAt
  - last_login → lastLoginAt

#### 2. Home Page

- **Django Model**: `HomePage` (StreamField-based)
- **Payload CMS**: Create Homepage global
- **Blocks to Convert**:
  - home_blocks → Payload blocks (Hero, Features, News, Events)
  - Rich text fields → MDX content

#### 3. News System

- **Django Models**: `NewsPage`, `NewsDetailPage`
- **Payload Collections**:
  - `News` collection with fields:
    - title, slug, content, date, author
    - featured image
    - categories/tags
- **Features to Preserve**:
  - News listing with filtering
  - Individual news pages
  - Latest news display on homepage

#### 4. Events System

- **Django Models**: `EventsPage`, `EventPage`
- **Payload Collections**:
  - `Events` collection with fields:
    - title, slug, description
    - event_date, event_time, duration
    - location, organizer
    - registration_link
    - featured image
- **Features to Preserve**:
  - Upcoming events listing
  - Calendar integration capability
  - Event filtering by date

#### 5. Business Directory

- **Django Model**: `BusinessPage`, `BusinessDetailPage`
- **Payload Collections**:
  - `Businesses` collection with fields:
    - name, description, category
    - contact info (phone, email, website)
    - address, hours
    - logo/images

#### 6. Elections

- **Django Model**: `ElectionPage`
- **Payload Collections**:
  - `Elections` collection
  - `Candidates` collection
  - Voting information pages

#### 7. History

- **Django Model**: `HistoryPage`
- **Payload**: Static MDX pages or CMS pages
- **Content**: Historical timeline, documents, photos

#### 8. Permits

- **Django Model**: `PermitsPage`
- **Payload Collections**:
  - `Permits` collection
  - Permit application forms
  - Status tracking

#### 9. Meetings

- **Django Model**: `MeetingPage`
- **Payload Collections**:
  - `Meetings` collection
  - Meeting minutes/agendas
  - Video links

#### 10. Emergency Information

- **Django Model**: `EmergencyPage`
- **Payload Global**: Emergency banner/alerts
- **Features**: Alert system, emergency contacts

## Phase 2: Content Migration

**Status: Pending**

### Migration Strategy:

1. Export Django data to JSON/CSV
2. Create migration scripts in `/scripts/migrate/`
3. Transform data to match new schema
4. Import into Payload CMS

### Content Types:

- **Static Pages**: Convert to MDX files
- **Dynamic Content**: Import to Payload CMS
- **Media Files**: Migrate to cloud storage
- **Rich Text**: Convert to MDX/Portable Text

## Phase 3: Feature Implementation

**Status: Pending**

### Priority Features:

#### High Priority:

1. **Public Pages**
   - Homepage with news/events
   - News listing and details
   - Events calendar
   - Contact information
   - Emergency alerts

2. **Forms & Interactions**
   - Contact forms
   - Permit applications
   - Event registrations
   - Newsletter signup

3. **Search Functionality**
   - Global site search
   - Content filtering
   - Category/tag browsing

#### Medium Priority:

1. **User Accounts**
   - Resident portal
   - Permit status checking
   - Event registration management

2. **Admin Features**
   - Content management via Payload
   - User management
   - Analytics dashboard

#### Low Priority:

1. **Advanced Features**
   - Payment processing for permits
   - Online voting system
   - Community forum

## Phase 4: UI/UX Migration

**Status: Pending**

### Design System:

1. **Components to Build**:
   - Navigation header with mega menu
   - Footer with quick links
   - News cards
   - Event cards
   - Alert banners
   - Forms (contact, permits, etc.)
   - Image galleries
   - Maps integration

2. **Responsive Design**:
   - Mobile-first approach
   - Tablet optimization
   - Desktop experience

3. **Accessibility**:
   - WCAG 2.1 AA compliance
   - Screen reader support
   - Keyboard navigation

## Phase 5: API Development

**Status: Pending**

### API Routes Needed:

```
/api/news - News listing and filtering
/api/events - Events with date filtering
/api/search - Global search
/api/contact - Contact form submission
/api/permits - Permit applications
/api/emergency - Emergency alerts
```

### Server Actions:

- Form submissions
- File uploads
- Email notifications
- Data validation

## Phase 6: Testing & Quality Assurance

**Status: Pending**

### Testing Strategy:

1. **Unit Tests**: Components and utilities
2. **Integration Tests**: API routes and database
3. **E2E Tests**: Critical user paths
4. **Performance Tests**: Lighthouse scores
5. **Accessibility Tests**: WCAG compliance

## Phase 7: Deployment & Go-Live

**Status: Pending**

### Deployment Steps:

1. **Environment Setup**:
   - Production database
   - Environment variables
   - CDN configuration
   - Email service setup

2. **Data Migration**:
   - Final content sync
   - Media files transfer
   - User data migration
   - URL redirects setup

3. **DNS & Domain**:
   - Update DNS records
   - SSL certificates
   - Domain verification

4. **Monitoring**:
   - Error tracking (Sentry)
   - Analytics (Vercel/PostHog)
   - Performance monitoring
   - Uptime monitoring

## Implementation Timeline

| Week | Phase                | Tasks                              |
| ---- | -------------------- | ---------------------------------- |
| 1    | Setup & Schema       | Database schema, Payload CMS setup |
| 2    | Content Migration    | Scripts, data transformation       |
| 3-4  | Core Pages           | Homepage, News, Events             |
| 5    | Forms & Interactions | Contact, permits, registrations    |
| 6    | User Features        | Auth, user portal                  |
| 7    | Admin Features       | CMS training, documentation        |
| 8    | Testing              | QA, bug fixes, performance         |
| 9    | Deployment           | Go-live preparation                |
| 10   | Post-Launch          | Monitoring, optimization           |

## File Structure

```
/TOH-new/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx (Homepage)
│   │   │   ├── news/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── events/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── business/
│   │   │   ├── elections/
│   │   │   ├── permits/
│   │   │   ├── meetings/
│   │   │   └── emergency/
│   │   ├── (admin)/
│   │   │   └── admin/
│   │   └── api/
│   ├── components/
│   │   ├── town/ (custom components)
│   │   └── ui/ (shadcn components)
│   ├── server/
│   │   ├── actions/
│   │   └── services/
│   └── lib/
│       └── payload/
│           ├── collections/
│           └── blocks/
```

## Migration Scripts Location

Create these scripts in `/scripts/migrate/`:

- `export-django-data.py` - Export from Django
- `transform-data.ts` - Transform to new schema
- `import-to-payload.ts` - Import to Payload
- `migrate-media.ts` - Media migration
- `validate-migration.ts` - Data validation

## Next Steps

1. ✅ Review existing Django models and data
2. ⏳ Create database schema in Drizzle
3. ⏳ Set up Payload CMS collections
4. ⏳ Build migration scripts
5. ⏳ Implement core pages
6. ⏳ Test and validate
7. ⏳ Deploy to staging
8. ⏳ Final migration and go-live

## Notes

- Preserve all existing URLs or set up proper redirects
- Maintain SEO value through proper meta tags
- Ensure all forms maintain same functionality
- Keep emergency alert system operational during transition
- Document all custom business logic for reimplementation
