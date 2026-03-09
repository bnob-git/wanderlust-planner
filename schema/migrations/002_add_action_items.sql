-- Migration: Add action_items table
-- Tracks tasks and action items linked to trip entities

CREATE TABLE IF NOT EXISTS action_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE,
  priority VARCHAR(20) DEFAULT 'medium',
  linked_entity_type VARCHAR(50),
  linked_entity_id UUID,
  status VARCHAR(20) DEFAULT 'pending',
  completed_at TIMESTAMPTZ
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_action_items_trip_id ON action_items(trip_id);
CREATE INDEX IF NOT EXISTS idx_action_items_status ON action_items(status);
CREATE INDEX IF NOT EXISTS idx_action_items_priority ON action_items(priority);
CREATE INDEX IF NOT EXISTS idx_action_items_due_date ON action_items(due_date);
CREATE INDEX IF NOT EXISTS idx_action_items_linked_entity ON action_items(linked_entity_type, linked_entity_id);

-- Enable RLS
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;

-- Permissive policy for anon key (no auth required for MVP)
CREATE POLICY "Allow all access to action_items" ON action_items FOR ALL USING (true) WITH CHECK (true);

-- Updated_at trigger
CREATE TRIGGER update_action_items_updated_at
  BEFORE UPDATE ON action_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
