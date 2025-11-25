# Quick Start Guide

## 1. Clone and Install

```bash
npm install
```

## 2. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# LLM Provider (REQUIRED - choose one)
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-your-openai-key-here
# OR
# LLM_PROVIDER=groq
# GROQ_API_KEY=your-groq-key-here

# LaTeX Service (auto-configured for local dev)
LATEX_COMPILE_URL=http://localhost:3001/compile
```

### Getting Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and create a project
2. Go to Project Settings > API
3. Copy the Project URL → `NEXT_PUBLIC_SUPABASE_URL`
4. Copy the `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Copy the `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY`

### Getting OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an account and add billing
3. Go to API Keys and create a new key
4. Copy the key → `OPENAI_API_KEY`

Alternative: Use [Groq](https://console.groq.com) for faster inference (free tier available)

## 3. Start LaTeX Compile Service

Option A - Using Docker Compose (Recommended):

```bash
docker-compose up -d
```

Option B - Manual Docker:

```bash
cd latex-compile
npm install
docker build -t latex-compile-service .
docker run --rm -d -p 3001:3001 --name latex-compile latex-compile-service
cd ..
```

Verify it's running:

```bash
curl http://localhost:3001/health
# Should return: {"status":"ok","service":"latex-compile"}
```

## 4. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 5. Test the Application

1. Click "Get Started" or navigate to `/create`
2. Fill in the resume form with test data:
   - Full Name: John Doe
   - Title: Software Engineer
   - Email: john@example.com
   - Location: San Francisco, CA
   - Summary: Experienced software engineer...
   - Skills: JavaScript, React, Node.js, Python
   - Add at least one work experience
   - Add education info
   - Optionally paste a job description
3. Click "Generate Resume"
4. Wait for AI to generate your resume (10-30 seconds)
5. Review the ATS score and recommendations
6. Click "Compile to PDF" to download

## Troubleshooting

### "Failed to generate resume"

- Check that your OpenAI/Groq API key is valid
- Verify you have API credits/quota available
- Check browser console and terminal for error messages

### "Failed to compile PDF"

- Ensure LaTeX service is running: `docker ps | grep latex-compile`
- Check service health: `curl http://localhost:3001/health`
- View service logs: `docker logs latex-compile`

### "Resume not found" or database errors

- Verify Supabase credentials are correct
- Check that migrations ran successfully in your Supabase dashboard
- Go to Supabase Dashboard > Table Editor to verify tables exist

### Build errors

```bash
rm -rf .next
npm run build
```

## Next Steps

- Customize the LaTeX template in `lib/latex-utils.ts`
- Adjust ATS scoring weights in `lib/ats-scorer.ts`
- Add more resume sections or fields
- Integrate with job board APIs
- Deploy to Vercel/Netlify

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm run typecheck # Check TypeScript types
```

## Production Deployment

1. Deploy Next.js app to Vercel:
   ```bash
   vercel
   ```

2. Deploy LaTeX service to cloud (Cloud Run, ECS, etc.)

3. Update `LATEX_COMPILE_URL` environment variable to point to deployed service

4. Configure production Supabase project and update environment variables

## Support

For issues, check:
- [README.md](./README.md) for full documentation
- Browser console for client-side errors
- Terminal output for server-side errors
- Supabase Dashboard for database issues
- LaTeX service logs: `docker logs latex-compile`
