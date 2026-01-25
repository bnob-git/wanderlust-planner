# Wanderlust Planner - Product Specification

## Executive Summary

**Wanderlust Planner** is a bespoke travel planning dashboard that combines the structural power of Smartsheet with modern UI/UX patterns from Notion, Linear, and Airbnb. It's designed for complex multi-city trips requiring detailed day-by-day planning, logistics coordination, and real-time execution support.

### Design Philosophy

1. **Data-First Architecture** - Rich relational data model enabling multiple views of the same information
2. **Progressive Disclosure** - High-level overview → drill-down to granular detail
3. **Mode-Aware Interface** - Planning Mode (desktop-optimized) vs Execution Mode (mobile-first)
4. **Offline-Resilient** - Critical day data available without connectivity
5. **Collaborative by Default** - Multi-traveler support with role-based access

---

## 1. Core Design Principles

### Modular & Extensible
- Plugin-style architecture for adding new entity types
- Template system for common trip patterns (weekend getaway, multi-week adventure, business + leisure)
- Custom field support per entity type

### Spreadsheet Power, App Experience
- Inline editing with keyboard shortcuts
- Bulk operations (multi-select, batch status change)
- Formula support for budget calculations
- But with: cards, timelines, maps, and rich media

### Planning vs Execution Modes

| Aspect | Planning Mode | Execution Mode |
|--------|---------------|----------------|
| **Primary Device** | Desktop/Tablet | Mobile |
| **Focus** | Full trip overview | Today + Tomorrow |
| **Editing** | Full CRUD | Quick notes, status updates |
| **Offline** | Optional | Required |
| **Key Actions** | Drag-drop, bulk edit | Check-off, navigate, call |

### Responsive Information Density
- **Overview Level**: Trip stats, city phases, budget health
- **City Level**: Days in city, key bookings, neighborhood map
- **Day Level**: Time-blocked activities, transit, reservations
- **Activity Level**: Full details, links, notes, photos

---

## 2. Data Model

See `schema/` directory for complete TypeScript interfaces and database schema.

### Entity Relationship Diagram (Conceptual)

```
Trip (1)
├── Travelers (many)
├── Cities (many, ordered)
│   ├── Days (many, ordered)
│   │   ├── TimeBlocks (many: morning/afternoon/evening)
│   │   │   └── Activities (many, ordered)
│   │   │       ├── Reservations (0-1)
│   │   │       └── BudgetItems (many)
│   │   ├── Lodging (0-1, reference)
│   │   └── Notes (many)
│   └── Neighborhoods (many)
├── Lodgings (many)
├── Transports (many)
├── Reservations (many)
├── BudgetItems (many)
└── Files (many)
```

### Status State Machine

All bookable entities follow this status flow:

```
idea → planned → booked → confirmed → completed
                    ↓
                canceled
```

---

## 3. Dashboard Views

### A. Trip Command Center (Home)

**Purpose**: At-a-glance trip health and quick navigation

**Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│  🌍 Spain Summer 2026                          [Edit] [Share]│
│  Jun 15 - Jul 5 (21 days) • 4 travelers                     │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ CITIES   │ │ BOOKINGS │ │ BUDGET   │ │ DAYS TO  │       │
│  │    5     │ │  18/24   │ │  €4,200  │ │   142    │       │
│  │ visited  │ │ confirmed│ │ of €5000 │ │  departure│       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
├─────────────────────────────────────────────────────────────┤
│  📍 CITY PHASES                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Madrid ████████░░ Barcelona ██████████ Seville ████ │   │
│  │ Jun 15-19        Jun 20-27           Jun 28-Jul 2   │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  ⚠️ ACTION REQUIRED (3)                                     │
│  • Book Alhambra tickets (sells out!) - Granada, Jun 30    │
│  • Confirm airport transfer - Jul 5                        │
│  • Add travel insurance documents                          │
├─────────────────────────────────────────────────────────────┤
│  📅 UPCOMING (Next 7 days of trip)                         │
│  [Mini calendar with key events]                           │
└─────────────────────────────────────────────────────────────┘
```

**Components**:
- **Trip Header**: Name, dates, traveler count, quick actions
- **Stat Cards**: Clickable, drill-down to relevant view
- **City Timeline**: Visual phase indicator with progress
- **Action Items**: Auto-generated from unbooked reservations, missing confirmations
- **Upcoming Preview**: Conditional - shows during trip execution

---

### B. Timeline / Gantt View

**Purpose**: Visual trip structure, identify gaps and overlaps

**Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│  TIMELINE VIEW                    [Month ▾] [Zoom: Week ▾] │
├─────────────────────────────────────────────────────────────┤
│        │ Jun 15 │ 16 │ 17 │ 18 │ 19 │ 20 │ 21 │ 22 │ ...  │
│        │  Sat   │Sun │Mon │Tue │Wed │Thu │Fri │Sat │       │
├────────┼────────┴────┴────┴────┴────┼────┴────┴────┴───────┤
│ CITIES │▓▓▓▓▓▓▓ MADRID ▓▓▓▓▓▓▓▓▓▓▓▓│░░░░ BARCELONA ░░░░░░░│
├────────┼───────────────────────────────────────────────────┤
│ LODGING│ ┌─ Hotel Prado ─────────┐  ┌─ Airbnb Gothic ────  │
├────────┼───────────────────────────────────────────────────┤
│TRANSPORT│        ✈️ MAD           🚄 AVE                    │
├────────┼───────────────────────────────────────────────────┤
│ DAYS   │ D1 │ D2 │ D3 │ D4 │ D5 │ D6 │ D7 │ D8 │          │
│        │ 🏛️ │ 🎨 │ 🚶 │ 🍷 │ 🚄 │ 🏖️ │ 🎭 │ 🍽️ │          │
└────────┴───────────────────────────────────────────────────┘

Legend: 🏛️ Culture  🎨 Art  🚶 Walking  🍷 Food/Wine  🚄 Travel
        🏖️ Beach   🎭 Entertainment  🍽️ Dining
```

**Features**:
- Horizontal scroll with sticky date header
- Zoom levels: Day / Week / Month
- Swim lanes: Cities, Lodging, Transport, Day themes
- Click day cell → opens Day Detail panel
- Drag city boundaries to adjust duration
- Visual indicators for travel days (hatched pattern)

---

### C. Day-by-Day Itinerary View (Core View)

**Purpose**: Detailed planning and execution of each day

**Layout - List Mode**:
```
┌─────────────────────────────────────────────────────────────┐
│  DAY-BY-DAY ITINERARY          [List ▾] [+ Add Day] [Filter]│
├─────────────────────────────────────────────────────────────┤
│  ▼ Day 1 • Saturday, June 15                    🔒 LOCKED   │
│    📍 Madrid - Centro                                       │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ MORNING (9:00 - 13:00)                                  ││
│  │ ┌─────────────────────────────────────────────────────┐ ││
│  │ │ 9:00  ✈️ Arrive MAD T4 • Flight IB3214              │ ││
│  │ │       Status: [Confirmed ✓]  📎 boarding-pass.pdf   │ ││
│  │ ├─────────────────────────────────────────────────────┤ ││
│  │ │       🚕 30 min taxi to hotel (€35)                 │ ││
│  │ ├─────────────────────────────────────────────────────┤ ││
│  │ │ 10:30 🏨 Check-in Hotel Prado                       │ ││
│  │ │       Conf: #HP-29481 • Early check-in requested    │ ││
│  │ ├─────────────────────────────────────────────────────┤ ││
│  │ │ 11:30 🚶 Walk to Plaza Mayor (15 min)               │ ││
│  │ ├─────────────────────────────────────────────────────┤ ││
│  │ │ 12:00 🍽️ Lunch at Mercado San Miguel               │ ││
│  │ │       Tags: [food] [market] [tapas]                 │ ││
│  │ │       Budget: €25/person                            │ ││
│  │ └─────────────────────────────────────────────────────┘ ││
│  │ AFTERNOON (13:00 - 19:00)                               ││
│  │ ┌─────────────────────────────────────────────────────┐ ││
│  │ │ 14:00 🏛️ Museo del Prado                            │ ││
│  │ │       ⏱️ 3 hours • Status: [Booked]                 │ ││
│  │ │       🎫 Reservation: 14:00 entry • €15/person      │ ││
│  │ │       📍 Paseo del Prado, s/n                       │ ││
│  │ │       [Navigate] [Call] [Tickets]                   │ ││
│  │ └─────────────────────────────────────────────────────┘ ││
│  │ EVENING (19:00 - 23:00)                                 ││
│  │ ┌─────────────────────────────────────────────────────┐ ││
│  │ │ 19:30 🍷 Rooftop drinks at Círculo de Bellas Artes  │ ││
│  │ │ 21:00 🍽️ Dinner - TBD (see alternatives below)      │ ││
│  │ │       💡 Options: Sobrino de Botín, La Barraca      │ ││
│  │ └─────────────────────────────────────────────────────┘ ││
│  │ 📝 Notes: First day - keep it light, adjust for jetlag ││
│  └─────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│  ▶ Day 2 • Sunday, June 16 • Madrid - Retiro    ○ PLANNING │
│    4 activities • €120 estimated                            │
├─────────────────────────────────────────────────────────────┤
│  ▶ Day 3 • Monday, June 17 • Madrid - Malasaña  ○ PLANNING │
│    3 activities • €80 estimated                             │
└─────────────────────────────────────────────────────────────┘
```

**Features**:
- **Expand/Collapse**: Click day header to toggle
- **Time Blocks**: Morning/Afternoon/Evening with configurable boundaries
- **Activity Cards**: 
  - Drag handle for reordering
  - Inline time editing
  - Status pill (idea/planned/booked/confirmed)
  - Quick actions (navigate, call, view tickets)
  - Transit time indicators between activities
- **Day Header**:
  - Lock toggle (prevents edits when finalized)
  - City/Neighborhood context
  - Weather forecast (during execution)
  - Day summary stats
- **Quick Add**: `+` button or `/` command to add activity

---

### D. Logistics & Bookings View

**Purpose**: Centralized booking management and document access

**Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│  LOGISTICS & BOOKINGS              [+ Add] [Filter] [Export]│
├─────────────────────────────────────────────────────────────┤
│  FILTERS: [All Types ▾] [All Status ▾] [All Cities ▾]      │
├─────────────────────────────────────────────────────────────┤
│  ✈️ FLIGHTS (2)                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Jun 15 • IB3214 • JFK → MAD                             ││
│  │ Depart: 18:30  Arrive: 08:15+1  Duration: 7h 45m        ││
│  │ Travelers: All (4)  Conf: ABCD12  [Confirmed ✓]         ││
│  │ 📎 e-tickets.pdf  📎 seat-selection.pdf                 ││
│  │ [View Details] [Add to Calendar] [Check-in Link]        ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Jul 5 • VY8920 • BCN → JFK                              ││
│  │ Depart: 11:00  Arrive: 14:30  Duration: 9h 30m          ││
│  │ Travelers: All (4)  Conf: EFGH34  [Booked]              ││
│  │ ⚠️ Seats not selected                                   ││
│  └─────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│  🚄 TRAINS (3)                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Jun 19 • AVE 3042 • Madrid Atocha → Barcelona Sants    ││
│  │ Depart: 10:00  Arrive: 12:30  Duration: 2h 30m          ││
│  │ Class: Preferente  Car: 5  Seats: 3A-3D                 ││
│  │ Conf: 794-281-937  [Confirmed ✓]                        ││
│  └─────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│  🏨 ACCOMMODATIONS (4)                                      │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Hotel Prado ★★★★                                        ││
│  │ Jun 15-19 (4 nights) • Madrid                           ││
│  │ Check-in: 15:00  Check-out: 11:00                       ││
│  │ 2x Double Rooms • Breakfast included                    ││
│  │ Conf: HP-29481  Total: €680  [Confirmed ✓]              ││
│  │ 📍 Calle del Prado, 18  📞 +34 91 123 4567              ││
│  │ [Navigate] [Call] [Email] [Booking.com]                 ││
│  └─────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│  🎫 TICKETS & RESERVATIONS (8)                              │
│  [Table view with: Date, Name, Time, Guests, Status, Conf#]│
└─────────────────────────────────────────────────────────────┘
```

**Features**:
- **Grouped by Type**: Flights, Trains, Ferries, Accommodations, Tickets
- **Status Indicators**: Visual urgency for unconfirmed bookings
- **Document Hub**: All PDFs/confirmations attached to relevant booking
- **Quick Actions**: One-tap navigate, call, email
- **Calendar Sync**: Export individual or all bookings to calendar
- **Checklist Mode**: Pre-departure checklist (all docs downloaded, check-ins complete)

---

### E. Budget & Cost Tracking View

**Purpose**: Financial planning and expense tracking

**Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│  BUDGET TRACKER                    [Edit Budget] [Export]   │
├─────────────────────────────────────────────────────────────┤
│  TRIP TOTAL                                                 │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Planned: €5,000    Actual: €4,247    Remaining: €753   ││
│  │  ████████████████████████████████████░░░░░░░░░░ 85%     ││
│  │  Per Person: €1,062 / €1,250                            ││
│  └─────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│  BY CATEGORY                                                │
│  ┌──────────────┬──────────┬──────────┬──────────┬────────┐│
│  │ Category     │ Planned  │ Actual   │ Variance │ Status ││
│  ├──────────────┼──────────┼──────────┼──────────┼────────┤│
│  │ 🏨 Lodging   │ €1,800   │ €1,720   │ -€80     │ ✓      ││
│  │ ✈️ Flights   │ €1,200   │ €1,180   │ -€20     │ ✓      ││
│  │ 🚄 Transport │ €400     │ €385     │ -€15     │ ✓      ││
│  │ 🍽️ Food      │ €800     │ €612     │ -€188    │ 🔄     ││
│  │ 🎫 Activities│ €500     │ €280     │ -€220    │ 🔄     ││
│  │ 🛍️ Shopping  │ €200     │ €70      │ -€130    │ 🔄     ││
│  │ 📦 Other     │ €100     │ €0       │ -€100    │ 🔄     ││
│  └──────────────┴──────────┴──────────┴──────────┴────────┘│
├─────────────────────────────────────────────────────────────┤
│  DAILY BURN RATE                                            │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Target: €238/day    Actual Avg: €202/day               ││
│  │  [Sparkline chart showing daily spend over trip]        ││
│  └─────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│  RECENT EXPENSES                           [+ Add Expense]  │
│  ┌──────────┬────────────────────┬────────┬───────┬───────┐│
│  │ Date     │ Description        │Category│ Amount│ Split ││
│  ├──────────┼────────────────────┼────────┼───────┼───────┤│
│  │ Jun 18   │ Dinner at Botín    │ Food   │ €180  │ All   ││
│  │ Jun 18   │ Prado Museum       │Activity│ €60   │ All   ││
│  │ Jun 17   │ Taxi to Toledo     │Transport│ €45  │ All   ││
│  │ Jun 17   │ Coffee & pastries  │ Food   │ €24   │ 2 ppl ││
│  └──────────┴────────────────────┴────────┴───────┴───────┘│
├─────────────────────────────────────────────────────────────┤
│  SPLIT SUMMARY (Who owes whom)                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Alice paid: €2,100  |  Bob paid: €1,400                ││
│  │  Carol paid: €500    |  Dan paid: €247                  ││
│  │  ─────────────────────────────────────────────          ││
│  │  Bob owes Alice: €175  |  Carol owes Alice: €287        ││
│  │  Dan owes Alice: €290  |  [Settle Up]                   ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

**Features**:
- **Budget Categories**: Customizable with color coding
- **Planned vs Actual**: Real-time variance tracking
- **Daily Burn Rate**: Helps pace spending
- **Expense Entry**: Quick add with receipt photo capture
- **Split Tracking**: Splitwise-style settlement calculation
- **Currency Support**: Multi-currency with conversion rates
- **Export**: CSV/PDF for expense reports

---

## 4. UX/UI Requirements

### Interaction Patterns

| Pattern | Implementation |
|---------|----------------|
| **Inline Editing** | Click any text field to edit in place, auto-save on blur |
| **Drag & Drop** | Activities within day, days within city, reorder via handle |
| **Keyboard Shortcuts** | `⌘K` command palette, `E` edit, `D` duplicate, `⌫` delete |
| **Bulk Selection** | Shift+click range, ⌘+click individual, bulk status change |
| **Context Menus** | Right-click for full action menu |
| **Quick Add** | `/` trigger for command palette, natural language parsing |

### Visual Design System

**Status Pills**:
- `idea` - Gray outline
- `planned` - Blue filled
- `booked` - Yellow filled
- `confirmed` - Green filled
- `completed` - Green with checkmark
- `canceled` - Red strikethrough

**Tags** (customizable):
- 🍽️ `food` - Orange
- 🏛️ `culture` - Purple
- 🚶 `walking` - Green
- 🌙 `nightlife` - Indigo
- 🏖️ `beach` - Cyan
- 🛍️ `shopping` - Pink
- 😴 `rest` - Gray

**Map Integration**:
- Per-day map showing activity pins with route
- Per-city map showing neighborhoods and key locations
- Click pin → activity details panel
- Walking/transit time estimates between points

### Mobile-Specific Features

- **Today View**: Single-day focus with large touch targets
- **Swipe Actions**: Swipe right = complete, swipe left = skip
- **Quick Add**: Voice input for notes, photo capture for receipts
- **Offline Mode**: Current day + next day cached locally
- **Navigation Integration**: Deep links to Google Maps/Apple Maps

### Lock Day Feature

When a day is "locked":
- Visual indicator (🔒 icon, subtle background tint)
- Editing disabled (view-only)
- Requires explicit unlock action
- Audit log of changes post-lock
- Useful for: finalized reservations, shared itineraries

---

## 5. Configurability

### Trip Settings

```typescript
interface TripSettings {
  // Travelers
  travelerCount: number;
  travelers: Traveler[];
  
  // Pace Preferences
  pacePreference: 'relaxed' | 'balanced' | 'aggressive';
  // relaxed: 2-3 activities/day, long meals, afternoon rest
  // balanced: 3-4 activities/day, moderate pace
  // aggressive: 5+ activities/day, packed schedule
  
  // Physical Preferences
  walkingTolerance: 'low' | 'medium' | 'high';
  // low: <5km/day, prefer transit
  // medium: 5-10km/day
  // high: 10km+/day, walking tours welcome
  
  // Interest Weights (0-100, must sum to 100)
  interests: {
    food: number;        // Restaurants, markets, food tours
    culture: number;     // Museums, historical sites
    nature: number;      // Parks, beaches, hikes
    nightlife: number;   // Bars, clubs, shows
    shopping: number;    // Markets, boutiques
    relaxation: number;  // Spas, beaches, downtime
  };
  
  // Budget
  budgetSensitivity: 'budget' | 'moderate' | 'luxury';
  totalBudget: number;
  currency: string;
  
  // Schedule Preferences
  typicalWakeTime: string;    // "08:00"
  typicalSleepTime: string;   // "23:00"
  mealPreferences: {
    breakfast: 'skip' | 'light' | 'full';
    lunchDuration: number;    // minutes
    dinnerTime: string;       // "20:00"
  };
}
```

### System Adjustments Based on Settings

| Setting | System Behavior |
|---------|-----------------|
| `pacePreference: relaxed` | Max 3 activities/day, 2hr lunch blocks, siesta time |
| `pacePreference: aggressive` | 5+ activities, 45min meals, transit optimization |
| `walkingTolerance: low` | Auto-suggest taxi/transit, cluster nearby activities |
| `budgetSensitivity: budget` | Highlight free activities, budget meal options |
| `interests.food: 60` | Prioritize food experiences, suggest food tours |

### AI-Assisted Planning (Future)

When settings are configured, the system can:
- Suggest optimal activity order to minimize transit
- Recommend rest blocks based on pace preference
- Flag over-scheduled days
- Propose alternatives matching interest profile
- Auto-fill buffer time between activities

---

## 6. Tech Stack Recommendation

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand + React Query
- **Drag & Drop**: dnd-kit
- **Maps**: Mapbox GL JS or Google Maps
- **Charts**: Recharts or Tremor
- **Date Handling**: date-fns
- **Forms**: React Hook Form + Zod validation

### Backend
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (social + email)
- **Storage**: Supabase Storage (PDFs, images)
- **Real-time**: Supabase Realtime (collaborative editing)
- **API**: Next.js API Routes + tRPC

### Mobile
- **Option A**: Progressive Web App (PWA) with offline support
- **Option B**: React Native / Expo for native apps

### Infrastructure
- **Hosting**: Vercel
- **CDN**: Vercel Edge Network
- **Monitoring**: Vercel Analytics + Sentry
- **CI/CD**: GitHub Actions

### Third-Party Integrations
- **Calendar**: Google Calendar API, Apple Calendar
- **Maps**: Google Maps Platform, Mapbox
- **Currency**: Open Exchange Rates API
- **Weather**: OpenWeatherMap or WeatherAPI
- **Flights**: Amadeus API (optional)

---

## 7. Future Enhancements

### Phase 2: AI & Intelligence
- **Smart Suggestions**: "Based on your interests, consider adding..."
- **Conflict Detection**: "This museum is closed on Mondays"
- **Optimization**: "Reorder these activities to save 45 min transit"
- **Natural Language**: "Add dinner near the hotel around 8pm"

### Phase 3: Real-Time Execution
- **Live Alerts**: Flight delays, weather changes, crowd levels
- **Dynamic Rerouting**: "Rain expected at 3pm, swap outdoor activity?"
- **Local Recommendations**: "You're near a highly-rated tapas bar"
- **Check-in Reminders**: Push notifications for reservations

### Phase 4: Social & Sharing
- **Public Itineraries**: Share trip as read-only template
- **Collaborative Planning**: Real-time multi-user editing
- **Trip Journals**: Post-trip photo/note compilation
- **Community Templates**: Browse and clone popular itineraries

### Phase 5: Integrations
- **Booking.com / Airbnb**: Auto-import reservations
- **Google Flights**: Price tracking, booking links
- **TripAdvisor**: Reviews and ratings inline
- **Splitwise**: Expense sync
- **Notion / Google Docs**: Export formatted itinerary

---

## Appendix: Example Day Object

```json
{
  "id": "day_001",
  "tripId": "trip_spain_2026",
  "dayNumber": 1,
  "date": "2026-06-15",
  "cityId": "city_madrid",
  "neighborhoodId": "neighborhood_centro",
  "status": "locked",
  "theme": "Arrival & First Impressions",
  "weather": {
    "forecast": "sunny",
    "highC": 32,
    "lowC": 18
  },
  "timeBlocks": [
    {
      "id": "block_morning",
      "type": "morning",
      "startTime": "09:00",
      "endTime": "13:00",
      "activities": [
        {
          "id": "act_001",
          "type": "transport",
          "name": "Arrive Madrid Barajas T4",
          "startTime": "09:00",
          "duration": 60,
          "status": "confirmed",
          "reservationId": "res_flight_001",
          "notes": "Terminal 4, Gate B26"
        },
        {
          "id": "act_002",
          "type": "transit",
          "name": "Taxi to Hotel",
          "duration": 30,
          "cost": { "amount": 35, "currency": "EUR", "split": "all" }
        },
        {
          "id": "act_003",
          "type": "lodging",
          "name": "Check-in Hotel Prado",
          "startTime": "10:30",
          "duration": 30,
          "status": "confirmed",
          "reservationId": "res_hotel_001",
          "notes": "Early check-in requested"
        }
      ]
    }
  ],
  "notes": [
    {
      "id": "note_001",
      "content": "First day - keep it light, adjust for jetlag",
      "author": "alice",
      "createdAt": "2026-01-15T10:30:00Z"
    }
  ],
  "budgetEstimate": { "amount": 280, "currency": "EUR" },
  "budgetActual": { "amount": 265, "currency": "EUR" }
}
```

---

*Document Version: 1.0*
*Last Updated: January 2026*
