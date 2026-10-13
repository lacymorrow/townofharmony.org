# Emergency Components

This directory contains emergency-related components for the Town of Harmony website.

## Components

### EmergencyAlert

- **File**: `emergency-alert.tsx`
- **Purpose**: Individual emergency alert display component
- **Features**:
  - Supports different alert levels (info, warning, critical)
  - Optional dismiss functionality
  - Compact mode for smaller displays
  - Shows affected areas and contact information

### EmergencyAlertsList

- **File**: `emergency-alerts-list.tsx`
- **Purpose**: Lists emergency alerts with filtering and pagination
- **Features**:
  - Server-side data fetching from database
  - Active-only or all alerts filtering
  - Alert level priority ordering
  - Links to detailed alert pages

### EmergencyContacts

- **File**: `emergency-contacts.tsx`
- **Purpose**: Directory of emergency contact information
- **Features**:
  - Organized by service type
  - Contact details with click-to-call/email links
  - Hours of operation and descriptions
  - Additional resources section

### EmergencyServices

- **File**: `emergency-services.tsx`
- **Purpose**: Comprehensive emergency services information
- **Features**:
  - Categorized by emergency type
  - Preparedness tips for each service
  - Contact information and descriptions
  - Service availability status

### EmergencyDetail

- **File**: `emergency-detail.tsx`
- **Purpose**: Detailed view of individual emergency alert
- **Features**:
  - Full alert information display
  - Timeline of alert status changes
  - Affected areas mapping
  - Emergency contact integration

## Database Integration

All components integrate with the `emergencyAlerts` table from `schema-town.ts`:

```typescript
{
  id: number;
  title: string;
  message: string;
  level: 'info' | 'warning' | 'critical';
  isActive: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
  affectedAreas: string[];
  instructions: string | null;
  contactInfo: object | null;
  externalUrl: string | null;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}
```

## Pages

### Emergency Information Page

- **Path**: `/emergency`
- **File**: `src/app/(public)/emergency/page.tsx`
- **Features**:
  - Active alerts display
  - Emergency services directory
  - Contact information
  - Emergency preparedness guide

### Emergency Alerts Page

- **Path**: `/emergency/alerts`
- **File**: `src/app/(public)/emergency/alerts/page.tsx`
- **Features**:
  - Complete list of all alerts (active and inactive)
  - Alert filtering and search
  - Links to detailed alert pages

### Emergency Alert Detail Page

- **Path**: `/emergency/alerts/[id]`
- **File**: `src/app/(public)/emergency/alerts/[id]/page.tsx`
- **Features**:
  - Full alert details
  - Metadata for SEO
  - Related emergency information

## Updated Components

### EmergencyBanner

- **File**: `src/components/town/emergency-banner.tsx` (existing, updated)
- **Changes**:
  - Enhanced database querying with proper ordering
  - Added link to alert detail pages
  - Improved active alert detection

## Usage

```typescript
import {
  EmergencyAlert,
  EmergencyAlertsList,
  EmergencyContacts,
  EmergencyServices,
  EmergencyDetail
} from '@/components/town/emergency';

// Display active alerts
<EmergencyAlertsList activeOnly={true} limit={5} />

// Show all emergency services
<EmergencyServices />

// Display emergency contacts
<EmergencyContacts />
```

## Features

- **Real-time Alert System**: Displays currently active emergency alerts
- **Multi-level Alerts**: Supports info, warning, and critical alert levels
- **Time-based Activation**: Alerts can be scheduled with start/end times
- **Geographic Targeting**: Alerts can target specific areas
- **Mobile Responsive**: All components work on mobile devices
- **Accessibility**: Components follow WCAG guidelines
- **SEO Optimized**: Proper metadata and structured data

## Emergency Contact Information

The components include comprehensive emergency contact information for:

- Police (911)
- Fire Department (911)
- Emergency Medical Services (911)
- Emergency Management Office
- Public Works Department
- Animal Control
- Utility Emergency Hotline
- Poison Control Center
- State and county emergency services

## Preparedness Resources

Emergency preparedness information includes:

- Emergency kit checklists
- Family communication plans
- Home emergency procedures
- Weather preparedness guides
- Communication and alert systems
