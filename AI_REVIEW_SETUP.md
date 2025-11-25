# AI Resume Review Feature - Setup Guide

## 🎯 What's This Feature?

A powerful "AI Review" feature on the homepage that allows users to:
1. **Upload existing resume PDFs** from their device
2. **Select job category** (e.g., Software Engineering, Data Science)
3. **Select specific field** (e.g., Backend Developer, Frontend Developer)
4. **Select experience level** (Entry, Mid, Senior, Lead)
5. **Get instant AI-powered analysis** with ATS score and suggestions

This is perfect for users who already have a resume and want instant feedback!

---

## 📁 Files Created

```
resume-builder-main/
├── package.json                        # Added pdf-parse dependency
├── lib/
│   └── job-categories.ts              # Job categories/fields/levels data
├── components/
│   └── AIReviewModal.tsx              # Beautiful upload & analysis modal
├── app/
│   ├── page.tsx                       # Updated with AI Review button
│   └── api/
│       └── review-resume/
│           └── route.ts               # API endpoint for PDF analysis
└── AI_REVIEW_SETUP.md                 # This file
```

---

## 🚀 Setup Steps

### **Step 1: Install New Dependency**

The `pdf-parse` package has been added to `package.json`. Install it:

```bash
cd /Users/rishabh/resume-builder-main

# Remove node_modules to avoid pnpm issues
rm -rf node_modules

# Install all dependencies
pnpm install
```

### **Step 2: Verify Environment Variables**

Make sure these are set in `.env.local` (from previous RAG setup):

```bash
OPENAI_API_KEY=sk-...
GROQ_API_KEY=gsk_...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### **Step 3: Ensure Knowledge Base is Populated**

The AI Review uses the same RAG knowledge base. Make sure you've run:

```bash
curl -X POST http://localhost:3000/api/setup-knowledge-base \
  -H "x-api-key: YOUR_ADMIN_API_KEY"
```

If you haven't set this up yet, see `RAG_ATS_SETUP.md`.

### **Step 4: Start Dev Server & Test**

```bash
pnpm dev
```

Then:
1. Go to `http://localhost:3000`
2. Click **"AI Review Resume"** button (purple button in hero section)
3. Upload a PDF resume
4. Select category → field → experience level
5. Click "Analyze Resume"
6. Get instant analysis! 🎉

---

## 🎨 How It Works

### **User Flow:**

```
1. User clicks "AI Review Resume" on homepage
   ↓
2. Modal opens with 4 steps:
   - Upload PDF resume
   - Select job category (grid of cards)
   - Select specific role (dropdown)
   - Select experience level (dropdown)
   ↓
3. Click "Analyze Resume"
   ↓
4. System:
   - Extracts text from PDF
   - Generates embedding
   - Retrieves relevant ATS knowledge (RAG)
   - Sends to Groq AI with job context
   - Returns analysis
   ↓
5. Beautiful results modal shows:
   - Overall ATS score (circular gauge)
   - Category breakdowns (progress bars)
   - Strengths (green highlights)
   - Improvement suggestions (priority-coded)
   - Detailed feedback
```

---

## 📊 Job Categories Included

### **Software Engineering** 💻
- Backend Developer
- Frontend Developer
- Full Stack Developer
- Mobile Developer
- DevOps Engineer
- Site Reliability Engineer (SRE)
- Security Engineer
- QA/Test Engineer

### **Data Science & AI** 📊
- Data Scientist
- Machine Learning Engineer
- Data Engineer
- Data Analyst
- AI Researcher

### **Product & Design** 🎨
- Product Manager
- UX Designer
- UI Designer
- Product Designer

### **Marketing & Sales** 📈
- Digital Marketing Manager
- Content Marketing Manager
- SEO Specialist
- Sales Executive
- Account Manager

### **Business & Finance** 💼
- Business Analyst
- Financial Analyst
- Accountant
- Consultant

**Want to add more?** Edit `lib/job-categories.ts`!

---

## 🔧 Customization

### **Add More Categories/Fields**

Edit `lib/job-categories.ts`:

```typescript
export const jobCategories: JobCategory[] = [
  // ... existing categories
  {
    id: 'healthcare',
    name: 'Healthcare',
    icon: '🏥',
    fields: [
      {
        id: 'nurse',
        name: 'Registered Nurse',
        experienceLevels, // Uses the standard experience levels
      },
      {
        id: 'doctor',
        name: 'Medical Doctor',
        experienceLevels,
      },
    ],
  },
];
```

### **Adjust PDF Size Limit**

By default, the modal shows "Max 10MB". To change the actual limit, update the API route to handle larger files if needed (current limit is Next.js default of 4.5MB for API routes).

### **Customize UI Colors**

The modal uses:
- **Purple** for the AI Review button (`purple-600`)
- **Brand Cyan** for primary actions
- **Priority colors**: Red (high), Yellow (medium), Green (low)

Edit `components/AIReviewModal.tsx` to change colors.

---

## 🎯 Key Differences from Built-in Analysis

| Feature | AI Review (Upload) | ATS Analysis (Built-in) |
|---------|-------------------|------------------------|
| **Input** | Upload PDF | Current resume being built |
| **Context** | Category + Field + Experience | Resume sections only |
| **Use Case** | Existing resumes | New resumes in progress |
| **Location** | Homepage | Resume editor page |
| **PDF Parsing** | Yes | No (uses structured data) |

---

## 💰 Cost Impact

### **Per Analysis:**
- **PDF Parsing**: Free (pdf-parse library)
- **OpenAI Embedding**: $0.00002 (text-embedding-3-small)
- **Groq AI Analysis**: FREE (generous free tier)

**Total: ~$0.00002 per analysis** (essentially free!)

---

## 🐛 Troubleshooting

### **"Failed to parse PDF"**
- Ensure the PDF is not password-protected
- Try exporting the PDF again (some PDFs have complex formatting)
- Check if PDF is scanned (image-based) - won't work, needs text

### **"Resume appears to be empty"**
- PDF parsing failed or PDF has no text content
- PDF might be scanned (use OCR tools first)

### **pnpm install fails**
```bash
rm -rf node_modules pnpm-lock.yaml .next
pnpm install
```

### **"Analysis failed"**
- Check Groq API key in `.env.local`
- Check if knowledge base is populated
- Check browser console for detailed errors

---

## 🎨 UI Preview

The modal features:

1. **Upload Section**
   - Drag & drop or click to upload
   - Shows file name and size when selected
   - Green checkmark on success

2. **Category Selection**
   - Grid of cards with icons
   - Hover effects
   - Active state highlighting

3. **Cascading Dropdowns**
   - Field dropdown appears after category selection
   - Experience dropdown appears after field selection

4. **Selected Summary Box**
   - Cyan-bordered summary
   - Shows full selection path
   - "Ready to analyze" confirmation

5. **Results Screen**
   - Circular gauge with gradient colors
   - Category progress bars
   - Priority-coded suggestions
   - Strengths section
   - Detailed feedback

---

## 📈 Future Enhancements

Ideas to improve the feature:

1. **Job Description Paste**
   - Add optional textarea for job description
   - Match resume keywords against JD
   - Show keyword overlap percentage

2. **Resume Comparison**
   - Allow users to upload multiple resumes
   - Compare scores side-by-side
   - Track improvements over time

3. **Export Report**
   - Download PDF analysis report
   - Share analysis link

4. **Industry-Specific Scoring**
   - Adjust scoring weights by industry
   - Finance: emphasize certifications
   - Tech: emphasize technical skills

5. **Resume Builder Integration**
   - "Import to Builder" button
   - Pre-fill builder with extracted data

---

## 🎉 You're All Set!

The AI Resume Review feature is ready to help users get instant feedback on their existing resumes!

**Test it out:**
1. Go to homepage
2. Click "AI Review Resume"
3. Upload a sample PDF
4. Select: Software Engineering → Backend Developer → Mid Level
5. See the magic! ✨

---

## 📚 Related Documentation

- `RAG_ATS_SETUP.md` - RAG system setup (required for AI Review)
- Main project README - Overall project setup
- Supabase docs - Vector database configuration

**Questions or issues?** Check the troubleshooting section or review the code comments in the files!

