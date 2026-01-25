/**
 * Wanderlust Planner - Core Type Definitions
 * Complete data schema for travel planning application
 */

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export type BookingStatus = 
  | 'idea'       // Just an idea, not committed
  | 'planned'    // Committed to doing, not yet booked
  | 'booked'     // Reservation made, awaiting confirmation
  | 'confirmed'  // Confirmation received
  | 'completed'  // Done/checked-in/attended
  | 'canceled';  // Canceled

export type DayStatus = 
  | 'draft'      // Still planning
  | 'planned'    // Plan complete, not locked
  | 'locked'     // Finalized, no edits
  | 'active'     // Currently executing (today)
  | 'completed'; // Day has passed

export type TimeBlockType = 'morning' | 'afternoon' | 'evening' | 'night';

export type ActivityType = 
  | 'sightseeing'
  | 'museum'
  | 'restaurant'
  | 'cafe'
  | 'bar'
  | 'nightclub'
  | 'shopping'
  | 'beach'
  | 'park'
  | 'tour'
  | 'show'
  | 'transport'
  | 'transit'
  | 'lodging'
  | 'rest'
  | 'free_time'
  | 'other';

export type TransportType = 
  | 'flight'
  | 'train'
  | 'bus'
  | 'ferry'
  | 'car_rental'
  | 'taxi'
  | 'rideshare'
  | 'metro'
  | 'walking'
  | 'other';

export type LodgingType = 
  | 'hotel'
  | 'airbnb'
  | 'hostel'
  | 'apartment'
  | 'resort'
  | 'camping'
  | 'other';

export type BudgetCategory = 
  | 'lodging'
  | 'flights'
  | 'transport'
  | 'food'
  | 'activities'
  | 'shopping'
  | 'other';

export type PacePreference = 'relaxed' | 'balanced' | 'aggressive';
export type WalkingTolerance = 'low' | 'medium' | 'high';
export type BudgetSensitivity = 'budget' | 'moderate' | 'luxury';

export type Tag = 
  | 'food'
  | 'culture'
  | 'nature'
  | 'nightlife'
  | 'shopping'
  | 'relaxation'
  | 'adventure'
  | 'photography'
  | 'romantic'
  | 'family_friendly'
  | 'must_see'
  | 'hidden_gem'
  | 'local_favorite';

// ============================================================================
// BASE INTERFACES
// ============================================================================

export interface BaseEntity {
  id: string;
  createdAt: string;      // ISO 8601
  updatedAt: string;      // ISO 8601
  createdBy: string;      // Traveler ID
}

export interface Money {
  amount: number;
  currency: string;       // ISO 4217 (EUR, USD, etc.)
}

export interface Location {
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;       // Google Places ID
}

export interface TimeRange {
  start: string;          // HH:mm format
  end: string;            // HH:mm format
}

export interface DateRange {
  start: string;          // YYYY-MM-DD
  end: string;            // YYYY-MM-DD
}

// ============================================================================
// TRIP
// ============================================================================

export interface Trip extends BaseEntity {
  name: string;
  description?: string;
  coverImage?: string;
  dateRange: DateRange;
  status: 'planning' | 'upcoming' | 'active' | 'completed' | 'archived';
  
  // Settings
  settings: TripSettings;
  
  // Budget
  budget: TripBudget;
  
  // Metadata
  isPublic: boolean;
  shareCode?: string;
  
  // Relationships (IDs)
  travelerIds: string[];
  cityIds: string[];
}

export interface TripSettings {
  pacePreference: PacePreference;
  walkingTolerance: WalkingTolerance;
  budgetSensitivity: BudgetSensitivity;
  
  interests: {
    food: number;         // 0-100
    culture: number;
    nature: number;
    nightlife: number;
    shopping: number;
    relaxation: number;
  };
  
  schedule: {
    typicalWakeTime: string;    // HH:mm
    typicalSleepTime: string;   // HH:mm
    breakfastPreference: 'skip' | 'light' | 'full';
    lunchDurationMinutes: number;
    dinnerTime: string;         // HH:mm
  };
  
  timeBlocks: {
    morning: TimeRange;         // Default: 08:00-13:00
    afternoon: TimeRange;       // Default: 13:00-19:00
    evening: TimeRange;         // Default: 19:00-23:00
  };
}

export interface TripBudget {
  total: Money;
  byCategory: Record<BudgetCategory, Money>;
  perPersonDaily?: Money;
}

// ============================================================================
// TRAVELER
// ============================================================================

export interface Traveler extends BaseEntity {
  tripId: string;
  
  // Profile
  name: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  
  // Role
  role: 'owner' | 'editor' | 'viewer';
  
  // Preferences (can override trip settings)
  dietaryRestrictions?: string[];
  accessibilityNeeds?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  
  // Documents
  passportNumber?: string;
  passportExpiry?: string;
}

// ============================================================================
// CITY / REGION
// ============================================================================

export interface City extends BaseEntity {
  tripId: string;
  
  name: string;
  country: string;
  region?: string;
  timezone: string;       // IANA timezone
  
  dateRange: DateRange;
  order: number;          // Position in trip sequence
  
  // Location
  location: Location;
  
  // Metadata
  description?: string;
  coverImage?: string;
  
  // Relationships
  neighborhoodIds: string[];
  dayIds: string[];
}

export interface Neighborhood extends BaseEntity {
  cityId: string;
  
  name: string;
  description?: string;
  location: Location;
  
  // Characteristics
  vibes: string[];        // e.g., ['trendy', 'historic', 'foodie']
  walkability: 'low' | 'medium' | 'high';
}

// ============================================================================
// DAY
// ============================================================================

export interface Day extends BaseEntity {
  tripId: string;
  cityId: string;
  
  dayNumber: number;      // 1-indexed
  date: string;           // YYYY-MM-DD
  dayOfWeek: string;      // Monday, Tuesday, etc.
  
  status: DayStatus;
  theme?: string;         // e.g., "Art & Culture Day"
  
  // Location context
  neighborhoodId?: string;
  
  // Weather (populated closer to date)
  weather?: {
    forecast: string;
    highC: number;
    lowC: number;
    precipitation: number;  // percentage
    icon: string;
  };
  
  // Time blocks
  timeBlocks: TimeBlock[];
  
  // Notes
  notes: Note[];
  
  // Budget
  budgetEstimate: Money;
  budgetActual?: Money;
  
  // Relationships
  lodgingId?: string;     // Reference to that night's lodging
}

export interface TimeBlock {
  id: string;
  type: TimeBlockType;
  timeRange: TimeRange;
  activityIds: string[];
}

// ============================================================================
// ACTIVITY
// ============================================================================

export interface Activity extends BaseEntity {
  tripId: string;
  dayId: string;
  timeBlockId: string;
  
  // Core info
  name: string;
  type: ActivityType;
  description?: string;
  
  // Timing
  startTime?: string;     // HH:mm (optional for flexible activities)
  durationMinutes: number;
  isFlexible: boolean;    // Can be moved around
  
  // Location
  location?: Location;
  
  // Status & booking
  status: BookingStatus;
  reservationId?: string;
  
  // Categorization
  tags: Tag[];
  priority: 'must_do' | 'should_do' | 'nice_to_have';
  
  // Cost
  cost?: Money;
  costSplit: 'all' | 'per_person' | string[];  // string[] = specific traveler IDs
  
  // Transit to next activity
  transitToNext?: {
    mode: TransportType;
    durationMinutes: number;
    distance?: string;
    cost?: Money;
    notes?: string;
  };
  
  // Additional info
  tips?: string;
  alternatives?: string[];  // Backup options
  links?: Link[];
  
  // Order within time block
  order: number;
}

// ============================================================================
// LODGING
// ============================================================================

export interface Lodging extends BaseEntity {
  tripId: string;
  cityId: string;
  
  // Core info
  name: string;
  type: LodgingType;
  
  // Dates
  checkIn: {
    date: string;         // YYYY-MM-DD
    time: string;         // HH:mm
  };
  checkOut: {
    date: string;
    time: string;
  };
  nightCount: number;
  
  // Location
  location: Location;
  
  // Booking
  status: BookingStatus;
  confirmationNumber?: string;
  bookingPlatform?: string;  // Booking.com, Airbnb, direct
  bookingUrl?: string;
  
  // Details
  roomType?: string;
  amenities?: string[];
  wifiPassword?: string;
  checkInInstructions?: string;
  houseRules?: string;
  
  // Contact
  contactPhone?: string;
  contactEmail?: string;
  hostName?: string;
  
  // Cost
  totalCost: Money;
  costPerNight: Money;
  isPrepaid: boolean;
  
  // Files
  fileIds: string[];
  
  // Notes
  notes?: string;
}

// ============================================================================
// TRANSPORTATION
// ============================================================================

export interface Transport extends BaseEntity {
  tripId: string;
  
  type: TransportType;
  
  // Route
  departure: {
    location: Location;
    dateTime: string;     // ISO 8601
    terminal?: string;
    gate?: string;
    platform?: string;
  };
  arrival: {
    location: Location;
    dateTime: string;
    terminal?: string;
  };
  
  durationMinutes: number;
  
  // Booking
  status: BookingStatus;
  carrier?: string;       // Airline, train company, etc.
  flightNumber?: string;
  trainNumber?: string;
  
  confirmationNumber?: string;
  bookingReference?: string;
  bookingUrl?: string;
  
  // Seating
  class?: string;         // Economy, Business, First, Preferente
  seatAssignments?: Record<string, string>;  // travelerId -> seat
  
  // Cost
  totalCost: Money;
  
  // Travelers
  travelerIds: string[];  // Who is on this transport
  
  // Files
  fileIds: string[];
  
  // Notes
  notes?: string;
  
  // Linked days
  departureDayId?: string;
  arrivalDayId?: string;
}

// ============================================================================
// RESERVATION
// ============================================================================

export interface Reservation extends BaseEntity {
  tripId: string;
  activityId?: string;    // Optional link to activity
  
  // Core info
  name: string;
  type: 'restaurant' | 'tour' | 'ticket' | 'experience' | 'spa' | 'other';
  
  // Timing
  dateTime: string;       // ISO 8601
  durationMinutes?: number;
  
  // Location
  location?: Location;
  
  // Booking
  status: BookingStatus;
  confirmationNumber?: string;
  bookingPlatform?: string;
  bookingUrl?: string;
  
  // Details
  partySize: number;
  specialRequests?: string;
  
  // Contact
  contactPhone?: string;
  contactEmail?: string;
  
  // Cost
  cost?: Money;
  isPrepaid: boolean;
  depositAmount?: Money;
  
  // Cancellation
  cancellationPolicy?: string;
  cancellationDeadline?: string;
  
  // Files
  fileIds: string[];
  
  // Notes
  notes?: string;
}

// ============================================================================
// BUDGET ITEM
// ============================================================================

export interface BudgetItem extends BaseEntity {
  tripId: string;
  dayId?: string;
  activityId?: string;
  
  // Core info
  description: string;
  category: BudgetCategory;
  
  // Amount
  amount: Money;
  isEstimate: boolean;    // true = planned, false = actual
  
  // Split
  splitType: 'all' | 'per_person' | 'custom';
  splitAmounts?: Record<string, Money>;  // travelerId -> amount
  paidBy?: string;        // travelerId who paid
  
  // Receipt
  receiptFileId?: string;
  
  // Date
  date: string;           // YYYY-MM-DD
  
  // Notes
  notes?: string;
}

// ============================================================================
// FILES & LINKS
// ============================================================================

export interface File extends BaseEntity {
  tripId: string;
  
  name: string;
  type: 'pdf' | 'image' | 'document' | 'other';
  mimeType: string;
  size: number;           // bytes
  url: string;
  
  // Categorization
  category: 'ticket' | 'confirmation' | 'receipt' | 'passport' | 'insurance' | 'map' | 'other';
  
  // Relationships
  linkedEntityType?: 'lodging' | 'transport' | 'reservation' | 'activity';
  linkedEntityId?: string;
}

export interface Link {
  id: string;
  title: string;
  url: string;
  type: 'booking' | 'map' | 'review' | 'article' | 'menu' | 'other';
}

// ============================================================================
// NOTES
// ============================================================================

export interface Note {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
}

// ============================================================================
// COMPUTED / VIEW TYPES
// ============================================================================

export interface TripSummary {
  trip: Trip;
  totalDays: number;
  citiesCount: number;
  
  bookingStats: {
    total: number;
    confirmed: number;
    pending: number;
    needsAction: number;
  };
  
  budgetStats: {
    planned: Money;
    actual: Money;
    remaining: Money;
    percentUsed: number;
  };
  
  upcomingActions: ActionItem[];
  
  daysUntilDeparture: number;
}

export interface ActionItem {
  id: string;
  type: 'book' | 'confirm' | 'upload' | 'decide' | 'checkin';
  title: string;
  description: string;
  dueDate?: string;
  priority: 'high' | 'medium' | 'low';
  linkedEntityType: string;
  linkedEntityId: string;
}

export interface DayView {
  day: Day;
  city: City;
  neighborhood?: Neighborhood;
  lodging?: Lodging;
  
  activities: (Activity & {
    reservation?: Reservation;
  })[];
  
  transports: Transport[];
  
  budgetItems: BudgetItem[];
  
  previousDay?: { id: string; date: string };
  nextDay?: { id: string; date: string };
}

export interface TimelineView {
  trip: Trip;
  phases: {
    city: City;
    days: {
      day: Day;
      highlights: string[];
      hasTravel: boolean;
    }[];
  }[];
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface CreateTripRequest {
  name: string;
  description?: string;
  dateRange: DateRange;
  settings?: Partial<TripSettings>;
  budget?: Partial<TripBudget>;
}

export interface AddActivityRequest {
  dayId: string;
  timeBlockId: string;
  name: string;
  type: ActivityType;
  startTime?: string;
  durationMinutes: number;
  location?: Location;
  tags?: Tag[];
}

export interface ReorderActivitiesRequest {
  dayId: string;
  timeBlockId: string;
  activityIds: string[];  // New order
}

export interface BulkStatusUpdateRequest {
  entityType: 'activity' | 'reservation' | 'lodging' | 'transport';
  entityIds: string[];
  newStatus: BookingStatus;
}
