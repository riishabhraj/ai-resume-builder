# Phase 2: Database Schema Updates

This document describes the Phase 2 database schema updates for ResuCraft.

## Migration File

**File:** `supabase/migrations/20251110000000_phase2_schema_updates.sql`

## Changes

### 1. Updated `resume_versions` Table

#### Added Column: `sections_data` (JSONB)

Stores structured resume sections as a JSONB array. This allows us to:
- Store the complete resume structure in a queryable format
- Maintain the exact section order and content
- Enable efficient JSON queries using GIN indexes

**Structure:**
```json
[
  {
    "id": "personal-info",
    "type": "personal-info",
    "title": "Personal Info",
    "content": {
      "fullName": "John Doe",
      "title": "Software Engineer",
      "email": "john@example.com",
      ...
    }
  },
  {
    "id": "experience-1",
    "type": "experience",
    "title": "Professional Experience",
    "content": [
      {
        "id": "exp-1",
        "company": "Tech Corp",
        "role": "Senior Developer",
        ...
      }
    ]
  },
  ...
]
```

### 2. New Table: `resume_analyses`

Tracks all resume analyses performed by users, including:
- ATS scoring
- Resume tailoring
- Resume optimization
- Resume reviews

**Schema:**
```sql
CREATE TABLE resume_analyses (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles(id),
  resume_id uuid REFERENCES resume_versions(id),
  analysis_type text NOT NULL,  -- 'ats', 'tailor', 'optimize', 'review'
  job_description text,
  ats_score integer,
  feedback jsonb,  -- AI feedback/analysis results
  created_at timestamptz
);
```

**RLS Policies:**
- Users can only view, create, update, and delete their own analyses
- All operations require authentication

### 3. Performance Indexes

#### `resume_versions` Indexes
- `resume_versions_user_id_idx` - Fast user resume queries
- `resume_versions_created_at_idx` - Fast sorting by creation date (DESC)
- `resume_versions_sections_data_idx` - GIN index for efficient JSONB queries

#### `resume_analyses` Indexes
- `resume_analyses_user_id_idx` - Fast user analysis queries
- `resume_analyses_resume_id_idx` - Fast resume-specific analysis queries
- `resume_analyses_created_at_idx` - Fast sorting by creation date (DESC)
- `resume_analyses_analysis_type_idx` - Fast filtering by analysis type

## TypeScript Types

Updated `lib/types.ts` with:

1. **Updated `ResumeVersion` interface:**
   - Added `sections_data?: StructuredResumeSection[] | null`

2. **New `StructuredResumeSection` interface:**
   - Matches the structure used in the resume builder
   - Includes `id`, `type`, `title`, and `content`

3. **New `ResumeAnalysis` interface:**
   - Type-safe interface for resume analyses
   - Matches the database schema

4. **New `SectionType` type:**
   - Union type for all valid section types

## Usage Examples

### Storing Resume Sections

```typescript
const sections: StructuredResumeSection[] = [
  {
    id: 'personal-info',
    type: 'personal-info',
    title: 'Personal Info',
    content: {
      fullName: 'John Doe',
      email: 'john@example.com',
      // ...
    }
  },
  // ...
];

await supabase
  .from('resume_versions')
  .update({ sections_data: sections })
  .eq('id', resumeId);
```

### Querying Resume Sections

```typescript
// Get resume with sections
const { data } = await supabase
  .from('resume_versions')
  .select('*')
  .eq('id', resumeId)
  .single();

const sections = data.sections_data as StructuredResumeSection[];
```

### Storing Analysis Results

```typescript
await supabase
  .from('resume_analyses')
  .insert({
    user_id: userId,
    resume_id: resumeId,
    analysis_type: 'ats',
    ats_score: 85,
    feedback: {
      strengths: ['...'],
      weaknesses: ['...'],
      recommendations: ['...']
    }
  });
```

### Querying Analyses

```typescript
// Get all ATS analyses for a user
const { data } = await supabase
  .from('resume_analyses')
  .select('*')
  .eq('user_id', userId)
  .eq('analysis_type', 'ats')
  .order('created_at', { ascending: false });
```

## Migration Instructions

1. **Run the migration in Supabase:**
   - Go to Supabase Dashboard → SQL Editor
   - Copy the contents of `supabase/migrations/20251110000000_phase2_schema_updates.sql`
   - Execute the SQL

2. **Or use Supabase CLI:**
   ```bash
   supabase db push
   ```

3. **Verify the migration:**
   - Check that `sections_data` column exists in `resume_versions`
   - Check that `resume_analyses` table exists
   - Verify all indexes are created
   - Test RLS policies

## Benefits

1. **Structured Data Storage:**
   - Resume sections stored in a queryable format
   - Easy to restore resume state
   - Supports versioning

2. **Analysis Tracking:**
   - Complete history of all analyses
   - Track improvements over time
   - Compare different analysis types

3. **Performance:**
   - Indexed queries for fast retrieval
   - GIN indexes for efficient JSONB queries
   - Optimized for common query patterns

4. **Type Safety:**
   - TypeScript interfaces match database schema
   - Compile-time type checking
   - Better developer experience

## Next Steps

After applying this migration:
1. Update API routes to save/load `sections_data`
2. Implement analysis tracking in API routes
3. Update dashboard to show analysis history
4. Add resume versioning using `sections_data`
