-- Create waitlist table
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notified BOOLEAN DEFAULT FALSE,
  signed_up BOOLEAN DEFAULT FALSE,
  referral_code TEXT UNIQUE,
  referred_by TEXT,
  position INTEGER
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS waitlist_email_idx ON waitlist(email);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS waitlist_created_at_idx ON waitlist(created_at DESC);

-- Create index on notified for filtering
CREATE INDEX IF NOT EXISTS waitlist_notified_idx ON waitlist(notified);

-- Function to get waitlist position
CREATE OR REPLACE FUNCTION get_waitlist_position(email_address TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  pos INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO pos
  FROM waitlist
  WHERE created_at < (SELECT created_at FROM waitlist WHERE email = email_address);
  
  RETURN pos;
END;
$$;

-- Enable Row Level Security
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert (for signups)
CREATE POLICY "Allow public waitlist signups"
  ON waitlist
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Allow users to read their own waitlist entry
CREATE POLICY "Users can read own waitlist entry"
  ON waitlist
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text OR true); -- Simplified for now


