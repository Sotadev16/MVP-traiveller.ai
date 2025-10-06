-- Phase 2 Database Schema for Traiveller.ai
-- Complete schema with RLS policies

-- Create options table for Phase 3 preparation
CREATE TABLE IF NOT EXISTS options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Link to intake
  intake_id UUID NOT NULL REFERENCES intakes(id) ON DELETE CASCADE,

  -- Option details
  provider VARCHAR(100) NOT NULL,
  rank INTEGER NOT NULL CHECK (rank >= 1 AND rank <= 3),
  title TEXT NOT NULL,
  summary TEXT,
  deeplink TEXT,
  price DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'EUR',
  raw_payload JSONB,

  -- Meta
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(intake_id, rank)
);

-- Create event_logs table if not exists
CREATE TABLE IF NOT EXISTS event_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  event_type VARCHAR(100) NOT NULL,
  intake_id UUID REFERENCES intakes(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT
);

-- Create admin users table
CREATE TABLE IF NOT EXISTS users_admin (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on all tables
ALTER TABLE intakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE options ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE users_admin ENABLE ROW LEVEL SECURITY;

-- RLS Policies for intakes table
-- Anonymous users can only INSERT (form submissions)
CREATE POLICY "Allow anonymous insert on intakes" ON intakes
  FOR INSERT TO anon
  WITH CHECK (true);

-- Admin users can do everything
CREATE POLICY "Allow admin full access to intakes" ON intakes
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_admin
      WHERE users_admin.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_admin
      WHERE users_admin.id = auth.uid()
    )
  );

-- RLS Policies for options table
-- Only admin users can access options
CREATE POLICY "Allow admin full access to options" ON options
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_admin
      WHERE users_admin.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_admin
      WHERE users_admin.id = auth.uid()
    )
  );

-- RLS Policies for event_logs table
-- Only admin users can access event logs
CREATE POLICY "Allow admin full access to event_logs" ON event_logs
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_admin
      WHERE users_admin.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_admin
      WHERE users_admin.id = auth.uid()
    )
  );

-- RLS Policies for users_admin table
-- Admin users can read their own record and other admin records
CREATE POLICY "Allow admin read access to users_admin" ON users_admin
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_admin
      WHERE users_admin.id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_options_intake_id ON options(intake_id);
CREATE INDEX IF NOT EXISTS idx_options_rank ON options(rank);
CREATE INDEX IF NOT EXISTS idx_event_logs_intake_id ON event_logs(intake_id);
CREATE INDEX IF NOT EXISTS idx_event_logs_event_type ON event_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_event_logs_created_at ON event_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_intakes_status ON intakes(status);
CREATE INDEX IF NOT EXISTS idx_intakes_created_at ON intakes(created_at);
CREATE INDEX IF NOT EXISTS idx_intakes_email ON intakes(email);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for options table
CREATE TRIGGER update_options_updated_at
  BEFORE UPDATE ON options
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();