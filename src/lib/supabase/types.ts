/**
 * Database row types and transformer functions
 * Maps between snake_case DB columns and camelCase TypeScript types
 */

import type {
  Trip,
  TripSettings,
  TripBudget,
  Traveler,
  City,
  Day,
  TimeBlock,
  Activity,
  Lodging,
  Transport,
  Reservation,
  BudgetItem,
  ActionItem,
  Party,
  BudgetCategory,
  Money,
  Location,
} from "@/types";

// ============================================================================
// Database Row Types (snake_case, matching schema/database.sql)
// ============================================================================

export interface DbTrip {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  start_date: string;
  end_date: string;
  status: string;
  settings: Record<string, unknown> | null;
  budget_total_amount: number | null;
  budget_total_currency: string;
  budget_by_category: Record<string, { amount: number; currency: string }> | null;
  is_public: boolean;
  share_code: string | null;
}

export interface DbTraveler {
  id: string;
  created_at: string;
  updated_at: string;
  trip_id: string;
  user_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: string;
  dietary_restrictions: string[] | null;
  accessibility_needs: string[] | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relationship: string | null;
  passport_number: string | null;
  passport_expiry: string | null;
}

export interface DbCity {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  trip_id: string;
  name: string;
  country: string;
  region: string | null;
  timezone: string;
  start_date: string;
  end_date: string;
  sort_order: number;
  location_name: string | null;
  location_address: string | null;
  location_lat: number | null;
  location_lng: number | null;
  location_place_id: string | null;
  description: string | null;
  cover_image_url: string | null;
}

export interface DbDay {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  trip_id: string;
  city_id: string;
  neighborhood_id: string | null;
  lodging_id: string | null;
  day_number: number;
  date: string;
  status: string;
  theme: string | null;
  weather: Record<string, unknown> | null;
  budget_estimate_amount: number | null;
  budget_estimate_currency: string;
  budget_actual_amount: number | null;
  budget_actual_currency: string;
  // Joined time_blocks
  time_blocks?: DbTimeBlock[];
}

export interface DbTimeBlock {
  id: string;
  created_at: string;
  day_id: string;
  type: string;
  start_time: string;
  end_time: string;
}

export interface DbActivity {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  trip_id: string;
  day_id: string;
  time_block_id: string;
  reservation_id: string | null;
  name: string;
  type: string;
  description: string | null;
  start_time: string | null;
  duration_minutes: number;
  is_flexible: boolean;
  location_name: string | null;
  location_address: string | null;
  location_lat: number | null;
  location_lng: number | null;
  location_place_id: string | null;
  status: string;
  tags: string[] | null;
  priority: string;
  cost_amount: number | null;
  cost_currency: string | null;
  cost_split: string | null;
  transit_mode: string | null;
  transit_duration_minutes: number | null;
  transit_distance: string | null;
  transit_cost_amount: number | null;
  transit_cost_currency: string | null;
  transit_notes: string | null;
  tips: string | null;
  alternatives: string[] | null;
  sort_order: number;
}

export interface DbLodging {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  trip_id: string;
  city_id: string;
  name: string;
  type: string;
  check_in_date: string;
  check_in_time: string;
  check_out_date: string;
  check_out_time: string;
  night_count: number;
  location_name: string | null;
  location_address: string | null;
  location_lat: number | null;
  location_lng: number | null;
  location_place_id: string | null;
  status: string;
  confirmation_number: string | null;
  booking_platform: string | null;
  booking_url: string | null;
  room_type: string | null;
  amenities: string[] | null;
  wifi_password: string | null;
  check_in_instructions: string | null;
  house_rules: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  host_name: string | null;
  total_cost_amount: number | null;
  total_cost_currency: string;
  cost_per_night_amount: number | null;
  cost_per_night_currency: string;
  is_prepaid: boolean;
  notes: string | null;
}

export interface DbTransport {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  trip_id: string;
  departure_day_id: string | null;
  arrival_day_id: string | null;
  type: string;
  departure_location_name: string | null;
  departure_location_address: string | null;
  departure_lat: number | null;
  departure_lng: number | null;
  departure_datetime: string;
  departure_terminal: string | null;
  departure_gate: string | null;
  departure_platform: string | null;
  arrival_location_name: string | null;
  arrival_location_address: string | null;
  arrival_lat: number | null;
  arrival_lng: number | null;
  arrival_datetime: string;
  arrival_terminal: string | null;
  duration_minutes: number;
  status: string;
  carrier: string | null;
  flight_number: string | null;
  train_number: string | null;
  confirmation_number: string | null;
  booking_reference: string | null;
  booking_url: string | null;
  class: string | null;
  seat_assignments: Record<string, string> | null;
  total_cost_amount: number | null;
  total_cost_currency: string;
  notes: string | null;
  // Joined transport_travelers
  transport_travelers?: { traveler_id: string }[];
}

export interface DbReservation {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  trip_id: string;
  activity_id: string | null;
  name: string;
  type: string;
  datetime: string;
  duration_minutes: number | null;
  location_name: string | null;
  location_address: string | null;
  location_lat: number | null;
  location_lng: number | null;
  location_place_id: string | null;
  status: string;
  confirmation_number: string | null;
  booking_platform: string | null;
  booking_url: string | null;
  party_size: number;
  special_requests: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  cost_amount: number | null;
  cost_currency: string | null;
  is_prepaid: boolean;
  deposit_amount: number | null;
  deposit_currency: string | null;
  cancellation_policy: string | null;
  cancellation_deadline: string | null;
  notes: string | null;
}

export interface DbBudgetItem {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  trip_id: string;
  day_id: string | null;
  activity_id: string | null;
  description: string;
  category: string;
  amount: number;
  currency: string;
  is_estimate: boolean;
  split_type: string;
  split_amounts: Record<string, { amount: number; currency: string }> | null;
  paid_by: string | null;
  receipt_file_id: string | null;
  date: string;
  notes: string | null;
}

export interface DbParty {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  trip_id: string;
  name: string;
  color: string | null;
  date_start: string;
  date_end: string;
  is_core: boolean;
  // Joined relations
  party_travelers?: { traveler_id: string }[];
  party_cities?: { city_id: string }[];
}

export interface DbActionItem {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  trip_id: string;
  type: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: string;
  linked_entity_type: string | null;
  linked_entity_id: string | null;
  status: string;
  completed_at: string | null;
}

// ============================================================================
// Helper functions
// ============================================================================

function buildLocation(
  name: string | null,
  address: string | null,
  lat: number | null,
  lng: number | null,
  placeId: string | null
): Location {
  return {
    name: name || "",
    address: address || undefined,
    latitude: lat || undefined,
    longitude: lng || undefined,
    placeId: placeId || undefined,
  };
}

function buildMoney(amount: number | null, currency: string | null): Money {
  return {
    amount: amount || 0,
    currency: currency || "EUR",
  };
}

function stripTimeSeconds(time: string): string {
  // Convert "HH:MM:SS" to "HH:MM"
  const parts = time.split(":");
  return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : time;
}

function getDayOfWeek(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long" });
}

// ============================================================================
// DB → TS Transformer Functions
// ============================================================================

export function dbTripToTrip(
  row: DbTrip,
  travelerIds: string[],
  cityIds: string[]
): Trip {
  const settings = (row.settings || {}) as Record<string, unknown>;
  const budgetByCategory = (row.budget_by_category || {}) as Record<
    string,
    { amount: number; currency: string }
  >;

  const defaultCategories: BudgetCategory[] = [
    "lodging",
    "flights",
    "transport",
    "food",
    "activities",
    "shopping",
    "other",
  ];
  const byCategory: Record<BudgetCategory, Money> = {} as Record<BudgetCategory, Money>;
  for (const cat of defaultCategories) {
    const entry = budgetByCategory[cat];
    byCategory[cat] = entry
      ? { amount: entry.amount, currency: entry.currency }
      : { amount: 0, currency: row.budget_total_currency || "EUR" };
  }

  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by || "",
    name: row.name,
    description: row.description || undefined,
    coverImage: row.cover_image_url || undefined,
    dateRange: {
      start: row.start_date,
      end: row.end_date,
    },
    status: row.status as Trip["status"],
    settings: {
      pacePreference: (settings.pacePreference as TripSettings["pacePreference"]) || "balanced",
      walkingTolerance: (settings.walkingTolerance as TripSettings["walkingTolerance"]) || "medium",
      budgetSensitivity: (settings.budgetSensitivity as TripSettings["budgetSensitivity"]) || "moderate",
      interests: (settings.interests as TripSettings["interests"]) || {
        food: 20,
        culture: 20,
        nature: 20,
        nightlife: 10,
        shopping: 10,
        relaxation: 20,
      },
      schedule: (settings.schedule as TripSettings["schedule"]) || {
        typicalWakeTime: "08:00",
        typicalSleepTime: "23:00",
        breakfastPreference: "light",
        lunchDurationMinutes: 60,
        dinnerTime: "20:00",
      },
      timeBlocks: (settings.timeBlocks as TripSettings["timeBlocks"]) || {
        morning: { start: "08:00", end: "13:00" },
        afternoon: { start: "13:00", end: "19:00" },
        evening: { start: "19:00", end: "23:00" },
      },
    },
    budget: {
      total: buildMoney(row.budget_total_amount, row.budget_total_currency),
      byCategory,
    } as TripBudget,
    isPublic: row.is_public,
    shareCode: row.share_code || undefined,
    travelerIds,
    cityIds,
  };
}

export function dbTravelerToTraveler(
  row: DbTraveler,
  partyId: string
): Traveler {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.user_id || "",
    tripId: row.trip_id,
    name: row.name,
    email: row.email || undefined,
    phone: row.phone || undefined,
    avatarUrl: row.avatar_url || undefined,
    role: row.role as Traveler["role"],
    partyId,
    dietaryRestrictions: row.dietary_restrictions || undefined,
    accessibilityNeeds: row.accessibility_needs || undefined,
    emergencyContact:
      row.emergency_contact_name
        ? {
            name: row.emergency_contact_name,
            phone: row.emergency_contact_phone || "",
            relationship: row.emergency_contact_relationship || "",
          }
        : undefined,
    passportNumber: row.passport_number || undefined,
    passportExpiry: row.passport_expiry || undefined,
  };
}

export function dbCityToCity(
  row: DbCity,
  dayIds: string[],
  neighborhoodIds: string[]
): City {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by || "",
    tripId: row.trip_id,
    name: row.name,
    country: row.country,
    region: row.region || undefined,
    timezone: row.timezone,
    dateRange: {
      start: row.start_date,
      end: row.end_date,
    },
    order: row.sort_order,
    location: buildLocation(
      row.location_name || row.name,
      row.location_address,
      row.location_lat,
      row.location_lng,
      row.location_place_id
    ),
    description: row.description || undefined,
    coverImage: row.cover_image_url || undefined,
    neighborhoodIds,
    dayIds,
  };
}

export function dbDayToDay(row: DbDay): Day {
  const timeBlocks: TimeBlock[] = (row.time_blocks || []).map((tb) =>
    dbTimeBlockToTimeBlock(tb)
  );

  // Ensure we have at least the standard time blocks
  const existingTypes = new Set(timeBlocks.map((tb) => tb.type));
  const defaultBlocks: { type: TimeBlock["type"]; start: string; end: string }[] = [
    { type: "morning", start: "08:00", end: "13:00" },
    { type: "afternoon", start: "13:00", end: "19:00" },
    { type: "evening", start: "19:00", end: "23:00" },
  ];
  for (const def of defaultBlocks) {
    if (!existingTypes.has(def.type)) {
      timeBlocks.push({
        id: `${row.id}_${def.type}`,
        type: def.type,
        timeRange: { start: def.start, end: def.end },
        activityIds: [],
      });
    }
  }

  // Sort time blocks: morning, afternoon, evening, night
  const order = { morning: 0, afternoon: 1, evening: 2, night: 3 };
  timeBlocks.sort(
    (a, b) => (order[a.type] ?? 4) - (order[b.type] ?? 4)
  );

  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by || "",
    tripId: row.trip_id,
    cityId: row.city_id,
    dayNumber: row.day_number,
    date: row.date,
    dayOfWeek: getDayOfWeek(row.date),
    status: row.status as Day["status"],
    theme: row.theme || undefined,
    neighborhoodId: row.neighborhood_id || undefined,
    weather: row.weather
      ? (row.weather as Day["weather"])
      : undefined,
    timeBlocks,
    notes: [],
    budgetEstimate: buildMoney(
      row.budget_estimate_amount,
      row.budget_estimate_currency
    ),
    budgetActual: row.budget_actual_amount != null
      ? buildMoney(row.budget_actual_amount, row.budget_actual_currency)
      : undefined,
    lodgingId: row.lodging_id || undefined,
  };
}

export function dbTimeBlockToTimeBlock(row: DbTimeBlock): TimeBlock {
  return {
    id: row.id,
    type: row.type as TimeBlock["type"],
    timeRange: {
      start: stripTimeSeconds(row.start_time),
      end: stripTimeSeconds(row.end_time),
    },
    activityIds: [], // Will be populated by activities query
  };
}

export function dbActivityToActivity(row: DbActivity): Activity {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by || "",
    tripId: row.trip_id,
    dayId: row.day_id,
    timeBlockId: row.time_block_id,
    name: row.name,
    type: row.type as Activity["type"],
    description: row.description || undefined,
    startTime: row.start_time ? stripTimeSeconds(row.start_time) : undefined,
    durationMinutes: row.duration_minutes,
    isFlexible: row.is_flexible,
    location:
      row.location_name
        ? buildLocation(
            row.location_name,
            row.location_address,
            row.location_lat,
            row.location_lng,
            row.location_place_id
          )
        : undefined,
    status: row.status as Activity["status"],
    reservationId: row.reservation_id || undefined,
    tags: (row.tags || []) as Activity["tags"],
    priority: row.priority as Activity["priority"],
    cost:
      row.cost_amount != null
        ? buildMoney(row.cost_amount, row.cost_currency)
        : undefined,
    costSplit: (row.cost_split || "all") as Activity["costSplit"],
    transitToNext:
      row.transit_mode
        ? {
            mode: row.transit_mode as Activity["transitToNext"] extends
              | { mode: infer M }
              | undefined
              ? M
              : never,
            durationMinutes: row.transit_duration_minutes || 0,
            distance: row.transit_distance || undefined,
            cost:
              row.transit_cost_amount != null
                ? buildMoney(
                    row.transit_cost_amount,
                    row.transit_cost_currency
                  )
                : undefined,
            notes: row.transit_notes || undefined,
          }
        : undefined,
    tips: row.tips || undefined,
    alternatives: row.alternatives || undefined,
    order: row.sort_order,
  };
}

export function dbLodgingToLodging(row: DbLodging): Lodging {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by || "",
    tripId: row.trip_id,
    cityId: row.city_id,
    name: row.name,
    type: row.type as Lodging["type"],
    checkIn: {
      date: row.check_in_date,
      time: stripTimeSeconds(row.check_in_time),
    },
    checkOut: {
      date: row.check_out_date,
      time: stripTimeSeconds(row.check_out_time),
    },
    nightCount: row.night_count,
    location: buildLocation(
      row.location_name || row.name,
      row.location_address,
      row.location_lat,
      row.location_lng,
      row.location_place_id
    ),
    status: row.status as Lodging["status"],
    confirmationNumber: row.confirmation_number || undefined,
    bookingPlatform: row.booking_platform || undefined,
    bookingUrl: row.booking_url || undefined,
    roomType: row.room_type || undefined,
    amenities: row.amenities || undefined,
    wifiPassword: row.wifi_password || undefined,
    checkInInstructions: row.check_in_instructions || undefined,
    houseRules: row.house_rules || undefined,
    contactPhone: row.contact_phone || undefined,
    contactEmail: row.contact_email || undefined,
    hostName: row.host_name || undefined,
    totalCost: buildMoney(row.total_cost_amount, row.total_cost_currency),
    costPerNight: buildMoney(
      row.cost_per_night_amount,
      row.cost_per_night_currency
    ),
    isPrepaid: row.is_prepaid,
    notes: row.notes || undefined,
  };
}

export function dbTransportToTransport(row: DbTransport): Transport {
  const travelerIds = (row.transport_travelers || []).map(
    (tt) => tt.traveler_id
  );

  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by || "",
    tripId: row.trip_id,
    type: row.type as Transport["type"],
    departure: {
      location: buildLocation(
        row.departure_location_name,
        row.departure_location_address,
        row.departure_lat,
        row.departure_lng,
        null
      ),
      dateTime: row.departure_datetime,
      terminal: row.departure_terminal || undefined,
      gate: row.departure_gate || undefined,
      platform: row.departure_platform || undefined,
    },
    arrival: {
      location: buildLocation(
        row.arrival_location_name,
        row.arrival_location_address,
        row.arrival_lat,
        row.arrival_lng,
        null
      ),
      dateTime: row.arrival_datetime,
      terminal: row.arrival_terminal || undefined,
    },
    durationMinutes: row.duration_minutes,
    status: row.status as Transport["status"],
    carrier: row.carrier || undefined,
    flightNumber: row.flight_number || undefined,
    trainNumber: row.train_number || undefined,
    confirmationNumber: row.confirmation_number || undefined,
    bookingReference: row.booking_reference || undefined,
    bookingUrl: row.booking_url || undefined,
    class: row.class || undefined,
    seatAssignments: row.seat_assignments || undefined,
    totalCost: buildMoney(row.total_cost_amount, row.total_cost_currency),
    travelerIds,
    departureDayId: row.departure_day_id || undefined,
    arrivalDayId: row.arrival_day_id || undefined,
    notes: row.notes || undefined,
  };
}

export function dbReservationToReservation(row: DbReservation): Reservation {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by || "",
    tripId: row.trip_id,
    activityId: row.activity_id || undefined,
    name: row.name,
    type: row.type as Reservation["type"],
    dateTime: row.datetime,
    durationMinutes: row.duration_minutes || undefined,
    location:
      row.location_name
        ? buildLocation(
            row.location_name,
            row.location_address,
            row.location_lat,
            row.location_lng,
            row.location_place_id
          )
        : undefined,
    status: row.status as Reservation["status"],
    confirmationNumber: row.confirmation_number || undefined,
    bookingPlatform: row.booking_platform || undefined,
    bookingUrl: row.booking_url || undefined,
    partySize: row.party_size,
    specialRequests: row.special_requests || undefined,
    contactPhone: row.contact_phone || undefined,
    contactEmail: row.contact_email || undefined,
    cost:
      row.cost_amount != null
        ? buildMoney(row.cost_amount, row.cost_currency)
        : undefined,
    isPrepaid: row.is_prepaid,
    depositAmount:
      row.deposit_amount != null
        ? buildMoney(row.deposit_amount, row.deposit_currency)
        : undefined,
    cancellationPolicy: row.cancellation_policy || undefined,
    cancellationDeadline: row.cancellation_deadline || undefined,
    notes: row.notes || undefined,
  };
}

export function dbBudgetItemToBudgetItem(row: DbBudgetItem): BudgetItem {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by || "",
    tripId: row.trip_id,
    dayId: row.day_id || undefined,
    activityId: row.activity_id || undefined,
    description: row.description,
    category: row.category as BudgetCategory,
    amount: buildMoney(row.amount, row.currency),
    isEstimate: row.is_estimate,
    splitType: row.split_type as BudgetItem["splitType"],
    splitAmounts: row.split_amounts
      ? (row.split_amounts as Record<string, Money>)
      : undefined,
    paidBy: row.paid_by || undefined,
    receiptFileId: row.receipt_file_id || undefined,
    date: row.date,
    notes: row.notes || undefined,
  };
}

export function dbPartyToParty(row: DbParty): Party {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by || "",
    tripId: row.trip_id,
    name: row.name,
    color: row.color || "blue",
    travelerIds: (row.party_travelers || []).map((pt) => pt.traveler_id),
    dateRange: {
      start: row.date_start,
      end: row.date_end,
    },
    cityIds: (row.party_cities || []).map((pc) => pc.city_id),
    isCore: row.is_core,
  };
}

export function dbActionItemToActionItem(row: DbActionItem): ActionItem {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by || "",
    type: row.type as ActionItem["type"],
    title: row.title,
    description: row.description || "",
    dueDate: row.due_date || undefined,
    priority: row.priority as ActionItem["priority"],
    linkedEntityType: row.linked_entity_type || "",
    linkedEntityId: row.linked_entity_id || undefined,
    status: row.status as ActionItem["status"],
    completedAt: row.completed_at || undefined,
  };
}

// ============================================================================
// TS → DB Transformer Functions (for mutations)
// ============================================================================

export function tripToDbTrip(trip: Partial<Trip>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  if (trip.name !== undefined) result.name = trip.name;
  if (trip.description !== undefined) result.description = trip.description || null;
  if (trip.coverImage !== undefined) result.cover_image_url = trip.coverImage || null;
  if (trip.dateRange) {
    result.start_date = trip.dateRange.start;
    result.end_date = trip.dateRange.end;
  }
  if (trip.status !== undefined) result.status = trip.status;
  if (trip.settings !== undefined) result.settings = trip.settings;
  if (trip.budget) {
    result.budget_total_amount = trip.budget.total.amount;
    result.budget_total_currency = trip.budget.total.currency;
    result.budget_by_category = trip.budget.byCategory;
  }
  if (trip.isPublic !== undefined) result.is_public = trip.isPublic;
  if (trip.shareCode !== undefined) result.share_code = trip.shareCode || null;
  return result;
}

export function cityToDbCity(city: Partial<City>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  if (city.tripId !== undefined) result.trip_id = city.tripId;
  if (city.name !== undefined) result.name = city.name;
  if (city.country !== undefined) result.country = city.country;
  if (city.region !== undefined) result.region = city.region || null;
  if (city.timezone !== undefined) result.timezone = city.timezone;
  if (city.dateRange) {
    result.start_date = city.dateRange.start;
    result.end_date = city.dateRange.end;
  }
  if (city.order !== undefined) result.sort_order = city.order;
  if (city.location) {
    result.location_name = city.location.name;
    result.location_address = city.location.address || null;
    result.location_lat = city.location.latitude || null;
    result.location_lng = city.location.longitude || null;
    result.location_place_id = city.location.placeId || null;
  }
  if (city.description !== undefined) result.description = city.description || null;
  if (city.coverImage !== undefined) result.cover_image_url = city.coverImage || null;
  return result;
}

export function activityToDbActivity(
  activity: Partial<Activity>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  if (activity.tripId !== undefined) result.trip_id = activity.tripId;
  if (activity.dayId !== undefined) result.day_id = activity.dayId;
  if (activity.timeBlockId !== undefined) result.time_block_id = activity.timeBlockId;
  if (activity.name !== undefined) result.name = activity.name;
  if (activity.type !== undefined) result.type = activity.type;
  if (activity.description !== undefined)
    result.description = activity.description || null;
  if (activity.startTime !== undefined) result.start_time = activity.startTime || null;
  if (activity.durationMinutes !== undefined)
    result.duration_minutes = activity.durationMinutes;
  if (activity.isFlexible !== undefined) result.is_flexible = activity.isFlexible;
  if (activity.location !== undefined) {
    result.location_name = activity.location?.name || null;
    result.location_address = activity.location?.address || null;
    result.location_lat = activity.location?.latitude || null;
    result.location_lng = activity.location?.longitude || null;
    result.location_place_id = activity.location?.placeId || null;
  }
  if (activity.status !== undefined) result.status = activity.status;
  if (activity.tags !== undefined) result.tags = activity.tags;
  if (activity.priority !== undefined) result.priority = activity.priority;
  if (activity.cost !== undefined) {
    result.cost_amount = activity.cost?.amount || null;
    result.cost_currency = activity.cost?.currency || null;
  }
  if (activity.costSplit !== undefined) result.cost_split = activity.costSplit;
  if (activity.order !== undefined) result.sort_order = activity.order;
  if (activity.transitToNext !== undefined) {
    result.transit_mode = activity.transitToNext?.mode || null;
    result.transit_duration_minutes =
      activity.transitToNext?.durationMinutes || null;
    result.transit_distance = activity.transitToNext?.distance || null;
    result.transit_cost_amount =
      activity.transitToNext?.cost?.amount || null;
    result.transit_cost_currency =
      activity.transitToNext?.cost?.currency || null;
    result.transit_notes = activity.transitToNext?.notes || null;
  }
  if (activity.tips !== undefined) result.tips = activity.tips || null;
  if (activity.alternatives !== undefined)
    result.alternatives = activity.alternatives || null;
  if (activity.reservationId !== undefined)
    result.reservation_id = activity.reservationId || null;
  return result;
}

export function lodgingToDbLodging(
  lodging: Partial<Lodging>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  if (lodging.tripId !== undefined) result.trip_id = lodging.tripId;
  if (lodging.cityId !== undefined) result.city_id = lodging.cityId;
  if (lodging.name !== undefined) result.name = lodging.name;
  if (lodging.type !== undefined) result.type = lodging.type;
  if (lodging.checkIn !== undefined) {
    result.check_in_date = lodging.checkIn.date;
    result.check_in_time = lodging.checkIn.time;
  }
  if (lodging.checkOut !== undefined) {
    result.check_out_date = lodging.checkOut.date;
    result.check_out_time = lodging.checkOut.time;
  }
  if (lodging.nightCount !== undefined) result.night_count = lodging.nightCount;
  if (lodging.location !== undefined) {
    result.location_name = lodging.location.name;
    result.location_address = lodging.location.address || null;
    result.location_lat = lodging.location.latitude || null;
    result.location_lng = lodging.location.longitude || null;
    result.location_place_id = lodging.location.placeId || null;
  }
  if (lodging.status !== undefined) result.status = lodging.status;
  if (lodging.confirmationNumber !== undefined)
    result.confirmation_number = lodging.confirmationNumber || null;
  if (lodging.bookingPlatform !== undefined)
    result.booking_platform = lodging.bookingPlatform || null;
  if (lodging.bookingUrl !== undefined) result.booking_url = lodging.bookingUrl || null;
  if (lodging.roomType !== undefined) result.room_type = lodging.roomType || null;
  if (lodging.amenities !== undefined) result.amenities = lodging.amenities || null;
  if (lodging.wifiPassword !== undefined)
    result.wifi_password = lodging.wifiPassword || null;
  if (lodging.checkInInstructions !== undefined)
    result.check_in_instructions = lodging.checkInInstructions || null;
  if (lodging.houseRules !== undefined) result.house_rules = lodging.houseRules || null;
  if (lodging.contactPhone !== undefined)
    result.contact_phone = lodging.contactPhone || null;
  if (lodging.contactEmail !== undefined)
    result.contact_email = lodging.contactEmail || null;
  if (lodging.hostName !== undefined) result.host_name = lodging.hostName || null;
  if (lodging.totalCost !== undefined) {
    result.total_cost_amount = lodging.totalCost.amount;
    result.total_cost_currency = lodging.totalCost.currency;
  }
  if (lodging.costPerNight !== undefined) {
    result.cost_per_night_amount = lodging.costPerNight.amount;
    result.cost_per_night_currency = lodging.costPerNight.currency;
  }
  if (lodging.isPrepaid !== undefined) result.is_prepaid = lodging.isPrepaid;
  if (lodging.notes !== undefined) result.notes = lodging.notes || null;
  return result;
}

export function transportToDbTransport(
  transport: Partial<Transport>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  if (transport.tripId !== undefined) result.trip_id = transport.tripId;
  if (transport.type !== undefined) result.type = transport.type;
  if (transport.departure !== undefined) {
    result.departure_location_name = transport.departure.location.name;
    result.departure_location_address = transport.departure.location.address || null;
    result.departure_lat = transport.departure.location.latitude || null;
    result.departure_lng = transport.departure.location.longitude || null;
    result.departure_datetime = transport.departure.dateTime;
    result.departure_terminal = transport.departure.terminal || null;
    result.departure_gate = transport.departure.gate || null;
    result.departure_platform = transport.departure.platform || null;
  }
  if (transport.arrival !== undefined) {
    result.arrival_location_name = transport.arrival.location.name;
    result.arrival_location_address = transport.arrival.location.address || null;
    result.arrival_lat = transport.arrival.location.latitude || null;
    result.arrival_lng = transport.arrival.location.longitude || null;
    result.arrival_datetime = transport.arrival.dateTime;
    result.arrival_terminal = transport.arrival.terminal || null;
  }
  if (transport.durationMinutes !== undefined)
    result.duration_minutes = transport.durationMinutes;
  if (transport.status !== undefined) result.status = transport.status;
  if (transport.carrier !== undefined) result.carrier = transport.carrier || null;
  if (transport.flightNumber !== undefined)
    result.flight_number = transport.flightNumber || null;
  if (transport.trainNumber !== undefined)
    result.train_number = transport.trainNumber || null;
  if (transport.confirmationNumber !== undefined)
    result.confirmation_number = transport.confirmationNumber || null;
  if (transport.bookingReference !== undefined)
    result.booking_reference = transport.bookingReference || null;
  if (transport.bookingUrl !== undefined)
    result.booking_url = transport.bookingUrl || null;
  if (transport.class !== undefined) result.class = transport.class || null;
  if (transport.seatAssignments !== undefined)
    result.seat_assignments = transport.seatAssignments || null;
  if (transport.totalCost !== undefined) {
    result.total_cost_amount = transport.totalCost.amount;
    result.total_cost_currency = transport.totalCost.currency;
  }
  if (transport.departureDayId !== undefined)
    result.departure_day_id = transport.departureDayId || null;
  if (transport.arrivalDayId !== undefined)
    result.arrival_day_id = transport.arrivalDayId || null;
  if (transport.notes !== undefined) result.notes = transport.notes || null;
  return result;
}

export function reservationToDbReservation(
  res: Partial<Reservation>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  if (res.tripId !== undefined) result.trip_id = res.tripId;
  if (res.activityId !== undefined) result.activity_id = res.activityId || null;
  if (res.name !== undefined) result.name = res.name;
  if (res.type !== undefined) result.type = res.type;
  if (res.dateTime !== undefined) result.datetime = res.dateTime;
  if (res.durationMinutes !== undefined)
    result.duration_minutes = res.durationMinutes || null;
  if (res.location !== undefined) {
    result.location_name = res.location?.name || null;
    result.location_address = res.location?.address || null;
    result.location_lat = res.location?.latitude || null;
    result.location_lng = res.location?.longitude || null;
    result.location_place_id = res.location?.placeId || null;
  }
  if (res.status !== undefined) result.status = res.status;
  if (res.confirmationNumber !== undefined)
    result.confirmation_number = res.confirmationNumber || null;
  if (res.bookingPlatform !== undefined)
    result.booking_platform = res.bookingPlatform || null;
  if (res.bookingUrl !== undefined) result.booking_url = res.bookingUrl || null;
  if (res.partySize !== undefined) result.party_size = res.partySize;
  if (res.specialRequests !== undefined)
    result.special_requests = res.specialRequests || null;
  if (res.contactPhone !== undefined)
    result.contact_phone = res.contactPhone || null;
  if (res.contactEmail !== undefined)
    result.contact_email = res.contactEmail || null;
  if (res.cost !== undefined) {
    result.cost_amount = res.cost?.amount || null;
    result.cost_currency = res.cost?.currency || null;
  }
  if (res.isPrepaid !== undefined) result.is_prepaid = res.isPrepaid;
  if (res.depositAmount !== undefined) {
    result.deposit_amount = res.depositAmount?.amount || null;
    result.deposit_currency = res.depositAmount?.currency || null;
  }
  if (res.cancellationPolicy !== undefined)
    result.cancellation_policy = res.cancellationPolicy || null;
  if (res.cancellationDeadline !== undefined)
    result.cancellation_deadline = res.cancellationDeadline || null;
  if (res.notes !== undefined) result.notes = res.notes || null;
  return result;
}

export function budgetItemToDbBudgetItem(
  item: Partial<BudgetItem>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  if (item.tripId !== undefined) result.trip_id = item.tripId;
  if (item.dayId !== undefined) result.day_id = item.dayId || null;
  if (item.activityId !== undefined) result.activity_id = item.activityId || null;
  if (item.description !== undefined) result.description = item.description;
  if (item.category !== undefined) result.category = item.category;
  if (item.amount !== undefined) {
    result.amount = item.amount.amount;
    result.currency = item.amount.currency;
  }
  if (item.isEstimate !== undefined) result.is_estimate = item.isEstimate;
  if (item.splitType !== undefined) result.split_type = item.splitType;
  if (item.splitAmounts !== undefined)
    result.split_amounts = item.splitAmounts || null;
  if (item.paidBy !== undefined) result.paid_by = item.paidBy || null;
  if (item.date !== undefined) result.date = item.date;
  if (item.notes !== undefined) result.notes = item.notes || null;
  return result;
}

export function travelerToDbTraveler(
  traveler: Partial<Traveler>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  if (traveler.tripId !== undefined) result.trip_id = traveler.tripId;
  if (traveler.name !== undefined) result.name = traveler.name;
  if (traveler.email !== undefined) result.email = traveler.email || null;
  if (traveler.phone !== undefined) result.phone = traveler.phone || null;
  if (traveler.avatarUrl !== undefined) result.avatar_url = traveler.avatarUrl || null;
  if (traveler.role !== undefined) result.role = traveler.role;
  if (traveler.dietaryRestrictions !== undefined)
    result.dietary_restrictions = traveler.dietaryRestrictions || null;
  if (traveler.accessibilityNeeds !== undefined)
    result.accessibility_needs = traveler.accessibilityNeeds || null;
  if (traveler.emergencyContact !== undefined) {
    result.emergency_contact_name = traveler.emergencyContact?.name || null;
    result.emergency_contact_phone = traveler.emergencyContact?.phone || null;
    result.emergency_contact_relationship =
      traveler.emergencyContact?.relationship || null;
  }
  if (traveler.passportNumber !== undefined)
    result.passport_number = traveler.passportNumber || null;
  if (traveler.passportExpiry !== undefined)
    result.passport_expiry = traveler.passportExpiry || null;
  return result;
}

export function partyToDbParty(party: Partial<Party>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  if (party.tripId !== undefined) result.trip_id = party.tripId;
  if (party.name !== undefined) result.name = party.name;
  if (party.color !== undefined) result.color = party.color;
  if (party.dateRange !== undefined) {
    result.date_start = party.dateRange.start;
    result.date_end = party.dateRange.end;
  }
  if (party.isCore !== undefined) result.is_core = party.isCore;
  return result;
}

export function actionItemToDbActionItem(
  item: Partial<ActionItem>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  if (item.type !== undefined) result.type = item.type;
  if (item.title !== undefined) result.title = item.title;
  if (item.description !== undefined) result.description = item.description || null;
  if (item.dueDate !== undefined) result.due_date = item.dueDate || null;
  if (item.priority !== undefined) result.priority = item.priority;
  if (item.linkedEntityType !== undefined)
    result.linked_entity_type = item.linkedEntityType || null;
  if (item.linkedEntityId !== undefined)
    result.linked_entity_id = item.linkedEntityId || null;
  if (item.status !== undefined) result.status = item.status;
  if (item.completedAt !== undefined)
    result.completed_at = item.completedAt || null;
  return result;
}
