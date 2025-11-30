/*
  # Phase 2: Database Schema Updates
  
  1. Update `resume_versions` table
    - Add `sections_data` JSONB column to store structured resume sections
    - This stores the ResumeSection[] array structure
  
  2. Create `resume_analyses` table
    - Track resume analyses (ATS, tailor, optimize, etc.)
    - Store analysis results and feedback
  
  3. Add indexes for performance
    - Index on user_id for faster queries
    - Index on created_at for sorting
*/

-- Add JSONB column for structured resume data
ALTER TABLE resume_versions 
ADD COLUMN IF NOT EXISTS sections_data JSONB;

-- Add comment to document the column
COMMENT ON COLUMN resume_versions.sections_data IS 'Stores structured resume sections as JSONB array. Format: [{"id": "personal-info", "type": "personal-info", "title": "Personal Info", "content": {...}}, ...]';

-- Create resume_analyses table
CREATE TABLE IF NOT EXISTS resume_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  resume_id uuid REFERENCES resume_versions(id) ON DELETE CASCADE,
  analysis_type text NOT NULL, -- 'ats', 'tailor', 'optimize', 'review', etc.
  job_description text,
  ats_score integer,
  feedback jsonb, -- Store AI feedback/analysis results
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on resume_analyses
ALTER TABLE resume_analyses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for resume_analyses
CREATE POLICY "Users can view own resume analyses"
  ON resume_analyses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own resume analyses"
  ON resume_analyses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resume analyses"
  ON resume_analyses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own resume analyses"
  ON resume_analyses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS resume_versions_user_id_idx ON resume_versions(user_id);
CREATE INDEX IF NOT EXISTS resume_versions_created_at_idx ON resume_versions(created_at DESC);
CREATE INDEX IF NOT EXISTS resume_analyses_user_id_idx ON resume_analyses(user_id);
CREATE INDEX IF NOT EXISTS resume_analyses_resume_id_idx ON resume_analyses(resume_id);
CREATE INDEX IF NOT EXISTS resume_analyses_created_at_idx ON resume_analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS resume_analyses_analysis_type_idx ON resume_analyses(analysis_type);

-- Add GIN index for JSONB queries on sections_data (for efficient JSON queries)
CREATE INDEX IF NOT EXISTS resume_versions_sections_data_idx ON resume_versions USING gin(sections_data);

