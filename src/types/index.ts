// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export type BookingStatus =
  | "idea"
  | "planned"
  | "booked"
  | "confirmed"
  | "completed"
  | "canceled";

export type DayStatus =
  | "draft"
  | "planned"
  | "locked"
  | "active"
  | "completed";

export type TimeBlockType = "morning" | "afternoon" | "evening" | "night";

export type ActivityType =
  | "sightseeing"
  | "museum"
  | "restaurant"
  | "cafe"
  | "bar"
  | "nightclub"
  | "shopping"
  | "beach"
  | "park"
  | "tour"
  | "show"
  | "transport"
  | "transit"
  | "lodging"
  | "rest"
  | "free_time"
  | "other";

export type TransportType =
  | "flight"
  | "train"
  | "bus"
  | "ferry"
  | "car_rental"
  | "taxi"
  | "rideshare"
  | "metro"
  | "walking"
  | "other";

export type LodgingType =
  | "hotel"
  | "airbnb"
  | "hostel"
  | "apartment"
  | "resort"
  | "camping"
  | "other";

export type BudgetCategory =
  | "lodging"
  | "flights"
  | "transport"
  | "food"
  | "activities"
  | "shopping"
  | "other";

export type Tag =
  | "food"
  | "culture"
  | "nature"
  | "nightlife"
  | "shopping"
  | "relaxation"
  | "adventure"
  | "photography"
  | "romantic"
  | "family_friendly"
  | "must_see"
  | "hidden_gem"
  | "local_favorite";

export type PacePreference = "relaxed" | "balanced" | "aggressive";
export type WalkingTolerance = "low" | "medium" | "high";
export type BudgetSensitivity = "budget" | "moderate" | "luxury";

// ============================================================================
// BASE INTERFACES
// ============================================================================

export interface BaseEntity {
  id: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  createdBy: string; // Traveler ID
}

export interface Money {
  amount: number;
  currency: string; // ISO 4217
}

export interface Location {
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  placeId?: string; // Google Places ID
}

export interface TimeRange {
  start: string; // HH:mm
  end: string; // HH:mm
}

export interface DateRange {
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
}

// ============================================================================
// TRIP
// ============================================================================

export interface Trip extends BaseEntity {
  name: string;
  description?: string;
  coverImage?: string;
  dateRange: DateRange;
  status: "planning" | "upcoming" | "active" | "completed" | "archived";
  settings: TripSettings;
  budget: TripBudget;
  isPublic: boolean;
  shareCode?: string;
  travelerIds: string[];
  cityIds: string[];
}

export interface TripSettings {
  pacePreference: PacePreference;
  walkingTolerance: WalkingTolerance;
  budgetSensitivity: BudgetSensitivity;
  interests: {
    food: number;
    culture: number;
    nature: number;
    nightlife: number;
    shopping: number;
    relaxation: number;
  };
  schedule: {
    typicalWakeTime: string;
    typicalSleepTime: string;
    breakfastPreference: "skip" | "light" | "full";
    lunchDurationMinutes: number;
    dinnerTime: string;
  };
  timeBlocks: {
    morning: TimeRange;
    afternoon: TimeRange;
    evening: TimeRange;
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
  name: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  role: "owner" | "editor" | "viewer";
  partyId: string;
  dietaryRestrictions?: string[];
  accessibilityNeeds?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  passportNumber?: string;
  passportExpiry?: string;
}

// ============================================================================
// PARTY
// ============================================================================

export interface Party extends BaseEntity {
  tripId: string;
  name: string;
  color: string;
  travelerIds: string[];
  dateRange: DateRange;
  cityIds: string[];
  isCore: boolean;
}

// ============================================================================
// CITY / REGION
// ============================================================================

export interface City extends BaseEntity {
  tripId: string;
  name: string;
  country: string;
  region?: string;
  timezone: string;
  dateRange: DateRange;
  order: number;
  location: Location;
  description?: string;
  coverImage?: string;
  neighborhoodIds: string[];
  dayIds: string[];
}

export interface Neighborhood extends BaseEntity {
  cityId: string;
  name: string;
  description?: string;
  location: Location;
  vibes: string[];
  walkability: WalkingTolerance;
}

// ============================================================================
// DAY
// ============================================================================

export interface Day extends BaseEntity {
  tripId: string;
  cityId: string;
  dayNumber: number;
  date: string; // YYYY-MM-DD
  dayOfWeek: string;
  status: DayStatus;
  theme?: string;
  neighborhoodId?: string;
  weather?: {
    forecast: string;
    highC: number;
    lowC: number;
    precipitation: number;
    icon: string;
  };
  timeBlocks: TimeBlock[];
  notes: Note[];
  budgetEstimate: Money;
  budgetActual?: Money;
  lodgingId?: string;
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
  name: string;
  type: ActivityType;
  description?: string;
  startTime?: string;
  durationMinutes: number;
  isFlexible: boolean;
  location?: Location;
  status: BookingStatus;
  reservationId?: string;
  tags: Tag[];
  priority: "must_do" | "should_do" | "nice_to_have";
  cost?: Money;
  costSplit: "all" | "per_person" | string[];
  transitToNext?: {
    mode: TransportType;
    durationMinutes: number;
    distance?: string;
    cost?: Money;
    notes?: string;
  };
  tips?: string;
  alternatives?: string[];
  links?: Link[];
  order: number;
}

// ============================================================================
// LODGING
// ============================================================================

export interface Lodging extends BaseEntity {
  tripId: string;
  cityId: string;
  name: string;
  type: LodgingType;
  checkIn: { date: string; time: string };
  checkOut: { date: string; time: string };
  nightCount: number;
  location: Location;
  status: BookingStatus;
  confirmationNumber?: string;
  bookingPlatform?: string;
  bookingUrl?: string;
  roomType?: string;
  amenities?: string[];
  wifiPassword?: string;
  checkInInstructions?: string;
  houseRules?: string;
  contactPhone?: string;
  contactEmail?: string;
  hostName?: string;
  totalCost: Money;
  costPerNight: Money;
  isPrepaid: boolean;
  fileIds?: string[];
  notes?: string;
}

// ============================================================================
// TRANSPORTATION
// ============================================================================

export interface Transport extends BaseEntity {
  tripId: string;
  type: TransportType;
  departure: {
    location: Location;
    dateTime: string;
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
  status: BookingStatus;
  carrier?: string;
  flightNumber?: string;
  trainNumber?: string;
  confirmationNumber?: string;
  bookingReference?: string;
  bookingUrl?: string;
  class?: string;
  seatAssignments?: Record<string, string>;
  totalCost: Money;
  travelerIds: string[];
  fileIds?: string[];
  departureDayId?: string;
  arrivalDayId?: string;
  notes?: string;
}

// ============================================================================
// RESERVATION
// ============================================================================

export interface Reservation extends BaseEntity {
  tripId: string;
  activityId?: string;
  name: string;
  type: "restaurant" | "tour" | "ticket" | "experience" | "spa" | "other";
  dateTime: string;
  durationMinutes?: number;
  location?: Location;
  status: BookingStatus;
  confirmationNumber?: string;
  bookingPlatform?: string;
  bookingUrl?: string;
  partySize: number;
  specialRequests?: string;
  contactPhone?: string;
  contactEmail?: string;
  cost?: Money;
  isPrepaid: boolean;
  depositAmount?: Money;
  cancellationPolicy?: string;
  cancellationDeadline?: string;
  fileIds?: string[];
  notes?: string;
}

// ============================================================================
// BUDGET ITEM
// ============================================================================

export interface BudgetItem extends BaseEntity {
  tripId: string;
  dayId?: string;
  activityId?: string;
  description: string;
  category: BudgetCategory;
  amount: Money;
  isEstimate: boolean;
  splitType: "all" | "per_person" | "custom";
  splitAmounts?: Record<string, Money>;
  paidBy?: string;
  receiptFileId?: string;
  date: string;
  notes?: string;
}

// ============================================================================
// FILES & LINKS
// ============================================================================

export interface File extends BaseEntity {
  tripId: string;
  name: string;
  type: "pdf" | "image" | "document" | "other";
  mimeType: string;
  size: number;
  url: string;
  category:
    | "ticket"
    | "confirmation"
    | "receipt"
    | "passport"
    | "insurance"
    | "map"
    | "other";
  linkedEntityType?: "lodging" | "transport" | "reservation" | "activity";
  linkedEntityId?: string;
}

export interface Link {
  id: string;
  title: string;
  url: string;
  type: "booking" | "map" | "review" | "article" | "menu" | "other";
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
// ACTION ITEMS
// ============================================================================

export interface ActionItem extends BaseEntity {
  type: "book" | "confirm" | "upload" | "decide" | "checkin";
  title: string;
  description: string;
  dueDate?: string;
  priority: "high" | "medium" | "low";
  linkedEntityType: string;
  linkedEntityId?: string;
  status?: "pending" | "completed";
  completedAt?: string;
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
  activityIds: string[];
}

export interface BulkStatusUpdateRequest {
  entityType: "activity" | "reservation" | "lodging" | "transport";
  entityIds: string[];
  newStatus: BookingStatus;
}
