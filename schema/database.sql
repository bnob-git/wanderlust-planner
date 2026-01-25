-- Wanderlust Planner - PostgreSQL Database Schema
-- Designed for Supabase with Row Level Security

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";  -- For geospatial queries

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE booking_status AS ENUM (
  'idea', 'planned', 'booked', 'confirmed', 'completed', 'canceled'
);

CREATE TYPE day_status AS ENUM (
  'draft', 'planned', 'locked', 'active', 'completed'
);

CREATE TYPE trip_status AS ENUM (
  'planning', 'upcoming', 'active', 'completed', 'archived'
);

CREATE TYPE time_block_type AS ENUM (
  'morning', 'afternoon', 'evening', 'night'
);

CREATE TYPE activity_type AS ENUM (
  'sightseeing', 'museum', 'restaurant', 'cafe', 'bar', 'nightclub',
  'shopping', 'beach', 'park', 'tour', 'show', 'transport', 'transit',
  'lodging', 'rest', 'free_time', 'other'
);

CREATE TYPE transport_type AS ENUM (
  'flight', 'train', 'bus', 'ferry', 'car_rental', 'taxi',
  'rideshare', 'metro', 'walking', 'other'
);

CREATE TYPE lodging_type AS ENUM (
  'hotel', 'airbnb', 'hostel', 'apartment', 'resort', 'camping', 'other'
);

CREATE TYPE budget_category AS ENUM (
  'lodging', 'flights', 'transport', 'food', 'activities', 'shopping', 'other'
);

CREATE TYPE traveler_role AS ENUM (
  'owner', 'editor', 'viewer'
);

CREATE TYPE pace_preference AS ENUM (
  'relaxed', 'balanced', 'aggressive'
);

CREATE TYPE walking_tolerance AS ENUM (
  'low', 'medium', 'high'
);

CREATE TYPE budget_sensitivity AS ENUM (
  'budget', 'moderate', 'luxury'
);

CREATE TYPE file_category AS ENUM (
  'ticket', 'confirmation', 'receipt', 'passport', 'insurance', 'map', 'other'
);

CREATE TYPE reservation_type AS ENUM (
  'restaurant', 'tour', 'ticket', 'experience', 'spa', 'other'
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- TRIPS
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  status trip_status DEFAULT 'planning',
  
  -- Settings (JSONB for flexibility)
  settings JSONB DEFAULT '{
    "pacePreference": "balanced",
    "walkingTolerance": "medium",
    "budgetSensitivity": "moderate",
    "interests": {
      "food": 20,
      "culture": 20,
      "nature": 20,
      "nightlife": 10,
      "shopping": 10,
      "relaxation": 20
    },
    "schedule": {
      "typicalWakeTime": "08:00",
      "typicalSleepTime": "23:00",
      "breakfastPreference": "light",
      "lunchDurationMinutes": 60,
      "dinnerTime": "20:00"
    },
    "timeBlocks": {
      "morning": {"start": "08:00", "end": "13:00"},
      "afternoon": {"start": "13:00", "end": "19:00"},
      "evening": {"start": "19:00", "end": "23:00"}
    }
  }'::JSONB,
  
  -- Budget
  budget_total_amount DECIMAL(10,2),
  budget_total_currency VARCHAR(3) DEFAULT 'EUR',
  budget_by_category JSONB DEFAULT '{}'::JSONB,
  
  -- Sharing
  is_public BOOLEAN DEFAULT FALSE,
  share_code VARCHAR(20) UNIQUE,
  
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- TRAVELERS
CREATE TABLE travelers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),  -- NULL for non-registered travelers
  
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  avatar_url TEXT,
  
  role traveler_role DEFAULT 'viewer',
  
  -- Preferences
  dietary_restrictions TEXT[],
  accessibility_needs TEXT[],
  
  -- Emergency contact
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(50),
  emergency_contact_relationship VARCHAR(100),
  
  -- Documents
  passport_number VARCHAR(50),
  passport_expiry DATE
);

-- CITIES
CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  country VARCHAR(100) NOT NULL,
  region VARCHAR(100),
  timezone VARCHAR(50) NOT NULL,
  
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  sort_order INTEGER NOT NULL,
  
  -- Location
  location_name VARCHAR(255),
  location_address TEXT,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  location_place_id VARCHAR(255),
  
  description TEXT,
  cover_image_url TEXT,
  
  CONSTRAINT valid_city_date_range CHECK (end_date >= start_date)
);

-- NEIGHBORHOODS
CREATE TABLE neighborhoods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  
  vibes TEXT[],
  walkability walking_tolerance
);

-- DAYS
CREATE TABLE days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  neighborhood_id UUID REFERENCES neighborhoods(id),
  lodging_id UUID,  -- Forward reference, will add FK after lodgings table
  
  day_number INTEGER NOT NULL,
  date DATE NOT NULL,
  
  status day_status DEFAULT 'draft',
  theme VARCHAR(255),
  
  -- Weather (populated closer to date)
  weather JSONB,
  
  -- Budget
  budget_estimate_amount DECIMAL(10,2),
  budget_estimate_currency VARCHAR(3) DEFAULT 'EUR',
  budget_actual_amount DECIMAL(10,2),
  budget_actual_currency VARCHAR(3) DEFAULT 'EUR',
  
  UNIQUE(trip_id, day_number),
  UNIQUE(trip_id, date)
);

-- TIME BLOCKS
CREATE TABLE time_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  day_id UUID NOT NULL REFERENCES days(id) ON DELETE CASCADE,
  
  type time_block_type NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  
  UNIQUE(day_id, type)
);

-- ACTIVITIES
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  day_id UUID NOT NULL REFERENCES days(id) ON DELETE CASCADE,
  time_block_id UUID NOT NULL REFERENCES time_blocks(id) ON DELETE CASCADE,
  reservation_id UUID,  -- Forward reference
  
  name VARCHAR(255) NOT NULL,
  type activity_type NOT NULL,
  description TEXT,
  
  start_time TIME,
  duration_minutes INTEGER NOT NULL,
  is_flexible BOOLEAN DEFAULT TRUE,
  
  -- Location
  location_name VARCHAR(255),
  location_address TEXT,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  location_place_id VARCHAR(255),
  
  status booking_status DEFAULT 'idea',
  
  tags TEXT[],
  priority VARCHAR(20) DEFAULT 'should_do',  -- must_do, should_do, nice_to_have
  
  -- Cost
  cost_amount DECIMAL(10,2),
  cost_currency VARCHAR(3) DEFAULT 'EUR',
  cost_split VARCHAR(50) DEFAULT 'all',  -- all, per_person, or comma-separated traveler IDs
  
  -- Transit to next
  transit_mode transport_type,
  transit_duration_minutes INTEGER,
  transit_distance VARCHAR(50),
  transit_cost_amount DECIMAL(10,2),
  transit_cost_currency VARCHAR(3),
  transit_notes TEXT,
  
  tips TEXT,
  alternatives TEXT[],
  
  sort_order INTEGER NOT NULL,
  
  CONSTRAINT valid_priority CHECK (priority IN ('must_do', 'should_do', 'nice_to_have'))
);

-- LODGINGS
CREATE TABLE lodgings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  type lodging_type NOT NULL,
  
  check_in_date DATE NOT NULL,
  check_in_time TIME NOT NULL,
  check_out_date DATE NOT NULL,
  check_out_time TIME NOT NULL,
  night_count INTEGER NOT NULL,
  
  -- Location
  location_name VARCHAR(255),
  location_address TEXT,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  location_place_id VARCHAR(255),
  
  status booking_status DEFAULT 'idea',
  confirmation_number VARCHAR(100),
  booking_platform VARCHAR(100),
  booking_url TEXT,
  
  room_type VARCHAR(100),
  amenities TEXT[],
  wifi_password VARCHAR(100),
  check_in_instructions TEXT,
  house_rules TEXT,
  
  contact_phone VARCHAR(50),
  contact_email VARCHAR(255),
  host_name VARCHAR(255),
  
  total_cost_amount DECIMAL(10,2),
  total_cost_currency VARCHAR(3) DEFAULT 'EUR',
  cost_per_night_amount DECIMAL(10,2),
  cost_per_night_currency VARCHAR(3) DEFAULT 'EUR',
  is_prepaid BOOLEAN DEFAULT FALSE,
  
  notes TEXT,
  
  CONSTRAINT valid_lodging_dates CHECK (check_out_date >= check_in_date)
);

-- Add FK from days to lodgings now that lodgings table exists
ALTER TABLE days 
ADD CONSTRAINT fk_days_lodging 
FOREIGN KEY (lodging_id) REFERENCES lodgings(id);

-- TRANSPORTS
CREATE TABLE transports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  departure_day_id UUID REFERENCES days(id),
  arrival_day_id UUID REFERENCES days(id),
  
  type transport_type NOT NULL,
  
  -- Departure
  departure_location_name VARCHAR(255),
  departure_location_address TEXT,
  departure_lat DECIMAL(10, 8),
  departure_lng DECIMAL(11, 8),
  departure_datetime TIMESTAMPTZ NOT NULL,
  departure_terminal VARCHAR(50),
  departure_gate VARCHAR(50),
  departure_platform VARCHAR(50),
  
  -- Arrival
  arrival_location_name VARCHAR(255),
  arrival_location_address TEXT,
  arrival_lat DECIMAL(10, 8),
  arrival_lng DECIMAL(11, 8),
  arrival_datetime TIMESTAMPTZ NOT NULL,
  arrival_terminal VARCHAR(50),
  
  duration_minutes INTEGER NOT NULL,
  
  status booking_status DEFAULT 'idea',
  carrier VARCHAR(100),
  flight_number VARCHAR(20),
  train_number VARCHAR(50),
  
  confirmation_number VARCHAR(100),
  booking_reference VARCHAR(100),
  booking_url TEXT,
  
  class VARCHAR(50),
  seat_assignments JSONB DEFAULT '{}'::JSONB,  -- travelerId -> seat
  
  total_cost_amount DECIMAL(10,2),
  total_cost_currency VARCHAR(3) DEFAULT 'EUR',
  
  notes TEXT
);

-- TRANSPORT_TRAVELERS (many-to-many)
CREATE TABLE transport_travelers (
  transport_id UUID NOT NULL REFERENCES transports(id) ON DELETE CASCADE,
  traveler_id UUID NOT NULL REFERENCES travelers(id) ON DELETE CASCADE,
  PRIMARY KEY (transport_id, traveler_id)
);

-- RESERVATIONS
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES activities(id),
  
  name VARCHAR(255) NOT NULL,
  type reservation_type NOT NULL,
  
  datetime TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER,
  
  -- Location
  location_name VARCHAR(255),
  location_address TEXT,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  location_place_id VARCHAR(255),
  
  status booking_status DEFAULT 'idea',
  confirmation_number VARCHAR(100),
  booking_platform VARCHAR(100),
  booking_url TEXT,
  
  party_size INTEGER NOT NULL,
  special_requests TEXT,
  
  contact_phone VARCHAR(50),
  contact_email VARCHAR(255),
  
  cost_amount DECIMAL(10,2),
  cost_currency VARCHAR(3) DEFAULT 'EUR',
  is_prepaid BOOLEAN DEFAULT FALSE,
  deposit_amount DECIMAL(10,2),
  deposit_currency VARCHAR(3),
  
  cancellation_policy TEXT,
  cancellation_deadline TIMESTAMPTZ,
  
  notes TEXT
);

-- Add FK from activities to reservations
ALTER TABLE activities 
ADD CONSTRAINT fk_activities_reservation 
FOREIGN KEY (reservation_id) REFERENCES reservations(id);

-- BUDGET ITEMS
CREATE TABLE budget_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  day_id UUID REFERENCES days(id),
  activity_id UUID REFERENCES activities(id),
  
  description VARCHAR(255) NOT NULL,
  category budget_category NOT NULL,
  
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  is_estimate BOOLEAN DEFAULT TRUE,
  
  split_type VARCHAR(20) DEFAULT 'all',  -- all, per_person, custom
  split_amounts JSONB,  -- travelerId -> amount
  paid_by UUID REFERENCES travelers(id),
  
  receipt_file_id UUID,  -- Forward reference to files
  
  date DATE NOT NULL,
  notes TEXT
);

-- FILES
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size_bytes INTEGER NOT NULL,
  url TEXT NOT NULL,
  
  category file_category DEFAULT 'other',
  
  linked_entity_type VARCHAR(50),
  linked_entity_id UUID
);

-- Add FK from budget_items to files
ALTER TABLE budget_items 
ADD CONSTRAINT fk_budget_items_receipt 
FOREIGN KEY (receipt_file_id) REFERENCES files(id);

-- LODGING_FILES (many-to-many)
CREATE TABLE lodging_files (
  lodging_id UUID NOT NULL REFERENCES lodgings(id) ON DELETE CASCADE,
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  PRIMARY KEY (lodging_id, file_id)
);

-- TRANSPORT_FILES (many-to-many)
CREATE TABLE transport_files (
  transport_id UUID NOT NULL REFERENCES transports(id) ON DELETE CASCADE,
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  PRIMARY KEY (transport_id, file_id)
);

-- RESERVATION_FILES (many-to-many)
CREATE TABLE reservation_files (
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  PRIMARY KEY (reservation_id, file_id)
);

-- ACTIVITY_LINKS
CREATE TABLE activity_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  
  title VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'other'  -- booking, map, review, article, menu, other
);

-- NOTES
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  day_id UUID NOT NULL REFERENCES days(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES travelers(id),
  
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Trips
CREATE INDEX idx_trips_created_by ON trips(created_by);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_share_code ON trips(share_code) WHERE share_code IS NOT NULL;

-- Travelers
CREATE INDEX idx_travelers_trip_id ON travelers(trip_id);
CREATE INDEX idx_travelers_user_id ON travelers(user_id) WHERE user_id IS NOT NULL;

-- Cities
CREATE INDEX idx_cities_trip_id ON cities(trip_id);
CREATE INDEX idx_cities_sort_order ON cities(trip_id, sort_order);

-- Days
CREATE INDEX idx_days_trip_id ON days(trip_id);
CREATE INDEX idx_days_city_id ON days(city_id);
CREATE INDEX idx_days_date ON days(trip_id, date);

-- Activities
CREATE INDEX idx_activities_trip_id ON activities(trip_id);
CREATE INDEX idx_activities_day_id ON activities(day_id);
CREATE INDEX idx_activities_time_block_id ON activities(time_block_id);
CREATE INDEX idx_activities_sort_order ON activities(time_block_id, sort_order);
CREATE INDEX idx_activities_status ON activities(status);

-- Lodgings
CREATE INDEX idx_lodgings_trip_id ON lodgings(trip_id);
CREATE INDEX idx_lodgings_city_id ON lodgings(city_id);
CREATE INDEX idx_lodgings_dates ON lodgings(check_in_date, check_out_date);

-- Transports
CREATE INDEX idx_transports_trip_id ON transports(trip_id);
CREATE INDEX idx_transports_departure_datetime ON transports(departure_datetime);

-- Reservations
CREATE INDEX idx_reservations_trip_id ON reservations(trip_id);
CREATE INDEX idx_reservations_datetime ON reservations(datetime);
CREATE INDEX idx_reservations_activity_id ON reservations(activity_id) WHERE activity_id IS NOT NULL;

-- Budget Items
CREATE INDEX idx_budget_items_trip_id ON budget_items(trip_id);
CREATE INDEX idx_budget_items_day_id ON budget_items(day_id) WHERE day_id IS NOT NULL;
CREATE INDEX idx_budget_items_category ON budget_items(trip_id, category);
CREATE INDEX idx_budget_items_date ON budget_items(date);

-- Files
CREATE INDEX idx_files_trip_id ON files(trip_id);
CREATE INDEX idx_files_linked_entity ON files(linked_entity_type, linked_entity_id) 
  WHERE linked_entity_type IS NOT NULL;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_trips_updated_at
  BEFORE UPDATE ON trips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_travelers_updated_at
  BEFORE UPDATE ON travelers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cities_updated_at
  BEFORE UPDATE ON cities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_days_updated_at
  BEFORE UPDATE ON days
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lodgings_updated_at
  BEFORE UPDATE ON lodgings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transports_updated_at
  BEFORE UPDATE ON transports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at
  BEFORE UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_items_updated_at
  BEFORE UPDATE ON budget_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE travelers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE neighborhoods ENABLE ROW LEVEL SECURITY;
ALTER TABLE days ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE lodgings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transports ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Trips: Users can see trips they created or are travelers on
CREATE POLICY trips_select ON trips FOR SELECT USING (
  created_by = auth.uid() OR
  is_public = TRUE OR
  id IN (SELECT trip_id FROM travelers WHERE user_id = auth.uid())
);

CREATE POLICY trips_insert ON trips FOR INSERT WITH CHECK (
  created_by = auth.uid()
);

CREATE POLICY trips_update ON trips FOR UPDATE USING (
  created_by = auth.uid() OR
  id IN (SELECT trip_id FROM travelers WHERE user_id = auth.uid() AND role IN ('owner', 'editor'))
);

CREATE POLICY trips_delete ON trips FOR DELETE USING (
  created_by = auth.uid()
);

-- Travelers: Can see travelers for trips they have access to
CREATE POLICY travelers_select ON travelers FOR SELECT USING (
  trip_id IN (
    SELECT id FROM trips WHERE created_by = auth.uid() OR is_public = TRUE
    UNION
    SELECT trip_id FROM travelers WHERE user_id = auth.uid()
  )
);

-- Similar policies for other tables (abbreviated for brevity)
-- In production, each table would have full CRUD policies

-- ============================================================================
-- VIEWS
-- ============================================================================

-- Trip summary view
CREATE VIEW trip_summaries AS
SELECT 
  t.id,
  t.name,
  t.start_date,
  t.end_date,
  t.status,
  t.budget_total_amount,
  t.budget_total_currency,
  (t.end_date - t.start_date + 1) as total_days,
  (SELECT COUNT(*) FROM cities WHERE trip_id = t.id) as cities_count,
  (SELECT COUNT(*) FROM travelers WHERE trip_id = t.id) as travelers_count,
  (SELECT COUNT(*) FROM activities WHERE trip_id = t.id AND status = 'confirmed') as confirmed_activities,
  (SELECT COUNT(*) FROM activities WHERE trip_id = t.id AND status IN ('idea', 'planned', 'booked')) as pending_activities,
  (SELECT COALESCE(SUM(amount), 0) FROM budget_items WHERE trip_id = t.id AND is_estimate = FALSE) as actual_spend
FROM trips t;

-- Day detail view
CREATE VIEW day_details AS
SELECT 
  d.id,
  d.trip_id,
  d.city_id,
  d.day_number,
  d.date,
  d.status,
  d.theme,
  c.name as city_name,
  n.name as neighborhood_name,
  l.name as lodging_name,
  l.location_address as lodging_address,
  (SELECT COUNT(*) FROM activities WHERE day_id = d.id) as activity_count,
  d.budget_estimate_amount,
  d.budget_actual_amount
FROM days d
JOIN cities c ON d.city_id = c.id
LEFT JOIN neighborhoods n ON d.neighborhood_id = n.id
LEFT JOIN lodgings l ON d.lodging_id = l.id;
