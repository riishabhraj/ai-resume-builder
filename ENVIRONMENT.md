# Environment Variables Setup Guide

This document explains all environment variables used by ResuCraft.

## 🔑 Required Variables

### GROQ_API_KEY
- **Purpose:** AI-powered resume analysis using Llama 3.3 70B
- **Get it from:** https://console.groq.com
- **Cost:** FREE with generous rate limits
- **Required:** YES - Core feature won't work without it
- **Format:** Starts with `gsk_`

```bash
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 🧠 Optional Variables (for RAG Enhancement)

RAG (Retrieval-Augmented Generation) enhances analysis with role-specific knowledge base.

### OPENAI_API_KEY
- **Purpose:** Generate embeddings for semantic search
- **Get it from:** https://platform.openai.com
- **Cost:** ~$0.00002 per analysis (negligible)
- **Required:** NO - App works without it (using Groq only)
- **Format:** Starts with `sk-`

```bash
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Supabase Variables

Get all three from: https://supabase.com/dashboard → Your Project → Settings → API

#### NEXT_PUBLIC_SUPABASE_URL
- **Purpose:** Supabase project URL for vector database
- **Security:** Safe to expose (public)
- **Required:** Only if using RAG
- **Format:** `https://xxxxx.supabase.co`

```bash
NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
```

#### NEXT_PUBLIC_SUPABASE_ANON_KEY
- **Purpose:** Public API key for client-side access
- **Security:** Safe to expose (public, row-level security applies)
- **Required:** Only if using RAG
- **Format:** JWT token starting with `eyJ`

```bash
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### SUPABASE_SERVICE_ROLE_KEY
- **Purpose:** Admin API key for server-side operations
- **Security:** ⚠️ KEEP SECRET - Has full database access
- **Required:** Only if using RAG
- **Format:** JWT token starting with `eyJ`

```bash
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🔧 Admin Variables

### ADMIN_API_KEY
- **Purpose:** Protect knowledge base setup endpoint
- **Security:** Keep secret - allows populating vector database
- **Required:** Only when running setup
- **Format:** Any secure random string
- **Generate:** `openssl rand -base64 32` or make up a long random string

```bash
ADMIN_API_KEY=your_super_secret_admin_key_here_make_it_long_and_random
```

---

## 🐳 LaTeX Service (Optional)

### LATEX_COMPILE_URL
- **Purpose:** URL of LaTeX compilation service for PDF generation
- **Get it from:** Run Docker service: `docker-compose up -d latex-compile`
- **Required:** Only for PDF download feature
- **Default:** `http://localhost:3001/compile`

```bash
LATEX_COMPILE_URL=http://localhost:3001/compile
```

---

## 📝 Setup Instructions

### Minimal Setup (Groq Only)
Works without RAG - generic AI suggestions:

```bash
# .env.local
GROQ_API_KEY=gsk_your_key_here
```

### Full Setup (with RAG)
Enhanced analysis with role-specific knowledge:

```bash
# .env.local
GROQ_API_KEY=gsk_your_key_here
OPENAI_API_KEY=sk_your_key_here
NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
ADMIN_API_KEY=your_admin_key
```

### With PDF Generation

```bash
# .env.local (add to above)
LATEX_COMPILE_URL=http://localhost:3001/compile
```

---

## 🎯 Feature Matrix

| Feature | Required Variables | Cost |
|---------|-------------------|------|
| **Resume Builder** | GROQ_API_KEY | FREE |
| **AI Analysis (Basic)** | GROQ_API_KEY | FREE |
| **AI Analysis (RAG)** | + OPENAI_API_KEY + Supabase | ~$0.00002/analysis |
| **PDF Download** | + LATEX_COMPILE_URL | FREE (self-hosted) |
| **Knowledge Base Setup** | + ADMIN_API_KEY | One-time |

---

## 🔒 Security Best Practices

1. **Never commit `.env.local` to Git** - Already in `.gitignore`
2. **Service Role Key** - NEVER expose in client-side code
3. **Admin API Key** - Only use in secure environments
4. **Rotate Keys** - If accidentally exposed, regenerate immediately
5. **Use Different Keys** - Dev vs Production environments

---

## ✅ Validation

The app automatically validates environment variables:

- **OpenAI:** Checks for `sk-` prefix
- **Supabase URL:** Validates HTTP/HTTPS format
- **Supabase Keys:** Checks for JWT format (`eyJ` prefix)

If variables are missing or invalid:
- App continues to work with reduced features
- Console logs indicate which features are disabled
- No crashes or errors

---

## 🚀 Deployment (Vercel)

Add these variables in: **Vercel Dashboard → Project → Settings → Environment Variables**

**Required for Production:**
```
GROQ_API_KEY
OPENAI_API_KEY (if using RAG)
NEXT_PUBLIC_SUPABASE_URL (if using RAG)
NEXT_PUBLIC_SUPABASE_ANON_KEY (if using RAG)
SUPABASE_SERVICE_ROLE_KEY (if using RAG)
```

**Select Environments:**
- ✅ Production
- ✅ Preview (optional)
- ⬜ Development (use `.env.local` instead)

**After adding/updating:** Redeploy the app!

---

## 📚 Related Documentation

- `RAG_ATS_SETUP.md` - Complete RAG setup guide
- `AI_REVIEW_SETUP.md` - AI Review feature setup
- Main `README.md` - Project overview

---

## 💡 Troubleshooting

**"RAG disabled" in logs?**
- Check if all Supabase + OpenAI variables are set
- Verify keys start with correct prefix
- Restart dev server after changing `.env.local`

**"Invalid API key" errors?**
- Double-check key format (no extra spaces)
- Verify key hasn't expired
- Try regenerating from provider dashboard

**Features not working?**
- Check browser console for errors
- Check server logs for detailed error messages
- Verify environment variables are loaded: `console.log(process.env.GROQ_API_KEY ? 'Set' : 'Missing')`

