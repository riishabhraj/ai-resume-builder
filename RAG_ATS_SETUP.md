# RAG-Enhanced ATS Analysis Setup Guide

This guide will help you set up the RAG (Retrieval-Augmented Generation) powered ATS analysis feature for ResuCraft.

## 🎯 What's Been Implemented

A complete RAG system that:
- Uses **Supabase pgvector** for vector database
- Leverages **OpenAI embeddings** for semantic search
- Utilizes **Groq AI (Llama 3.3)** for analysis
- Provides **data-backed ATS scoring** with actionable suggestions
- Features a **beautiful UI** with category breakdowns and priority suggestions

---

## 📋 Prerequisites

1. **Supabase Account** (with pgvector extension enabled)
2. **OpenAI API Key** (for embeddings)
3. **Groq API Key** (already set up)
4. **pnpm** package manager

---

## 🚀 Setup Steps

### **Step 1: Install Dependencies**

```bash
cd /Users/rishabh/resume-builder-main

# Remove node_modules to fix pnpm store issue
rm -rf node_modules

# Install all dependencies including new OpenAI package
pnpm install
```

### **Step 2: Set Up Environment Variables**

Add to your `.env.local` file:

```bash
# Existing variables
GROQ_API_KEY=your_groq_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# New variables for RAG
OPENAI_API_KEY=your_openai_api_key_here
ADMIN_API_KEY=your_random_secure_key_here  # Generate a random string for admin access
```

**How to get API keys:**

- **OpenAI**: Go to https://platform.openai.com/api-keys
- **Supabase**: 
  - URL & Anon Key: Project Settings → API
  - Service Role Key: Project Settings → API → service_role (keep secret!)
- **Admin Key**: Generate with `openssl rand -hex 32`

### **Step 3: Set Up Supabase Vector Database**

1. **Enable pgvector extension** in Supabase:
   ```sql
   -- Run this in Supabase SQL Editor
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

2. **Run the migration**:
   - Open `supabase-migrations/001_create_ats_knowledge.sql`
   - Copy the entire SQL content
   - Go to Supabase Dashboard → SQL Editor
   - Paste and run the SQL

   This creates:
   - `ats_knowledge` table with vector embeddings
   - Vector similarity search function `match_ats_knowledge()`
   - Indexes for fast retrieval

### **Step 4: Populate the Knowledge Base**

This is a **one-time setup** to load ATS best practices into the vector database.

```bash
# Make sure your dev server is running
pnpm dev

# In a new terminal, run:
curl -X POST http://localhost:3000/api/setup-knowledge-base \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_ADMIN_API_KEY"
```

Replace `YOUR_ADMIN_API_KEY` with the value you set in `.env.local`.

**Expected output:**
```json
{
  "success": true,
  "message": "Successfully processed 28 documents",
  "documentsProcessed": 28
}
```

**Check status:**
```bash
curl -X GET http://localhost:3000/api/setup-knowledge-base \
  -H "x-api-key: YOUR_ADMIN_API_KEY"
```

### **Step 5: Test the Feature**

1. Go to `http://localhost:3000/create`
2. Fill in some resume content (Personal Info, Experience, etc.)
3. Click **"Analyze ATS Score"** button (purple button in header)
4. Wait for analysis (takes 5-10 seconds)
5. View your ATS score, category breakdowns, and suggestions!

---

## 📁 Files Created

Here's what was added to your project:

```
resume-builder-main/
├── package.json                            # Updated with openai dependency
├── lib/
│   ├── supabase.ts                        # Supabase client setup
│   ├── embeddings.ts                      # OpenAI embedding utilities
│   └── ats-knowledge-base.ts              # Curated ATS knowledge documents
├── supabase-migrations/
│   └── 001_create_ats_knowledge.sql       # Database schema for vector DB
├── app/api/
│   ├── setup-knowledge-base/
│   │   └── route.ts                       # API to populate vector DB
│   └── analyze-ats/
│       └── route.ts                       # Main RAG analysis API
├── components/
│   └── ATSAnalysisModal.tsx               # Beautiful UI for analysis results
└── app/create/page.tsx                    # Updated with "Analyze ATS Score" button
```

---

## 🧠 How RAG Works

### **Traditional AI Approach:**
```
User Resume → AI Model → Generic Suggestions
```
**Problem:** AI relies only on training data (static, may be outdated)

### **RAG-Enhanced Approach:**
```
User Resume 
  ↓
Convert to embedding (vector)
  ↓
Search knowledge base for relevant best practices
  ↓
Retrieved: Top 10 most relevant ATS rules/examples
  ↓
AI Model (with retrieved context) → Data-Backed Suggestions
```
**Benefits:** 
- ✅ Grounded in real ATS requirements
- ✅ Industry-specific advice
- ✅ Always up-to-date (update knowledge base anytime)
- ✅ More accurate scoring

---

## 📊 Knowledge Base Contents

The knowledge base includes 28+ documents covering:

1. **ATS System Requirements**
   - Keyword matching rules
   - Format requirements
   - Parsing specifications

2. **Industry-Specific Keywords**
   - Software Engineering (microservices, CI/CD, etc.)
   - Frontend Engineering (React, TypeScript, etc.)
   - Backend Engineering (APIs, databases, etc.)
   - Data Science (ML, TensorFlow, etc.)
   - Product Management (roadmaps, OKRs, etc.)

3. **Best Practices**
   - STAR format for bullet points
   - Quantifiable achievements
   - Skills categorization

4. **High-Performing Examples**
   - 90+ score resume bullets
   - Before/after transformations

5. **Action Verb Library**
   - Leadership verbs
   - Technical verbs
   - Impact verbs

---

## 🔧 Customization

### **Add More Knowledge**

Edit `lib/ats-knowledge-base.ts`:

```typescript
export const atsKnowledgeBase: KnowledgeDocument[] = [
  // Add your own documents
  {
    id: 'custom-001',
    type: 'industry_keywords',
    content: 'For healthcare roles, include: HIPAA, EMR, patient care...',
    metadata: {
      industry: 'healthcare',
      role: 'nurse',
      importance: 'critical',
    },
  },
  // ... existing documents
];
```

Then re-run the setup:
```bash
curl -X POST http://localhost:3000/api/setup-knowledge-base \
  -H "x-api-key: YOUR_ADMIN_API_KEY"
```

### **Adjust Scoring Weights**

Edit `app/api/analyze-ats/route.ts` in the `buildAnalysisPrompt` function:

```typescript
SCORING CRITERIA:
- Keywords (30%): Increase if keywords are more important
- Format (15%): Decrease if format is less critical
- Experience (30%): Keep as is
- Completeness (15%): Adjust based on your needs
- Readability (10%): Adjust based on your needs
```

---

## 🎨 UI Customization

The analysis modal (`components/ATSAnalysisModal.tsx`) features:
- Circular gauge for overall score
- Category progress bars
- Priority-coded suggestions (🔴 High, 🟡 Medium, 🟢 Low)
- Strengths section
- Detailed feedback

Customize colors, layout, or add new features as needed!

---

## 💰 Cost Estimation

### **OpenAI Embeddings**
- Model: `text-embedding-3-small`
- Cost: **$0.02 per 1M tokens**
- Per analysis: ~1,000 tokens = **$0.00002** (~$0.02 per 1000 analyses)

### **Groq API**
- Model: `llama-3.3-70b-versatile`
- Cost: **FREE** (generous free tier)
- Per analysis: ~2,000 tokens

### **Total Cost**
- **Per analysis: ~$0.00002** (essentially free!)
- **1000 analyses: ~$0.02**
- **10,000 analyses: ~$0.20**

**Much cheaper than OpenAI GPT-4!** 🎉

---

## 🐛 Troubleshooting

### **pnpm install fails**
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### **Vector search returns no results**
1. Check if knowledge base is populated:
   ```bash
   curl -X GET http://localhost:3000/api/setup-knowledge-base \
     -H "x-api-key: YOUR_ADMIN_API_KEY"
   ```
2. Verify pgvector extension is enabled in Supabase

### **"Unauthorized" error**
- Check `ADMIN_API_KEY` in `.env.local`
- Restart dev server after changing env variables

### **OpenAI API errors**
- Verify `OPENAI_API_KEY` is correct
- Check API key has credits: https://platform.openai.com/usage

### **Groq API errors**
- Verify `GROQ_API_KEY` is correct
- Model might be rate-limited (wait and retry)

---

## 🎯 Next Steps

1. **Add Job Description Matching**
   - Let users paste job descriptions
   - Calculate keyword overlap
   - Suggest missing skills

2. **Historical Tracking**
   - Save analysis results to database
   - Show improvement over time
   - Compare versions

3. **More Industries**
   - Add Finance, Healthcare, Marketing keywords
   - Industry-specific scoring criteria

4. **Export Reports**
   - Download PDF analysis report
   - Share analysis link

---

## 📚 Additional Resources

- [OpenAI Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)
- [Supabase pgvector Docs](https://supabase.com/docs/guides/ai/vector-columns)
- [Groq API Documentation](https://console.groq.com/docs)
- [RAG Best Practices](https://www.pinecone.io/learn/retrieval-augmented-generation/)

---

## 🎉 You're All Set!

Your RAG-enhanced ATS analysis is ready to help users optimize their resumes with data-backed, AI-powered suggestions!

**Test it out and let me know if you need any adjustments!** 🚀

