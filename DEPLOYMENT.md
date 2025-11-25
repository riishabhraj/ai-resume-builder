# Deployment Guide

## Deploying to Production

This guide covers deploying the ATS Resume Builder to production using Vercel for the Next.js app and Google Cloud Run for the LaTeX service.

## Prerequisites

- Vercel account
- Google Cloud account (for LaTeX service) OR AWS/Azure account
- Production Supabase project
- OpenAI or Groq API key
- Domain name (optional)

## Part 1: Deploy Next.js App to Vercel

### 1. Prepare Your Repository

```bash
# Initialize git if you haven't already
git init
git add .
git commit -m "Initial commit - ATS Resume Builder Phase 1"

# Push to GitHub
git remote add origin https://github.com/yourusername/ats-resume-builder.git
git push -u origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: .next

### 3. Set Environment Variables

In Vercel project settings, add these environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-key
LLM_PROVIDER=openai
OPENAI_API_KEY=your-production-openai-key
LATEX_COMPILE_URL=https://your-latex-service-url/compile
```

Note: Leave `LATEX_COMPILE_URL` empty for now, we'll update it after deploying the LaTeX service.

### 4. Deploy

Click "Deploy" and Vercel will build and deploy your app.

Your app will be available at: `https://your-project.vercel.app`

## Part 2: Deploy LaTeX Service

### Option A: Google Cloud Run (Recommended)

#### 1. Install Google Cloud SDK

```bash
# macOS
brew install google-cloud-sdk

# Linux
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Windows
# Download from https://cloud.google.com/sdk/docs/install
```

#### 2. Initialize and Login

```bash
gcloud init
gcloud auth login
```

#### 3. Build and Push Docker Image

```bash
# Set your project ID
export PROJECT_ID=your-gcp-project-id

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Build the image
cd latex-compile
docker build -t gcr.io/$PROJECT_ID/latex-compile:latest .

# Configure Docker to use gcloud
gcloud auth configure-docker

# Push to Google Container Registry
docker push gcr.io/$PROJECT_ID/latex-compile:latest
```

#### 4. Deploy to Cloud Run

```bash
gcloud run deploy latex-compile \
  --image gcr.io/$PROJECT_ID/latex-compile:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --timeout 60s \
  --max-instances 10
```

#### 5. Get Service URL

```bash
gcloud run services describe latex-compile \
  --platform managed \
  --region us-central1 \
  --format 'value(status.url)'
```

Copy this URL and update the `LATEX_COMPILE_URL` in Vercel:

```
LATEX_COMPILE_URL=https://latex-compile-xxx-uc.a.run.app/compile
```

### Option B: AWS ECS

#### 1. Install AWS CLI

```bash
# macOS
brew install awscli

# Linux/Windows
# Download from https://aws.amazon.com/cli/
```

#### 2. Configure AWS

```bash
aws configure
```

#### 3. Create ECR Repository

```bash
aws ecr create-repository --repository-name latex-compile
```

#### 4. Build and Push

```bash
# Get login password
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build
cd latex-compile
docker build -t latex-compile .

# Tag
docker tag latex-compile:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/latex-compile:latest

# Push
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/latex-compile:latest
```

#### 5. Deploy to ECS

1. Create an ECS cluster in AWS Console
2. Create a task definition:
   - CPU: 512 (.5 vCPU)
   - Memory: 1024 (1 GB)
   - Container port: 3001
3. Create a service with Application Load Balancer
4. Note the ALB URL for `LATEX_COMPILE_URL`

### Option C: DigitalOcean App Platform

#### 1. Prepare

```bash
cd latex-compile
# Create .do directory
mkdir .do
```

#### 2. Create app.yaml

```yaml
name: latex-compile
services:
- name: latex-compile
  dockerfile_path: Dockerfile
  source_dir: /latex-compile
  github:
    repo: yourusername/ats-resume-builder
    branch: main
    deploy_on_push: true
  http_port: 3001
  instance_count: 1
  instance_size_slug: basic-xs
  routes:
  - path: /
```

#### 3. Deploy via CLI

```bash
doctl apps create --spec .do/app.yaml
```

Or use the DigitalOcean web interface to create an app from GitHub.

## Part 3: Configure Production Supabase

### 1. Create Production Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project for production
3. Wait for project to be ready

### 2. Run Migrations

The migration has already been applied via the Supabase MCP tool. Verify in your Supabase dashboard:

1. Go to Table Editor
2. Verify tables exist: `profiles`, `job_targets`, `resume_versions`
3. Go to Storage
4. Verify bucket exists: `resumes`

### 3. Get Credentials

1. Go to Project Settings → API
2. Copy values for environment variables:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### 4. Update Vercel Environment Variables

Update all Supabase environment variables in Vercel with production values.

## Part 4: Final Configuration

### 1. Update Vercel Environment Variables

In Vercel dashboard:

1. Go to Settings → Environment Variables
2. Update `LATEX_COMPILE_URL` with your deployed LaTeX service URL
3. Redeploy the app to apply changes

### 2. Test Production Deployment

1. Visit your Vercel URL
2. Create a test resume
3. Verify PDF compilation works
4. Check dashboard
5. Test download

### 3. Configure Custom Domain (Optional)

In Vercel:

1. Go to Settings → Domains
2. Add your domain (e.g., `atsresume.app`)
3. Follow DNS configuration instructions
4. Wait for SSL certificate

## Part 5: Monitoring & Maintenance

### Vercel Analytics

Enable in Vercel dashboard:
- Settings → Analytics → Enable

### Error Tracking (Optional)

Add Sentry:

```bash
npm install @sentry/nextjs
```

Configure in `next.config.js`:

```javascript
const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig(
  nextConfig,
  {
    silent: true,
    org: "your-org",
    project: "your-project",
  }
);
```

### Logs

- **Next.js logs**: Vercel dashboard → Logs
- **LaTeX service logs**:
  - Cloud Run: `gcloud run logs read latex-compile`
  - ECS: CloudWatch Logs
- **Database logs**: Supabase dashboard → Logs

### Monitoring

1. **Health Checks**
   - Set up uptime monitoring (UptimeRobot, Pingdom)
   - Monitor `/api/health` endpoint (create one)

2. **Performance**
   - Vercel Analytics for page performance
   - Supabase dashboard for database performance

3. **Costs**
   - Monitor Vercel usage
   - Monitor cloud provider costs
   - Monitor OpenAI API usage

## Part 6: Scaling Considerations

### When to Scale

- Response time > 3 seconds
- Error rate > 1%
- LaTeX service at capacity

### Scaling Strategies

1. **LaTeX Service**
   ```bash
   # Cloud Run: Increase max instances
   gcloud run services update latex-compile \
     --max-instances 50

   # Or increase resources
   gcloud run services update latex-compile \
     --memory 1Gi \
     --cpu 2
   ```

2. **Database**
   - Upgrade Supabase plan
   - Add read replicas (enterprise)

3. **Caching**
   - Add Redis for generated resumes
   - Cache LLM responses

4. **CDN**
   - Already included with Vercel
   - Configure for Supabase Storage

## Part 7: Security Checklist

- [ ] All environment variables set correctly
- [ ] Service role key never exposed to client
- [ ] RLS enabled on all tables
- [ ] Storage policies configured
- [ ] LaTeX service allows only expected origins (optional CORS)
- [ ] Rate limiting enabled (Vercel automatic)
- [ ] SSL/HTTPS enabled (Vercel automatic)
- [ ] API keys rotated regularly

## Part 8: Backup & Recovery

### Database Backups

Supabase Pro plan includes:
- Daily backups (7 days retention)
- Point-in-time recovery (paid)

Manual backup:

```bash
# Using Supabase CLI
supabase db dump -f backup.sql
```

### Code Backups

- Hosted on GitHub (already backed up)
- Download releases periodically

### Storage Backups

```bash
# Download all PDFs from Supabase Storage
supabase storage download resumes --recursive
```

## Troubleshooting Production Issues

### App Not Loading

1. Check Vercel deployment logs
2. Verify environment variables
3. Check DNS configuration
4. Clear browser cache

### PDF Compilation Fails

1. Check LaTeX service logs
2. Verify `LATEX_COMPILE_URL` is correct
3. Test LaTeX service directly:
   ```bash
   curl https://your-latex-service/health
   ```
4. Check service resource limits

### Database Errors

1. Check Supabase dashboard for errors
2. Verify RLS policies
3. Check connection limits
4. Review query performance

### High Costs

1. Review OpenAI API usage
2. Check cloud provider metrics
3. Enable caching
4. Implement rate limiting
5. Optimize database queries

## Rollback Plan

If deployment fails:

1. **Vercel**: Instant rollback to previous deployment
   - Go to Deployments → Select previous → Promote to Production

2. **LaTeX Service**: Deploy previous image
   ```bash
   gcloud run deploy latex-compile \
     --image gcr.io/$PROJECT_ID/latex-compile:previous-tag
   ```

3. **Database**: Restore from backup
   - Supabase dashboard → Backups → Restore

## Post-Deployment

1. Test all features in production
2. Monitor for 24 hours
3. Set up alerts for errors
4. Update documentation with production URLs
5. Announce to users

## Cost Optimization

1. **LLM Costs**
   - Use Groq for faster, cheaper inference
   - Cache common job descriptions
   - Rate limit requests

2. **Infrastructure**
   - Auto-scale based on traffic
   - Use spot instances for non-critical services
   - Enable compression

3. **Database**
   - Archive old resumes
   - Clean up unused data
   - Optimize queries

## Success Metrics

Track:
- Users created
- Resumes generated
- PDFs downloaded
- Average ATS score
- Generation time
- Error rate
- Conversion rate

## Support

For production issues:
- Check logs first
- Review monitoring dashboards
- Consult documentation
- Contact support (Vercel, Supabase, etc.)

---

**Deployment Complete!** Your ATS Resume Builder is now live in production.
