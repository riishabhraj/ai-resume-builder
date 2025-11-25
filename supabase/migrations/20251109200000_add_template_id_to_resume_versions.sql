-- Add template_id column to resume_versions table
ALTER TABLE resume_versions 
ADD COLUMN IF NOT EXISTS template_id text;

-- Add comment for documentation
COMMENT ON COLUMN resume_versions.template_id IS 'Template identifier used to generate this resume (e.g., modern, classic, professional)';

