# ResuCraft - AI-Powered ATS Resume Builder

An AI-powered resume builder that creates professional, ATS-friendly resumes optimized for Applicant Tracking Systems. Built with Next.js, DaisyUI, Supabase, and LaTeX.

**Live at: [resucraft.co](https://resucraft.co)**

## Features

- **AI-Powered Generation**: Uses OpenAI/Groq to create compelling, keyword-optimized resume content
- **Job-Tailored Content**: Paste job descriptions to get resumes specifically optimized for positions
- **ATS Score & Tips**: Instant feedback with compatibility scores and actionable recommendations
- **PDF Export**: Professional LaTeX-compiled PDFs with clean, single-column formatting
- **Resume Management**: Dashboard to track all resume versions and their scores

## Tech Stack

- **Frontend**: Next.js 13 (App Router), React, TypeScript, Tailwind CSS, DaisyUI
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **AI**: OpenAI GPT-4 / Groq (configurable)
- **PDF Generation**: LaTeX (via Docker microservice)

## Color Theme

- Black: `#000000` (primary background/header)
- Deep Navy: `#14213D` (accent/cards)
- Cyan: `#00B4D8` (CTA/accents)
- Light Gray: `#E5E5E5` (muted backgrounds)
- White: `#FFFFFF` (text on dark areas)

## Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)
- Docker (optional - for LaTeX PDF generation)
- Groq API key (required - FREE from https://console.groq.com)
- OpenAI API key (optional - for RAG enhancement)
- Supabase account (optional - for RAG enhancement)

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment Variables

Create `.env.local` in the project root:

```bash
# Minimal setup (works without RAG)
GROQ_API_KEY=gsk_your_key_here

# Optional: For RAG-enhanced analysis
OPENAI_API_KEY=sk_your_key_here
NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# Optional: For PDF generation
LATEX_COMPILE_URL=http://localhost:3001/compile
```

📖 **For detailed setup:** See [ENVIRONMENT.md](./ENVIRONMENT.md)

### 3. Start Development Server

```bash
pnpm dev
```

The app will be available at `http://localhost:3000`.

### 4. Optional: Start LaTeX Service (for PDF generation)

Using Docker Compose (recommended):

```bash
docker-compose up -d latex-compile
```

Or manually:

```bash
cd latex-compile
docker build -t latex-compile-service .
docker run --rm -p 3001:3001 --name latex-compile latex-compile-service
```

### 5. Optional: Set Up RAG Enhancement

For AI-enhanced, role-specific suggestions:

1. Set up Supabase database
2. Run migration: `supabase-migrations/001_create_ats_knowledge.sql`
3. Populate knowledge base:
```bash
curl -X POST http://localhost:3000/api/setup-knowledge-base \
  -H "x-api-key: your-admin-api-key"
```

📖 **For detailed RAG setup:** See [RAG_ATS_SETUP.md](./RAG_ATS_SETUP.md)

## Usage

### Creating a Resume

1. Navigate to `/create` or click "Get Started" on the homepage
2. Fill in your personal information, work experience, skills, and education
3. Optionally paste a job description to optimize for specific keywords
4. Click "Generate Resume" and wait for AI to create your content
5. Review the generated resume and ATS score
6. Click "Compile to PDF" to download your resume

### Managing Resumes

- Visit `/dashboard` to see all your resume versions
- View ATS scores and download compiled PDFs
- Create new versions for different job applications

## API Routes

### POST /api/resume/generate

Generates a resume using AI based on form data.

**Request Body:**
```json
{
  "fullName": "John Doe",
  "title": "Software Engineer",
  "email": "john@example.com",
  "location": "San Francisco, CA",
  "summary": "...",
  "skills": "JavaScript, React, Node.js",
  "experiences": [...],
  "education": "...",
  "jobDescription": "..."
}
```

**Response:**
```json
{
  "resumeId": "uuid",
  "sections": [...],
  "atsScore": 85
}
```

### POST /api/resume/compile

Compiles a resume to PDF using LaTeX.

**Request Body:**
```json
{
  "resumeId": "uuid"
}
```

**Response:**
```json
{
  "pdfUrl": "signed-url"
}
```

### GET /api/resume/[id]/download

Gets a signed download URL for a compiled resume PDF.

**Response:**
```json
{
  "downloadUrl": "signed-url"
}
```

## Database Schema

### profiles
- `id` (uuid, FK to auth.users)
- `full_name` (text)
- `created_at` (timestamptz)

### job_targets
- `id` (uuid)
- `user_id` (uuid, FK to profiles)
- `title` (text)
- `company` (text)
- `job_description` (text)
- `created_at` (timestamptz)

### resume_versions
- `id` (uuid)
- `user_id` (uuid, FK to profiles)
- `title` (text)
- `plain_text` (text)
- `latex_source` (text)
- `pdf_url` (text)
- `ats_score` (integer)
- `status` (text: 'draft' | 'compiled')
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

## ATS Scoring

The ATS score is calculated based on:

- **Keyword Match** (35%): Presence of keywords from job description
- **Section Structure** (20%): Proper resume sections present
- **Metrics Present** (15%): Quantifiable achievements included
- **Action Verbs** (15%): Strong action verbs used
- **Format Check** (15%): Proper word count and formatting

## LaTeX Template

The application uses a clean, single-column LaTeX template optimized for ATS parsing:

- Standard fonts (Latin Modern)
- No tables, images, or complex formatting
- Clear section headers
- Proper spacing and margins
- Plain ASCII characters

## Security Considerations

- All LaTeX compilation happens in isolated Docker container
- LaTeX special characters are escaped before injection
- Row Level Security (RLS) enabled on all database tables
- Service role key never exposed to client
- Signed URLs for file downloads with expiration

## Testing

Test the complete flow:

1. Create a resume with sample data
2. Verify AI generates valid JSON response
3. Check ATS score calculation
4. Compile to PDF and verify download
5. Verify resume appears in dashboard

Example test data:
```bash
curl -X POST http://localhost:3000/api/resume/generate \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Jane Smith",
    "title": "Senior Software Engineer",
    "email": "jane@example.com",
    "location": "New York, NY",
    "summary": "Experienced software engineer with 5+ years building scalable web applications",
    "skills": "JavaScript, TypeScript, React, Node.js, PostgreSQL, AWS",
    "experiences": [
      {
        "company": "Tech Corp",
        "role": "Software Engineer",
        "start": "Jan 2020",
        "end": "Present",
        "bullets": ["Built microservices", "Led team of 5"]
      }
    ],
    "education": "BS Computer Science, MIT, 2019",
    "jobDescription": "Looking for senior engineer with React and Node.js experience"
  }'
```

## Troubleshooting

### LaTeX Compilation Fails

If LaTeX compilation fails, the system falls back to generating a plain-text PDF. Check:
- LaTeX compile service is running: `docker ps`
- Service is accessible: `curl http://localhost:3001/health`
- LaTeX syntax is valid (check logs)

### Authentication Issues

If users can't authenticate:
- Verify Supabase credentials in `.env.local`
- Check Supabase project is active
- Verify RLS policies are enabled

### PDF Download Issues

If PDFs won't download:
- Check Supabase Storage bucket exists
- Verify storage policies allow user access
- Check PDF was successfully uploaded

## Production Deployment

For production deployment:

1. Set up Supabase project in production
2. Configure environment variables
3. Deploy LaTeX service to cloud (e.g., Cloud Run, ECS)
4. Add rate limiting to API routes
5. Set up monitoring and error tracking
6. Configure CDN for static assets

## Future Enhancements (Phase 2+)

- RAG system for resume examples
- Multiple LaTeX templates
- Real-time collaboration
- Resume analytics and tracking
- A/B testing for different versions
- Integration with job boards

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
