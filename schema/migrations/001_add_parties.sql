-- Migration: Add parties, party_travelers, and party_cities tables
-- These tables support the travel party management feature

CREATE TABLE IF NOT EXISTS parties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(50),
  date_start DATE NOT NULL,
  date_end DATE NOT NULL,
  is_core BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS party_travelers (
  party_id UUID NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
  traveler_id UUID NOT NULL REFERENCES travelers(id) ON DELETE CASCADE,
  PRIMARY KEY (party_id, traveler_id)
);

CREATE TABLE IF NOT EXISTS party_cities (
  party_id UUID NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  PRIMARY KEY (party_id, city_id)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_parties_trip_id ON parties(trip_id);
CREATE INDEX IF NOT EXISTS idx_party_travelers_party_id ON party_travelers(party_id);
CREATE INDEX IF NOT EXISTS idx_party_travelers_traveler_id ON party_travelers(traveler_id);
CREATE INDEX IF NOT EXISTS idx_party_cities_party_id ON party_cities(party_id);
CREATE INDEX IF NOT EXISTS idx_party_cities_city_id ON party_cities(city_id);

-- Enable RLS
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE party_travelers ENABLE ROW LEVEL SECURITY;
ALTER TABLE party_cities ENABLE ROW LEVEL SECURITY;

-- Permissive policies for anon key (no auth required for MVP)
CREATE POLICY "Allow all access to parties" ON parties FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to party_travelers" ON party_travelers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to party_cities" ON party_cities FOR ALL USING (true) WITH CHECK (true);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_parties_updated_at
  BEFORE UPDATE ON parties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
