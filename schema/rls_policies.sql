-- Comprehensive RLS policies for all tables
-- MVP: Permissive policies allowing all operations via anon key
-- TODO: Replace with proper auth-based policies when authentication is added
--
-- Future auth-based policy helper function (commented out for now):
-- CREATE OR REPLACE FUNCTION user_has_trip_access(trip_uuid UUID)
-- RETURNS BOOLEAN AS $$
--   SELECT EXISTS (
--     SELECT 1 FROM travelers
--     WHERE trip_id = trip_uuid
--     AND user_id = auth.uid()
--     AND role IN ('owner', 'editor')
--   );
-- $$ LANGUAGE sql SECURITY DEFINER;

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
-- Parties (from migration 001)
-- ============================================================================
-- Policies already created in 001_add_parties.sql

-- ============================================================================
-- Action Items (from migration 002)
-- ============================================================================
-- Policies already created in 002_add_action_items.sql
