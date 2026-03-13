-- Comprehensive RLS policies for all tables
-- MVP: Permissive policies allowing all operations via anon key
-- TODO: Replace with proper auth-based policies when authentication is added
--
-- Auth-based policy helper function (also defined in database.sql):
CREATE OR REPLACE FUNCTION user_has_trip_access(trip_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM travelers
    WHERE trip_id = trip_uuid
    AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================================
-- Drop auth-based policies from database.sql to prevent conflicts
-- ============================================================================

-- Trips
DROP POLICY IF EXISTS trips_select ON trips;
DROP POLICY IF EXISTS trips_insert ON trips;
DROP POLICY IF EXISTS trips_update ON trips;
DROP POLICY IF EXISTS trips_delete ON trips;

-- Travelers
DROP POLICY IF EXISTS travelers_select ON travelers;
DROP POLICY IF EXISTS travelers_insert ON travelers;
DROP POLICY IF EXISTS travelers_update ON travelers;
DROP POLICY IF EXISTS travelers_delete ON travelers;

-- Cities
DROP POLICY IF EXISTS cities_select ON cities;
DROP POLICY IF EXISTS cities_insert ON cities;
DROP POLICY IF EXISTS cities_update ON cities;
DROP POLICY IF EXISTS cities_delete ON cities;

-- Neighborhoods
DROP POLICY IF EXISTS neighborhoods_select ON neighborhoods;
DROP POLICY IF EXISTS neighborhoods_insert ON neighborhoods;
DROP POLICY IF EXISTS neighborhoods_update ON neighborhoods;
DROP POLICY IF EXISTS neighborhoods_delete ON neighborhoods;

-- Days
DROP POLICY IF EXISTS days_select ON days;
DROP POLICY IF EXISTS days_insert ON days;
DROP POLICY IF EXISTS days_update ON days;
DROP POLICY IF EXISTS days_delete ON days;

-- Time Blocks
DROP POLICY IF EXISTS time_blocks_select ON time_blocks;
DROP POLICY IF EXISTS time_blocks_insert ON time_blocks;
DROP POLICY IF EXISTS time_blocks_update ON time_blocks;
DROP POLICY IF EXISTS time_blocks_delete ON time_blocks;

-- Activities
DROP POLICY IF EXISTS activities_select ON activities;
DROP POLICY IF EXISTS activities_insert ON activities;
DROP POLICY IF EXISTS activities_update ON activities;
DROP POLICY IF EXISTS activities_delete ON activities;

-- Lodgings
DROP POLICY IF EXISTS lodgings_select ON lodgings;
DROP POLICY IF EXISTS lodgings_insert ON lodgings;
DROP POLICY IF EXISTS lodgings_update ON lodgings;
DROP POLICY IF EXISTS lodgings_delete ON lodgings;

-- Transports
DROP POLICY IF EXISTS transports_select ON transports;
DROP POLICY IF EXISTS transports_insert ON transports;
DROP POLICY IF EXISTS transports_update ON transports;
DROP POLICY IF EXISTS transports_delete ON transports;

-- Reservations
DROP POLICY IF EXISTS reservations_select ON reservations;
DROP POLICY IF EXISTS reservations_insert ON reservations;
DROP POLICY IF EXISTS reservations_update ON reservations;
DROP POLICY IF EXISTS reservations_delete ON reservations;

-- Budget Items
DROP POLICY IF EXISTS budget_items_select ON budget_items;
DROP POLICY IF EXISTS budget_items_insert ON budget_items;
DROP POLICY IF EXISTS budget_items_update ON budget_items;
DROP POLICY IF EXISTS budget_items_delete ON budget_items;

-- Files
DROP POLICY IF EXISTS files_select ON files;
DROP POLICY IF EXISTS files_insert ON files;
DROP POLICY IF EXISTS files_update ON files;
DROP POLICY IF EXISTS files_delete ON files;

-- Notes
DROP POLICY IF EXISTS notes_select ON notes;
DROP POLICY IF EXISTS notes_insert ON notes;
DROP POLICY IF EXISTS notes_update ON notes;
DROP POLICY IF EXISTS notes_delete ON notes;

-- ============================================================================
-- Trips
-- ============================================================================
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to trips" ON trips;
CREATE POLICY "Allow all access to trips" ON trips
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- Cities
-- ============================================================================
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to cities" ON cities;
CREATE POLICY "Allow all access to cities" ON cities
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- Days
-- ============================================================================
ALTER TABLE days ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to days" ON days;
CREATE POLICY "Allow all access to days" ON days
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- Time Blocks
-- ============================================================================
ALTER TABLE time_blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to time_blocks" ON time_blocks;
CREATE POLICY "Allow all access to time_blocks" ON time_blocks
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- Activities
-- ============================================================================
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to activities" ON activities;
CREATE POLICY "Allow all access to activities" ON activities
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- Lodgings
-- ============================================================================
ALTER TABLE lodgings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to lodgings" ON lodgings;
CREATE POLICY "Allow all access to lodgings" ON lodgings
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- Transports
-- ============================================================================
ALTER TABLE transports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to transports" ON transports;
CREATE POLICY "Allow all access to transports" ON transports
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- Transport Travelers
-- ============================================================================
ALTER TABLE transport_travelers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to transport_travelers" ON transport_travelers;
CREATE POLICY "Allow all access to transport_travelers" ON transport_travelers
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- Reservations
-- ============================================================================
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to reservations" ON reservations;
CREATE POLICY "Allow all access to reservations" ON reservations
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- Budget Items
-- ============================================================================
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to budget_items" ON budget_items;
CREATE POLICY "Allow all access to budget_items" ON budget_items
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- Travelers
-- ============================================================================
ALTER TABLE travelers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to travelers" ON travelers;
CREATE POLICY "Allow all access to travelers" ON travelers
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- Neighborhoods
-- ============================================================================
ALTER TABLE neighborhoods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to neighborhoods" ON neighborhoods;
CREATE POLICY "Allow all access to neighborhoods" ON neighborhoods
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- Files
-- ============================================================================
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to files" ON files;
CREATE POLICY "Allow all access to files" ON files
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- Notes
-- ============================================================================
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to notes" ON notes;
CREATE POLICY "Allow all access to notes" ON notes
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- Parties (from migration 001)
-- ============================================================================
-- Policies already created in 001_add_parties.sql

-- ============================================================================
-- Action Items (from migration 002)
-- ============================================================================
-- Policies already created in 002_add_action_items.sql
