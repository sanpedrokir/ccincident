-- CC Incident Management - Database Schema
-- Run this in your Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS incidents (
  id                           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vvip_name                    text NOT NULL,
  vvip_agency_name             text NOT NULL,
  engineer_name                text NOT NULL,
  incident_type                text NOT NULL,
  incident_detail              text NOT NULL,
  urgency                      boolean NOT NULL DEFAULT false,
  incident_date                date NOT NULL,
  time_of_call                 time NOT NULL,
  resolution_completion_date   date NOT NULL,
  resolution_completion_time   time NOT NULL,
  form_entry_date              date NOT NULL DEFAULT CURRENT_DATE,
  incident_start_datetime      timestamptz NOT NULL,
  resolution_completion_datetime timestamptz NOT NULL,
  sla_met                      text NOT NULL CHECK (sla_met IN ('Yes', 'No')),
  created_at                   timestamptz DEFAULT now(),
  updated_at                   timestamptz DEFAULT now()
);

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER incidents_updated_at
  BEFORE UPDATE ON incidents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Indexes for common filter queries
CREATE INDEX idx_incidents_incident_date   ON incidents (incident_date);
CREATE INDEX idx_incidents_vvip_agency     ON incidents (vvip_agency_name);
CREATE INDEX idx_incidents_urgency         ON incidents (urgency);
CREATE INDEX idx_incidents_sla_met         ON incidents (sla_met);
CREATE INDEX idx_incidents_created_at      ON incidents (created_at DESC);

-- Row Level Security (optional — enable if you add auth)
-- ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all for authenticated" ON incidents
--   FOR ALL USING (auth.role() = 'authenticated');

COMMENT ON TABLE incidents IS 'CC (Customer Care) VVIP incident records for engineering team';
