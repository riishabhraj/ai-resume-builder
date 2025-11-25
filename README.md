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
- Docker (for LaTeX compile service)
- Supabase account
- OpenAI or Groq API key

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

The database schema is already applied via migrations. You need to set up your environment variables:

Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

LLM_PROVIDER=openai
OPENAI_API_KEY=your-openai-key

LATEX_COMPILE_URL=http://localhost:3001/compile
```

### 3. Start LaTeX Compile Service

The LaTeX compile service runs in Docker to safely compile LaTeX documents to PDF.

```bash
cd latex-compile
npm install
docker build -t latex-compile-service .
docker run --rm -p 3001:3001 --name latex-compile latex-compile-service
```

Alternatively, run it with resource limits for production:

```bash
docker run --rm -p 3001:3001 \
  --memory=512m \
  --cpus=1 \
  --name latex-compile \
  latex-compile-service
```

### 4. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

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
