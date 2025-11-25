# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client (Browser)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Landing   │  │   Create    │  │  Dashboard/Resume   │ │
│  │    Page     │  │    Form     │  │       Viewer        │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP/HTTPS
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   Next.js App (Vercel)                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Pages & Components                       │  │
│  │    / | /create | /dashboard | /resume/[id]           │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  API Routes                           │  │
│  │  /api/resume/generate                                 │  │
│  │  /api/resume/compile                                  │  │
│  │  /api/resume/[id]/download                            │  │
│  └──────────────────────────────────────────────────────┘  │
│                         │                                   │
│         ┌───────────────┼───────────────┐                  │
└─────────┼───────────────┼───────────────┼──────────────────┘
          │               │               │
          ▼               ▼               ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
│   Supabase   │  │     LLM      │  │  LaTeX Service   │
│              │  │   Provider   │  │    (Docker)      │
│  ┌────────┐  │  │              │  │                  │
│  │Database│  │  │ ┌──────────┐ │  │  ┌────────────┐ │
│  │        │  │  │ │  OpenAI  │ │  │  │  pdflatex  │ │
│  │ Tables │  │  │ │    or    │ │  │  │  compiler  │ │
│  │  RLS   │  │  │ │   Groq   │ │  │  └────────────┘ │
│  └────────┘  │  │ └──────────┘ │  │                  │
│  ┌────────┐  │  │              │  │   Isolated,      │
│  │Storage │  │  │              │  │   Sandboxed      │
│  │ Bucket │  │  │              │  │   Environment    │
│  └────────┘  │  │              │  │                  │
└──────────────┘  └──────────────┘  └──────────────────┘
```

## Data Flow

### 1. Resume Creation Flow

```
User fills form → Submit
                    ↓
            /api/resume/generate
                    ↓
            Build AI Prompt
                    ↓
         Call LLM API (OpenAI/Groq)
                    ↓
         Receive JSON response
                    ↓
         Calculate ATS Score
                    ↓
         Generate LaTeX source
                    ↓
       Save to Supabase DB
                    ↓
    Return resume ID & score
                    ↓
         Redirect to /resume/[id]
```

### 2. PDF Compilation Flow

```
User clicks "Compile to PDF"
            ↓
    /api/resume/compile
            ↓
    Fetch LaTeX source from DB
            ↓
    POST to LaTeX service
            ↓
    LaTeX Service compiles
            ↓
    Receive PDF binary
            ↓
    Upload to Supabase Storage
            ↓
    Update DB with pdf_url
            ↓
    Return signed download URL
            ↓
    Open PDF in new tab
```

## Technology Decisions

### Frontend Framework: Next.js 13 (App Router)

**Why?**
- Server-side rendering for better SEO
- API routes for backend logic
- File-based routing
- Built-in TypeScript support
- Easy deployment to Vercel

**Alternatives considered:**
- Create React App: No SSR, no backend
- Remix: Less mature ecosystem
- SvelteKit: Smaller community

### UI Framework: DaisyUI + Tailwind

**Why?**
- Pre-built components reduce development time
- Utility-first CSS for customization
- Consistent design system
- Minimal bundle size
- Easy theming

**Alternatives considered:**
- Material-UI: Heavier, harder to customize
- Chakra UI: More opinionated
- Plain CSS: Too much manual work

### Database: Supabase (PostgreSQL)

**Why?**
- PostgreSQL is robust and reliable
- Built-in auth and storage
- Row Level Security for data protection
- Real-time subscriptions (future use)
- Easy to use SDK

**Alternatives considered:**
- Firebase: NoSQL, less structured
- MongoDB: Document model not ideal for relational data
- Planetscale: MySQL, fewer features

### AI Provider: OpenAI / Groq

**Why?**
- GPT-4 produces high-quality resume content
- JSON mode ensures structured output
- Groq offers fast inference as alternative
- Easy to swap providers

**Alternatives considered:**
- Claude: No JSON mode (at time of writing)
- Local models: Too slow, inconsistent quality
- Fine-tuned models: Requires training data

### PDF Generation: LaTeX

**Why?**
- Professional typesetting
- ATS-friendly single-column output
- Consistent formatting across platforms
- Industry standard for resumes
- Highly customizable templates

**Alternatives considered:**
- HTML to PDF (Puppeteer): Inconsistent rendering
- Word documents: Not web-native
- PDF libraries (PDFKit): More code, less professional

## File Structure

```
project/
├── app/
│   ├── api/
│   │   └── resume/
│   │       ├── generate/route.ts      # AI generation endpoint
│   │       ├── compile/route.ts       # PDF compilation endpoint
│   │       └── [id]/
│   │           └── download/route.ts  # Download endpoint
│   ├── create/page.tsx                # Resume builder form
│   ├── dashboard/page.tsx             # Resume list
│   ├── resume/[id]/page.tsx           # Resume viewer
│   ├── page.tsx                       # Landing page
│   ├── layout.tsx                     # Root layout
│   └── globals.css                    # Global styles
├── lib/
│   ├── supabase/
│   │   ├── client.ts                  # Client-side Supabase
│   │   └── server.ts                  # Server-side Supabase
│   ├── types.ts                       # TypeScript types
│   ├── latex-utils.ts                 # LaTeX helpers
│   └── ats-scorer.ts                  # Scoring logic
├── latex-compile/
│   ├── Dockerfile                     # LaTeX service container
│   ├── server.js                      # Express server
│   └── package.json                   # Dependencies
└── components/ui/                     # Reusable UI components
```

## Security Architecture

### Authentication
- Supabase Auth handles user authentication
- Anonymous sessions for guest users
- JWT tokens for API authorization

### Row Level Security (RLS)
```sql
-- Users can only access their own resumes
CREATE POLICY "Users can view own resumes"
  ON resume_versions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
```

### API Security
- Service role key never exposed to client
- All database operations use RLS
- LaTeX compilation isolated in Docker
- Input sanitization before LaTeX injection

### Storage Security
- Files organized by user ID
- Signed URLs with expiration
- RLS policies on storage objects

## Performance Considerations

### Optimization Strategies

1. **Static Generation**
   - Landing page pre-rendered
   - Reduces server load

2. **Code Splitting**
   - Pages loaded on demand
   - Smaller initial bundle

3. **Image Optimization**
   - Next.js Image component
   - Automatic format selection

4. **Database Indexing**
   - Index on user_id for fast queries
   - Index on created_at for sorting

5. **Caching**
   - Browser caching for static assets
   - CDN caching for global distribution

### Bottlenecks

1. **LLM API Calls**
   - 10-30 seconds per generation
   - Mitigated with loading states

2. **LaTeX Compilation**
   - 5-10 seconds per PDF
   - Cached after first compile

3. **PDF Storage**
   - Upload time depends on size
   - Typically < 1 second

## Monitoring & Debugging

### Client-Side
- Browser console for errors
- React DevTools for component inspection
- Network tab for API calls

### Server-Side
- Next.js logs for server errors
- Supabase dashboard for database queries
- LaTeX service logs: `docker logs latex-compile`

### Production
- Vercel Analytics for performance
- Sentry for error tracking (future)
- Supabase monitoring for database health

## Scalability

### Current Limits
- LLM rate limits (varies by provider)
- LaTeX service: 1 request at a time
- Supabase: Free tier limits

### Scaling Strategy

1. **Horizontal Scaling**
   - Add more LaTeX service instances
   - Load balance requests

2. **Caching**
   - Cache generated resumes
   - Cache LLM responses for similar inputs

3. **Queue System**
   - Add job queue for PDF compilation
   - Process requests asynchronously

4. **CDN**
   - Serve static assets from edge
   - Reduce origin server load

## Future Enhancements

### Phase 2
- RAG system for resume examples
- Multiple LaTeX templates
- Resume editing/regeneration
- Version comparison

### Phase 3
- Real-time collaboration
- Resume analytics
- A/B testing
- Job board integration

### Phase 4
- Mobile app
- Browser extension
- LinkedIn import
- Cover letter generation
