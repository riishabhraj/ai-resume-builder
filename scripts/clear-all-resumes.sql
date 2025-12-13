-- Clear all resumes from the database
-- WARNING: This will delete ALL resumes for ALL users
-- Use with caution!

DELETE FROM resume_versions;

-- Optional: Reset the sequence if you want to start IDs from 1
-- (UUIDs don't use sequences, but if you have any sequences, reset them here)

-- Verify deletion
SELECT COUNT(*) as remaining_resumes FROM resume_versions;


