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

export interface Money {
  amount: number;
  currency: string;
}

export interface Location {
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;
}

export interface TimeRange {
  start: string;
  end: string;
}

export interface DateRange {
  start: string;
  end: string;
}

export interface Trip {
  id: string;
  name: string;
  description?: string;
  coverImage?: string;
  dateRange: DateRange;
  status: "planning" | "upcoming" | "active" | "completed" | "archived";
  settings: TripSettings;
  budget: TripBudget;
  isPublic: boolean;
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

export interface Traveler {
  id: string;
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
}

export interface Party {
  id: string;
  tripId: string;
  name: string;
  color: string;
  travelerIds: string[];
  dateRange: DateRange;
  cityIds: string[];
  isCore: boolean;
}

export interface City {
  id: string;
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

export interface Neighborhood {
  id: string;
  cityId: string;
  name: string;
  description?: string;
  location: Location;
  vibes: string[];
  walkability: WalkingTolerance;
}

export interface Day {
  id: string;
  tripId: string;
  cityId: string;
  dayNumber: number;
  date: string;
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

export interface Activity {
  id: string;
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

export interface Lodging {
  id: string;
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
  notes?: string;
}

export interface Transport {
  id: string;
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
  departureDayId?: string;
  arrivalDayId?: string;
  notes?: string;
}

export interface Reservation {
  id: string;
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
  notes?: string;
}

export interface BudgetItem {
  id: string;
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

export interface Link {
  id: string;
  title: string;
  url: string;
  type: "booking" | "map" | "review" | "article" | "menu" | "other";
}

export interface Note {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
}

export interface ActionItem {
  id: string;
  type: "book" | "confirm" | "upload" | "decide" | "checkin";
  title: string;
  description: string;
  dueDate?: string;
  priority: "high" | "medium" | "low";
  linkedEntityType: string;
  linkedEntityId?: string;
}

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
