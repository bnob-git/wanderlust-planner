# Wanderlust Planner - UI Component Specifications

## Component Library Overview

Built on **shadcn/ui** with **Tailwind CSS** for consistent, accessible, and customizable components.

---

## 1. Core Layout Components

### AppShell
```
┌─────────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │                        TopNav                               │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ ┌────────┬────────────────────────────────────────────────────┐ │
│ │        │                                                    │ │
│ │ Side   │                                                    │ │
│ │ Nav    │              Main Content Area                     │ │
│ │        │                                                    │ │
│ │        │                                                    │ │
│ │        │                                                    │ │
│ └────────┴────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**TopNav Features:**
- Trip selector dropdown (switch between trips)
- Mode toggle (Planning / Execution)
- Search (⌘K command palette)
- Notifications bell
- User avatar + settings

**SideNav Features:**
- Collapsible (icon-only mode)
- View navigation:
  - 🏠 Command Center
  - 📅 Timeline
  - 📋 Day-by-Day
  - 🚂 Logistics
  - 💰 Budget
  - 📁 Files
  - ⚙️ Settings
- Quick actions section
- Trip progress indicator

---

## 2. Status Components

### StatusPill

Visual indicator for booking/planning status.

```tsx
interface StatusPillProps {
  status: 'idea' | 'planned' | 'booked' | 'confirmed' | 'completed' | 'canceled';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}
```

**Visual Design:**
| Status | Background | Text | Icon |
|--------|------------|------|------|
| `idea` | `gray-100` | `gray-600` | 💭 |
| `planned` | `blue-100` | `blue-700` | 📝 |
| `booked` | `yellow-100` | `yellow-700` | 🎫 |
| `confirmed` | `green-100` | `green-700` | ✓ |
| `completed` | `green-200` | `green-800` | ✓✓ |
| `canceled` | `red-100` | `red-600` | ✗ |

### Tag

Categorization labels for activities.

```tsx
interface TagProps {
  type: 'food' | 'culture' | 'nature' | 'nightlife' | 'shopping' | 'relaxation' | 'adventure' | 'must_see';
  size?: 'sm' | 'md';
  removable?: boolean;
  onRemove?: () => void;
}
```

**Color Mapping:**
| Tag | Color | Emoji |
|-----|-------|-------|
| `food` | `orange` | 🍽️ |
| `culture` | `purple` | 🏛️ |
| `nature` | `green` | 🌿 |
| `nightlife` | `indigo` | 🌙 |
| `shopping` | `pink` | 🛍️ |
| `relaxation` | `cyan` | 😌 |
| `adventure` | `red` | ⛰️ |
| `must_see` | `yellow` | ⭐ |

### PriorityIndicator

```tsx
interface PriorityIndicatorProps {
  priority: 'must_do' | 'should_do' | 'nice_to_have';
}
```

**Visual:**
- `must_do`: 🔴 Red dot + bold text
- `should_do`: 🟡 Yellow dot
- `nice_to_have`: ⚪ Gray dot

---

## 3. Card Components

### ActivityCard

The primary unit for displaying activities in the day view.

```
┌─────────────────────────────────────────────────────────────┐
│ ⋮⋮  09:00  🏛️ Museo del Prado                    [Booked ✓] │
│      ⏱️ 3 hours                                              │
│      📍 Paseo del Prado, s/n                                 │
│      🎫 Reservation: 09:00 entry • €15/person                │
│      ┌─────────────────────────────────────────────────────┐ │
│      │ [Navigate]  [Call]  [Tickets]  [Edit]  [•••]       │ │
│      └─────────────────────────────────────────────────────┘ │
│      Tags: [culture] [must_see]                              │
└─────────────────────────────────────────────────────────────┘
│ 🚶 15 min walk (1.2 km) to next activity                    │
└─────────────────────────────────────────────────────────────┘
```

**Props:**
```tsx
interface ActivityCardProps {
  activity: Activity;
  reservation?: Reservation;
  isEditing?: boolean;
  isDragging?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: BookingStatus) => void;
  onNavigate: () => void;
}
```

**Features:**
- Drag handle (left side, visible on hover)
- Inline time editing (click time to edit)
- Expandable details (click to expand/collapse)
- Quick action buttons (appear on hover)
- Transit connector to next activity
- Context menu (right-click)

### LodgingCard

```
┌─────────────────────────────────────────────────────────────┐
│ 🏨 Hotel Prado ★★★★                           [Confirmed ✓] │
│ ─────────────────────────────────────────────────────────── │
│ 📅 Jun 15-19 (4 nights)                                     │
│ 🕐 Check-in: 15:00  •  Check-out: 11:00                     │
│ 🛏️ 2x Double Rooms  •  Breakfast included                   │
│ 📍 Calle del Prado, 18, Madrid                              │
│ ─────────────────────────────────────────────────────────── │
│ Conf: HP-29481                              Total: €680     │
│ ─────────────────────────────────────────────────────────── │
│ [Navigate]  [Call]  [Email]  [View Booking]                 │
└─────────────────────────────────────────────────────────────┘
```

### TransportCard

```
┌─────────────────────────────────────────────────────────────┐
│ ✈️ IB3214  •  JFK → MAD                       [Confirmed ✓] │
│ ─────────────────────────────────────────────────────────── │
│ 📅 Jun 14, 2026                                             │
│ 🛫 Depart: 18:30 (T7, Gate B26)                             │
│ 🛬 Arrive: 08:15+1 (T4)                                     │
│ ⏱️ Duration: 7h 45m                                         │
│ ─────────────────────────────────────────────────────────── │
│ 👥 4 travelers  •  Economy                                  │
│ 💺 Seats: 24A, 24B, 24C, 25A                                │
│ 📎 e-tickets.pdf                                            │
│ ─────────────────────────────────────────────────────────── │
│ Conf: ABCD12                                                │
│ [Check-in]  [Add to Calendar]  [View Details]               │
└─────────────────────────────────────────────────────────────┘
```

### BudgetSummaryCard

```
┌─────────────────────────────────────────────────────────────┐
│ 💰 BUDGET                                                   │
│ ─────────────────────────────────────────────────────────── │
│ Planned     €5,000                                          │
│ Actual      €4,247                                          │
│ Remaining   €753                                            │
│ ─────────────────────────────────────────────────────────── │
│ ████████████████████████████████████░░░░░░░░░░  85%         │
│ ─────────────────────────────────────────────────────────── │
│ Per Person: €1,062 / €1,250                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Day View Components

### DayHeader

```
┌─────────────────────────────────────────────────────────────┐
│ ▼ Day 1 • Monday, June 15, 2026              🔒 LOCKED      │
│   📍 Madrid - Centro                         ☀️ 32°C        │
│   Theme: Arrival & First Impressions                        │
│   4 activities • €320 estimated                             │
└─────────────────────────────────────────────────────────────┘
```

**Props:**
```tsx
interface DayHeaderProps {
  day: Day;
  city: City;
  neighborhood?: Neighborhood;
  isExpanded: boolean;
  onToggle: () => void;
  onLockToggle: () => void;
  onThemeEdit: (theme: string) => void;
}
```

**Features:**
- Expand/collapse toggle (chevron)
- Lock/unlock button
- Inline theme editing
- Weather display (when available)
- Quick stats (activity count, budget)
- City/neighborhood context

### TimeBlockSection

```
┌─────────────────────────────────────────────────────────────┐
│ ☀️ MORNING (09:00 - 14:00)                      [+ Add]     │
│ ─────────────────────────────────────────────────────────── │
│ [ActivityCard]                                              │
│ [TransitIndicator]                                          │
│ [ActivityCard]                                              │
│ [TransitIndicator]                                          │
│ [ActivityCard]                                              │
└─────────────────────────────────────────────────────────────┘
```

**Props:**
```tsx
interface TimeBlockSectionProps {
  timeBlock: TimeBlock;
  activities: Activity[];
  onAddActivity: () => void;
  onReorder: (activityIds: string[]) => void;
}
```

### TransitIndicator

Visual connector between activities showing travel time/mode.

```
│ 🚶 15 min walk (1.2 km)                                     │
```

or

```
│ 🚕 25 min taxi (~€18)                                       │
```

---

## 5. Timeline Components

### TimelineGantt

Horizontal scrolling Gantt-style view.

```tsx
interface TimelineGanttProps {
  trip: Trip;
  cities: City[];
  days: Day[];
  lodgings: Lodging[];
  transports: Transport[];
  zoomLevel: 'day' | 'week' | 'month';
  onDayClick: (dayId: string) => void;
  onCityResize: (cityId: string, newDates: DateRange) => void;
}
```

**Features:**
- Sticky date header
- Swim lanes (cities, lodging, transport)
- Day cells with theme icons
- Travel day indicators (hatched pattern)
- Drag to resize city durations
- Click to open day detail

### CityPhaseBar

Horizontal bar showing city phases.

```
┌─────────────────────────────────────────────────────────────┐
│ ▓▓▓▓ MADRID ▓▓▓▓│░░░ BARCELONA ░░░│▒▒ VALENCIA ▒▒│         │
│ Jun 15-19       │ Jun 19-25       │ Jun 25-28    │         │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Form Components

### QuickAddActivity

Inline form for rapidly adding activities.

```
┌─────────────────────────────────────────────────────────────┐
│ + Add activity...                                           │
│ ─────────────────────────────────────────────────────────── │
│ [Name                                              ] 🔍     │
│ [Time: 14:00 ▾]  [Duration: 1h ▾]  [Type: Restaurant ▾]    │
│ [Location search...                                ]        │
│                                        [Cancel] [Add]       │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- Auto-suggest from Google Places
- Natural language time parsing ("2pm", "14:00", "afternoon")
- Duration presets (30m, 1h, 2h, 3h, half-day)
- Type auto-detection from name
- Keyboard shortcuts (Enter to add, Esc to cancel)

### InlineEdit

Click-to-edit text fields.

```tsx
interface InlineEditProps {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'time' | 'date' | 'number' | 'currency';
  validation?: (value: string) => boolean;
}
```

### BudgetEntryForm

```
┌─────────────────────────────────────────────────────────────┐
│ + Add Expense                                               │
│ ─────────────────────────────────────────────────────────── │
│ Description: [Dinner at La Barraca              ]           │
│ Amount:      [€] [125.00        ]                           │
│ Category:    [Food & Dining ▾]                              │
│ Date:        [Jun 18, 2026 ▾]                               │
│ Split:       (•) All travelers  ( ) Per person  ( ) Custom  │
│ Paid by:     [Alice ▾]                                      │
│ Receipt:     [📷 Add photo] or [📎 Upload file]             │
│                                        [Cancel] [Save]      │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Map Components

### DayMap

Interactive map showing day's activities with route.

```tsx
interface DayMapProps {
  activities: Activity[];
  lodging?: Lodging;
  showRoute?: boolean;
  onActivityClick: (activityId: string) => void;
}
```

**Features:**
- Activity pins with numbers (order)
- Route line connecting activities
- Lodging pin (distinct style)
- Click pin to highlight activity
- Zoom to fit all pins
- Walking/transit time estimates

### CityOverviewMap

Map showing neighborhoods and key locations.

```tsx
interface CityOverviewMapProps {
  city: City;
  neighborhoods: Neighborhood[];
  lodgings: Lodging[];
  highlightedNeighborhood?: string;
}
```

---

## 8. Data Display Components

### DataTable

Spreadsheet-like table with inline editing.

```tsx
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onRowClick?: (row: T) => void;
  onCellEdit?: (rowId: string, field: string, value: any) => void;
  sortable?: boolean;
  filterable?: boolean;
  selectable?: boolean;
  onSelectionChange?: (selectedIds: string[]) => void;
}
```

**Features:**
- Column sorting (click header)
- Column filtering (dropdown)
- Multi-select (checkboxes)
- Inline cell editing
- Bulk actions toolbar
- Keyboard navigation
- Export to CSV

### StatCard

Metric display card.

```tsx
interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  onClick?: () => void;
}
```

---

## 9. Feedback Components

### ActionRequired

Alert banner for items needing attention.

```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️ ACTION REQUIRED                                          │
│ Book Alhambra tickets - sells out 2-3 months in advance!   │
│ Due: Apr 1, 2026                           [Book Now →]     │
└─────────────────────────────────────────────────────────────┘
```

### Toast

Non-blocking notifications.

```tsx
interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}
```

### ConfirmDialog

Modal for destructive actions.

```tsx
interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
  onConfirm: () => void;
  onCancel: () => void;
}
```

---

## 10. Mobile-Specific Components

### MobileDayView

Optimized single-day view for mobile execution mode.

```
┌─────────────────────────────────────────────────────────────┐
│ ← Back                TODAY                    ☀️ 32°C      │
│ ─────────────────────────────────────────────────────────── │
│ Monday, June 15 • Madrid                                    │
│ ═══════════════════════════════════════════════════════════ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ✓ 09:00  Arrive Madrid                                  │ │
│ │          [Completed]                                    │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ → 10:30  Check-in Hotel Prado                           │ │
│ │          [In Progress]                                  │ │
│ │          📍 Calle del Prado, 18                         │ │
│ │          [Navigate]  [Call Hotel]                       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ○ 12:30  Lunch at Mercado San Miguel                    │ │
│ │          [Upcoming]                                     │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ═══════════════════════════════════════════════════════════ │
│ [+ Quick Note]                              [+ Add Expense] │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- Large touch targets
- Swipe right to complete
- Swipe left to skip
- One-tap navigation
- One-tap call
- Quick note/expense buttons
- Pull to refresh

### BottomSheet

Slide-up panel for mobile actions.

```tsx
interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  snapPoints?: number[];  // e.g., [0.25, 0.5, 0.9]
  children: React.ReactNode;
}
```

---

## 11. Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘ + K` | Open command palette |
| `⌘ + N` | New activity |
| `⌘ + S` | Save changes |
| `⌘ + Z` | Undo |
| `⌘ + ⇧ + Z` | Redo |
| `E` | Edit selected |
| `D` | Duplicate selected |
| `⌫` | Delete selected |
| `↑ / ↓` | Navigate items |
| `← / →` | Navigate days |
| `Space` | Toggle expand/collapse |
| `L` | Lock/unlock day |
| `Esc` | Close modal/cancel |

---

## 12. Accessibility Requirements

- **ARIA labels** on all interactive elements
- **Keyboard navigation** for all features
- **Focus indicators** visible and clear
- **Color contrast** WCAG AA minimum
- **Screen reader** announcements for status changes
- **Reduced motion** support
- **Touch targets** minimum 44x44px on mobile

---

## 13. Animation Guidelines

Using **Framer Motion** for consistent animations:

| Element | Animation | Duration |
|---------|-----------|----------|
| Card expand/collapse | Height + opacity | 200ms |
| Drag and drop | Scale + shadow | 150ms |
| Modal open | Fade + scale | 200ms |
| Toast appear | Slide + fade | 300ms |
| Status change | Color transition | 150ms |
| Page transition | Fade | 150ms |

**Principles:**
- Subtle, purposeful animations
- Never block user interaction
- Respect `prefers-reduced-motion`
- Use spring physics for natural feel
