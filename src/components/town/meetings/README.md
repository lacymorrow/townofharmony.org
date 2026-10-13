# Town Meetings Components

This directory contains all the components for the Town of Harmony meetings functionality.

## Components Overview

### Core Components

- **`meeting-card.tsx`** - Card component to display meeting information in lists
- **`meeting-detail.tsx`** - Detailed view of a single meeting with all information
- **`meetings-list.tsx`** - Server component that fetches and displays paginated meetings
- **`meetings-pagination.tsx`** - Client component for paginating through meeting results

### Specialized Components

- **`meeting-documents.tsx`** - Displays meeting documents (agenda, minutes, recordings)
- **`meetings-calendar.tsx`** - Calendar view of meetings with month navigation
- **`upcoming-meetings.tsx`** - Shows upcoming meetings for use in other pages

### Utility

- **`index.ts`** - Barrel export for easy importing

## Features

### Database Integration

- Uses the `meetings` table from `schema-town.ts`
- Supports all meeting fields: agenda, minutes, videos, audio, documents
- Public/private meeting visibility
- Type-safe queries with Drizzle ORM

### Filtering & Search

- Filter by meeting type (Council, Planning, Zoning, etc.)
- Filter by date (month/year)
- Filter by status (upcoming, past, has recordings, has minutes)
- Pagination support

### Document Support

- PDF agenda and minutes display
- Video recording integration (YouTube, etc.)
- Audio recording support
- Additional document attachments
- Download links for all documents

### Calendar View

- Month-by-month calendar display
- Meeting preview on calendar days
- Navigation between months
- Today highlighting
- Meeting type badges

### Responsive Design

- Mobile-friendly layouts
- Card-based design consistent with other town components
- Proper loading states and error handling

## Usage

### Pages

The components are used in:

- `/src/app/(public)/meetings/page.tsx` - Main meetings listing page
- `/src/app/(public)/meetings/[slug]/page.tsx` - Individual meeting detail page

### Import Examples

```tsx
// Import individual components
import { MeetingCard } from "@/components/town/meetings/meeting-card";
import { MeetingsCalendar } from "@/components/town/meetings/meetings-calendar";

// Import from barrel export
import { MeetingCard, MeetingsCalendar } from "@/components/town/meetings";
```

### Component Integration

These components follow the same patterns as other town components:

- Server components for data fetching
- Client components for interactivity
- Consistent styling with Shadcn/UI
- Proper TypeScript types
- Error handling and loading states

## Database Schema Usage

The components work with the `meetings` table which includes:

- Basic info: title, slug, type, date, time, location
- Content: agenda (MDX), minutes (MDX)
- Documents: agendaUrl, minutesUrl, documents array
- Media: videoUrl, audioUrl
- Attendees: JSON array of attendee information
- Visibility: isPublic boolean

## Styling

Components use:

- Tailwind CSS for styling
- Shadcn/UI components (Card, Badge, Button, etc.)
- Lucide React icons
- Consistent with town design system
- Hover states and transitions
- Responsive breakpoints
