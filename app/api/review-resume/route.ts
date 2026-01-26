import { NextRequest, NextResponse } from 'next/server';
import { supabase, hasSupabase } from '@/lib/supabase';
import { createClient, supabaseAdmin } from '@/lib/supabase/server';
import { generateEmbedding, hasOpenAI } from '@/lib/embeddings';
import { getCategoryById, getFieldById, getExperienceLevelById } from '@/lib/job-categories';
import type { AnalysisResult } from '@/lib/types/analysis';
import { FREE_TIER_LIMITS, hasProFeatures } from '@/lib/razorpay';
// @ts-ignore
import pdf from 'pdf-parse';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Alias for API route compatibility
type ATSAnalysisResult = AnalysisResult;

// Role-specific keywords and skills that ATS systems look for
const ROLE_SPECIFIC_KEYWORDS: Record<string, string[]> = {
  // Software Engineering
  'backend-developer': ['Node.js', 'Python', 'Java', 'Go', 'REST API', 'GraphQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes', 'microservices', 'AWS', 'database design', 'system design', 'scalability'],
  'frontend-developer': ['React', 'Vue', 'Angular', 'TypeScript', 'JavaScript', 'CSS', 'Tailwind', 'HTML5', 'responsive design', 'accessibility', 'webpack', 'Next.js', 'Redux', 'UI/UX', 'performance optimization', 'cross-browser'],
  'fullstack-developer': ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'MongoDB', 'REST API', 'GraphQL', 'Docker', 'AWS', 'CI/CD', 'full stack', 'end-to-end', 'agile'],
  'mobile-developer': ['React Native', 'Flutter', 'Swift', 'Kotlin', 'iOS', 'Android', 'mobile UI', 'app store', 'push notifications', 'offline-first', 'mobile performance'],
  'devops-engineer': ['CI/CD', 'Jenkins', 'GitHub Actions', 'Docker', 'Kubernetes', 'Terraform', 'AWS', 'Azure', 'GCP', 'infrastructure as code', 'monitoring', 'Prometheus', 'Grafana', 'Linux', 'automation'],
  'sre': ['SRE', 'reliability', 'incident management', 'SLOs', 'SLIs', 'monitoring', 'observability', 'Kubernetes', 'Docker', 'on-call', 'postmortem', 'chaos engineering', 'scalability'],
  'security-engineer': ['security', 'penetration testing', 'vulnerability assessment', 'OWASP', 'encryption', 'authentication', 'authorization', 'SOC', 'SIEM', 'compliance', 'security audit'],
  'qa-engineer': ['testing', 'automation', 'Selenium', 'Cypress', 'Jest', 'test cases', 'QA', 'quality assurance', 'regression', 'CI/CD', 'bug tracking', 'test planning'],

  // Data Science & AI
  'data-scientist': ['Python', 'R', 'machine learning', 'statistics', 'pandas', 'scikit-learn', 'TensorFlow', 'PyTorch', 'data visualization', 'SQL', 'A/B testing', 'hypothesis testing', 'feature engineering'],
  'ml-engineer': ['machine learning', 'deep learning', 'TensorFlow', 'PyTorch', 'MLOps', 'model deployment', 'Python', 'neural networks', 'NLP', 'computer vision', 'model training', 'feature engineering', 'ML pipelines'],
  'data-engineer': ['ETL', 'data pipelines', 'Apache Spark', 'Airflow', 'SQL', 'Python', 'data warehouse', 'Snowflake', 'BigQuery', 'Kafka', 'data modeling', 'batch processing', 'streaming'],
  'data-analyst': ['SQL', 'Excel', 'Tableau', 'Power BI', 'data visualization', 'statistics', 'Python', 'reporting', 'dashboards', 'business intelligence', 'data analysis'],
  'ai-researcher': ['research', 'deep learning', 'neural networks', 'NLP', 'computer vision', 'publications', 'PyTorch', 'TensorFlow', 'transformers', 'reinforcement learning', 'academic'],

  // Product & Design
  'product-manager': ['product management', 'roadmap', 'stakeholder management', 'user research', 'agile', 'scrum', 'PRD', 'metrics', 'KPIs', 'prioritization', 'go-to-market', 'product strategy'],
  'ux-designer': ['UX', 'user experience', 'user research', 'wireframes', 'prototyping', 'Figma', 'usability testing', 'information architecture', 'user flows', 'accessibility'],
  'ui-designer': ['UI', 'user interface', 'visual design', 'Figma', 'Sketch', 'design systems', 'typography', 'color theory', 'responsive design', 'interaction design'],
  'product-designer': ['product design', 'UX', 'UI', 'Figma', 'prototyping', 'user research', 'design systems', 'end-to-end design', 'cross-functional'],

  // Marketing & Sales
  'digital-marketer': ['digital marketing', 'SEO', 'SEM', 'Google Ads', 'Facebook Ads', 'analytics', 'conversion optimization', 'marketing automation', 'email marketing', 'ROI'],
  'content-marketer': ['content marketing', 'content strategy', 'SEO', 'copywriting', 'blog', 'social media', 'editorial calendar', 'brand voice', 'engagement'],
  'seo-specialist': ['SEO', 'keyword research', 'Google Analytics', 'Search Console', 'link building', 'on-page SEO', 'technical SEO', 'organic traffic', 'SERP'],
  'sales-exec': ['sales', 'B2B', 'B2C', 'CRM', 'Salesforce', 'pipeline', 'quota', 'negotiation', 'closing', 'prospecting', 'account management'],
  'account-manager': ['account management', 'client relations', 'retention', 'upselling', 'CRM', 'customer success', 'relationship building', 'renewals'],

  // Business & Finance
  'business-analyst': ['business analysis', 'requirements gathering', 'process improvement', 'stakeholder management', 'documentation', 'SQL', 'data analysis', 'user stories', 'agile'],
  'financial-analyst': ['financial analysis', 'financial modeling', 'Excel', 'forecasting', 'budgeting', 'variance analysis', 'P&L', 'valuation', 'reporting'],
  'accountant': ['accounting', 'GAAP', 'financial statements', 'tax', 'audit', 'reconciliation', 'QuickBooks', 'Excel', 'accounts payable', 'accounts receivable'],
  'consultant': ['consulting', 'strategy', 'problem solving', 'client management', 'presentations', 'analysis', 'recommendations', 'project management', 'stakeholder management'],
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('resume') as File | null;
    const resumeTextParam = formData.get('resumeText') as string | null;
    const category = formData.get('category') as string;
    const field = formData.get('field') as string;
    const experience = formData.get('experience') as string;
    const resumeIdParam = formData.get('resumeId') as string | null;

    // Check if we have either a file or resumeText
    if ((!file && !resumeTextParam) || !category || !field || !experience) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Get job details
    const categoryInfo = getCategoryById(category);
    const fieldInfo = getFieldById(category, field);
    const experienceInfo = getExperienceLevelById(experience);

    if (!categoryInfo || !fieldInfo || !experienceInfo) {
      return NextResponse.json(
        { error: 'Invalid job selection' },
        { status: 400 }
      );
    }

    let resumeText = '';
    
    // If we have a file, extract text from PDF
    if (file) {
      console.log('Extracting text from PDF...');
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      try {
        const pdfData = await pdf(buffer);
        resumeText = pdfData.text;
      } catch (pdfError) {
        console.error('PDF parsing error:', pdfError);
        return NextResponse.json(
          { error: 'Failed to parse PDF. Please ensure it\'s a valid PDF file.' },
          { status: 400 }
        );
      }
      console.log(`Extracted ${resumeText.length} characters from PDF`);
    } else if (resumeTextParam) {
      // Use provided text directly
      resumeText = resumeTextParam;
      console.log(`Using provided resume text (${resumeText.length} characters)`);
    }

    if (!resumeText || resumeText.trim().length < 100) {
      return NextResponse.json(
        { error: 'Resume appears to be empty or too short. Please upload a complete resume.' },
        { status: 400 }
      );
    }

    console.log(`Using ${resumeText.length} characters for analysis`);

    // RAG (Retrieval-Augmented Generation) - Optional Enhancement
    let retrievedContext = '';
    let relevantDocsCount = 0;

    if (hasOpenAI && hasSupabase && supabase) {
      try {
        console.log('RAG enabled - Generating embedding for resume...');
        const resumeEmbedding = await generateEmbedding(resumeText);

        // Retrieve relevant knowledge from vector database
        console.log('Searching for relevant ATS knowledge...');
        const { data: relevantDocs, error: searchError } = await supabase.rpc(
          'match_ats_knowledge',
          {
            query_embedding: resumeEmbedding,
            match_threshold: 0.5,
            match_count: 15, // Get more docs for uploaded resume analysis
          }
        );

        if (searchError) {
          console.error('Vector search error:', searchError);
        } else if (relevantDocs) {
          // Build context from retrieved documents
          retrievedContext = relevantDocs
            .map(
              (doc: any, idx: number) =>
                `[Document ${idx + 1} - ${doc.type}] ${doc.content}`
            )
            .join('\n\n');
          
          relevantDocsCount = relevantDocs.length;
          console.log(`Retrieved ${relevantDocsCount} relevant documents`);
        }
      } catch (ragError) {
        console.warn('RAG failed, continuing without enhancement:', ragError);
      }
    } else {
      console.log('RAG disabled - OpenAI or Supabase not configured. Using Groq AI only.');
    }

    // Get role-specific keywords
    const roleKeywords = ROLE_SPECIFIC_KEYWORDS[field] || [];

    // Create job description context with role-specific details
    const jobContext = `
JOB TARGET:
- Category: ${categoryInfo.name}
- Role: ${fieldInfo.name}
- Experience Level: ${experienceInfo.label} (${experienceInfo.years} years)

CRITICAL KEYWORDS FOR THIS ROLE (${fieldInfo.name}):
The resume MUST contain these skills/keywords to score well for this specific role:
${roleKeywords.map(k => `- ${k}`).join('\n')}

The candidate is applying for ${fieldInfo.name} positions at the ${experienceInfo.label} level in the ${categoryInfo.name} field.

SCORING IMPACT:
- If resume contains 80%+ of these keywords: High jobMatch score (20-25/25)
- If resume contains 50-79% of these keywords: Medium jobMatch score (12-19/25)
- If resume contains <50% of these keywords: Low jobMatch score (0-11/25)
- Missing critical keywords should be flagged as HIGH priority suggestions
`;

    // Build comprehensive prompt
    const prompt = buildAnalysisPrompt(resumeText, jobContext, retrievedContext);

    // Call Groq API for analysis
    console.log('Analyzing resume with AI...');
    const groqResponse = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content:
              'You are a senior ATS analyst and career consultant with 20+ years of experience at Fortune 500 companies. You specialize in resume optimization for top tech companies, consulting firms, and financial institutions. Your analysis is trusted by recruiters at Google, Microsoft, McKinsey, and Goldman Sachs. Provide comprehensive, actionable feedback with specific examples and industry benchmarks tailored to specific roles and experience levels. Return your analysis as valid JSON only, no additional text.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.5, // Slightly higher for role-specific differentiation while maintaining quality
        max_tokens: 4000, // Increased for more comprehensive analysis
      }),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error('Groq API error:', errorText);
      throw new Error('AI analysis failed');
    }

    const groqData = await groqResponse.json();
    const analysisText = groqData.choices[0].message.content;

    // Parse JSON response
    let analysis: ATSAnalysisResult;
    try {
      // Handle markdown code blocks and extract JSON
      let jsonText = analysisText.trim();
      
      // Try to extract JSON from markdown code blocks
      const codeBlockMatch = jsonText.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
      if (codeBlockMatch && codeBlockMatch[1]) {
        jsonText = codeBlockMatch[1].trim();
      } else {
        // Try to extract just the JSON object
        const jsonObjectMatch = jsonText.match(/\{[\s\S]*\}/);
        if (jsonObjectMatch) {
          jsonText = jsonObjectMatch[0];
        }
      }
      
      analysis = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', analysisText);
      console.error('Parse error:', parseError);
      throw new Error('Failed to parse analysis results');
    }

    // Save resume to database if user is authenticated
    let savedResumeId: string | null = null;
    try {
      const supabaseClient = await createClient();
      if (supabaseClient) {
        const {
          data: { user },
          error: authError,
        } = await supabaseClient.auth.getUser();

        if (!authError && user) {
          // Check usage limits for free tier users
          // Use atomic counter increment to prevent race conditions
          const { data: result, error: rpcError } = await supabaseClient.rpc(
            'increment_review_counter',
            {
              p_user_id: user.id,
              p_limit: FREE_TIER_LIMITS.reviews_per_month,
            }
          );

          if (rpcError) {
            console.error('Error incrementing review counter:', rpcError);
            return NextResponse.json(
              { error: 'Failed to check usage limits' },
              { status: 500 }
            );
          }

          // If result is -1, limit was exceeded
          if (result === -1) {
            return NextResponse.json(
              { 
                error: 'Review limit reached',
                message: `You've used ${FREE_TIER_LIMITS.reviews_per_month} AI reviews this month. Upgrade to Pro for unlimited reviews.`,
                limitReached: true,
                upgradeRequired: true,
              },
              { status: 403 }
            );
          }
          
          // Counter was successfully incremented, continue with review

          // Extract title from resume text
          // Try to find name in first few lines (common resume format)
          let title = 'Uploaded Resume';
          const lines = resumeText.split('\n').slice(0, 10).map(line => line.trim()).filter(line => line.length > 0);
          
          // Look for name pattern (usually first line or contains email/phone)
          // Use Unicode-aware pattern to support international names
          for (const line of lines) {
            // If line looks like a name (1-4 words, Unicode letters, allows hyphens/apostrophes)
            // Pattern: Starts with uppercase letter, followed by 0-3 more name parts
            // Each part can contain letters, hyphens, and apostrophes
            if (line.match(/^[\p{Lu}][\p{L}\-'']+(\s+[\p{Lu}][\p{L}\-'']+){0,3}$/u) && !line.includes('@') && !line.match(/\d/)) {
              title = `${line}'s Resume`;
              break;
            }
            // If line contains email, the name might be before it
            if (line.includes('@')) {
              const namePart = line.split('@')[0].trim();
              // Unicode-aware pattern for email-derived names
              if (namePart.match(/^[\p{Lu}][\p{L}\-'']+(\s+[\p{Lu}][\p{L}\-'']+){0,2}$/u)) {
                title = `${namePart}'s Resume`;
                break;
              }
            }
          }
          
          // Fallback to first meaningful line if no name found
          if (title === 'Uploaded Resume' && lines.length > 0) {
            const firstLine = lines[0];
            if (firstLine.length > 0 && firstLine.length <= 50) {
              title = firstLine;
            } else if (firstLine.length > 50) {
              title = firstLine.substring(0, 47) + '...';
            }
          }

          // If resumeId is provided, update existing resume; otherwise create new one
          if (resumeIdParam) {
            // First, fetch the existing resume to preserve sections_data and title
            const { data: existingResume, error: fetchError } = await supabaseClient
              .from('resume_versions')
              .select('sections_data, title')
              .eq('id', resumeIdParam)
              .eq('user_id', user.id)
              .single();
            
            // Check for fetch errors or missing resume
            if (fetchError || !existingResume) {
              console.error('Error fetching existing resume:', fetchError);
              return NextResponse.json(
                { error: fetchError?.message || 'Resume not found' },
                { status: fetchError?.code === 'PGRST116' ? 404 : 500 }
              );
            }
            
            // Update existing resume with analysis results
            // Preserve sections_data and title if they exist
            const updateData: any = {
              plain_text: resumeText,
              ats_score: Math.round(analysis.overallScore),
              status: 'compiled', // Mark as analyzed
              updated_at: new Date().toISOString(), // Update timestamp to reflect re-analysis
            };
            
            // Preserve sections_data if it exists and is valid
            if (existingResume.sections_data && 
                (Array.isArray(existingResume.sections_data) || typeof existingResume.sections_data === 'object')) {
              updateData.sections_data = existingResume.sections_data;
            }
            
            // Preserve existing title if it exists and is not empty
            // Only use extracted title if no existing title exists or existing title is the default
            if (existingResume.title && 
                typeof existingResume.title === 'string' &&
                existingResume.title.trim() !== '' && 
                existingResume.title !== 'Uploaded Resume') {
              // Keep the existing user-set title (don't overwrite with auto-extracted title)
              updateData.title = existingResume.title;
            } else if (title && title !== 'Uploaded Resume') {
              // Use extracted title only if no existing title exists or existing title is default
              updateData.title = title.length > 100 ? title.substring(0, 100) : title;
            } else if (existingResume.title && typeof existingResume.title === 'string') {
              // Fallback: preserve existing title even if it's the default
              updateData.title = existingResume.title;
            }
            
            const { data: updatedResume, error: updateError } = await supabaseClient
              .from('resume_versions')
              .update(updateData)
              .eq('id', resumeIdParam)
              .eq('user_id', user.id) // Ensure user owns this resume
              .select('id')
              .single();

            if (updateError) {
              console.error('Error updating analyzed resume:', updateError);
              // Don't fail the request if update fails, just log it
            } else if (updatedResume) {
              savedResumeId = updatedResume.id;
              console.log('Updated analyzed resume in database:', savedResumeId);
            }
          } else {
            // Save new resume to database with status 'compiled' (not 'draft')
            const { data: savedResume, error: saveError } = await supabaseClient
              .from('resume_versions')
              .insert({
                user_id: user.id,
                title: title.length > 100 ? title.substring(0, 100) : title,
                plain_text: resumeText,
                ats_score: Math.round(analysis.overallScore),
                status: 'compiled', // Not a draft - it's been analyzed
              })
              .select('id')
              .single();

            if (saveError) {
              console.error('Error saving analyzed resume:', saveError);
              // Don't fail the request if save fails, just log it
            } else if (savedResume) {
              savedResumeId = savedResume.id;
              console.log('Saved analyzed resume to database:', savedResumeId);
            }
          }

          // After analysis is complete, store the PDF in S3 (user-specific folder)
          // Only upload PDF if a file was provided (not when using resumeText directly)
          if (savedResumeId && supabaseAdmin && file) {
            try {
              const fileName = `${user.id}/${savedResumeId}.pdf`;
              const arrayBuffer = await file.arrayBuffer();
              const buffer = Buffer.from(arrayBuffer);
              
              const { error: uploadError } = await supabaseAdmin.storage
                .from('resumes')
                .upload(fileName, buffer, {
                  contentType: 'application/pdf',
                  upsert: true,
                });

              if (uploadError) {
                console.error('Error uploading PDF to S3:', uploadError);
                // Don't fail the request if upload fails, just log it
              } else {
                // Update resume record with pdf_url - ensure user owns this resume
                // User is already validated earlier in the function, so we can safely use user.id here
                const { error: updateError } = await supabaseAdmin
                  .from('resume_versions')
                  .update({
                    pdf_url: fileName,
                    updated_at: new Date().toISOString(),
                  })
                  .eq('id', savedResumeId)
                  .eq('user_id', user.id); // Ensure user owns this resume

                if (updateError) {
                  console.error('Error updating PDF URL:', updateError);
                } else {
                  console.log('PDF stored in S3:', fileName);
                }
              }
            } catch (uploadError) {
              console.error('Error storing PDF in S3:', uploadError);
              // Don't fail the request if upload fails, just log it
            }
          } else if (savedResumeId && !file) {
            // When using resumeText directly (no PDF file), we don't store PDF in S3
            // The resume will remain as 'compiled' status but without pdf_url
            console.log('Analysis completed using resume text - PDF not stored (no file uploaded)');
          }
        }
      }
    } catch (saveError) {
      console.error('Error saving analyzed resume:', saveError);
      // Don't fail the request if save fails, just log it
    }

    return NextResponse.json({
      success: true,
      analysis,
      resumeId: savedResumeId, // Return the saved resume ID
      jobTarget: {
        category: categoryInfo.name,
        field: fieldInfo.name,
        experience: experienceInfo.label,
      },
      retrievedDocsCount: relevantDocsCount,
      ragEnabled: hasOpenAI && hasSupabase,
    });
  } catch (error) {
    console.error('Resume review error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze resume',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function buildAnalysisPrompt(
  resumeText: string,
  jobContext: string,
  retrievedContext: string
): string {
  return `You are analyzing a resume for ATS (Applicant Tracking System) compatibility and competitiveness for a SPECIFIC TARGET ROLE.

**CRITICAL: ROLE-SPECIFIC SCORING REQUIREMENT**
The same resume MUST receive DIFFERENT scores when evaluated for different roles. A software engineer resume should score differently for:
- Frontend Developer (focus on React, CSS, UI/UX skills)
- Backend Developer (focus on databases, APIs, system design)
- Machine Learning Engineer (focus on ML/AI, Python, TensorFlow, data science)
- DevOps Engineer (focus on CI/CD, cloud, infrastructure)

Your scoring MUST reflect how well this resume matches the SPECIFIC target role below, NOT just its general quality.

${retrievedContext ? `RELEVANT ATS BEST PRACTICES AND REQUIREMENTS:\n${retrievedContext}\n\n` : ''}

**TARGET ROLE FOR THIS ANALYSIS:**
${jobContext}

**RESUME TO ANALYZE:**
${resumeText}

**ROLE-SPECIFIC SCORING INSTRUCTIONS:**
- If the resume lacks skills specific to the target role, the jobMatch score MUST be LOW (0-10/25)
- If the resume has some relevant skills but missing key ones for this role, jobMatch should be MEDIUM (11-18/25)
- Only if the resume is well-tailored for THIS SPECIFIC role should jobMatch be HIGH (19-25/25)
- The content score should also reflect relevance to the target role, not just general quality
- Missing role-specific keywords should significantly impact the ATS score

Provide a COMPREHENSIVE, PROFESSIONAL analysis tailored to the target role with the following structure:

1. KEYWORD ANALYSIS:
   - List all relevant keywords found (technical skills, industry terms, role requirements)
   - Identify missing critical keywords for the target role
   - Calculate keyword density and distribution
   - Provide specific keyword recommendations with context

2. SECTION-BY-SECTION ANALYSIS:
   For EACH section (Personal Info, Summary, Experience, Education, Skills, etc.):
   - Score (0-100) with justification
   - Word count vs. ideal word count for the experience level
   - Specific strengths with examples from the resume
   - Specific weaknesses with examples
   - Actionable recommendations with before/after examples where applicable

3. QUANTIFIABLE METRICS ASSESSMENT:
   - Count of quantifiable achievements (numbers, percentages, dollar amounts)
   - Quality of metrics (impactful vs. superficial)
   - Recommendations for adding metrics where missing

4. ACTION VERBS ANALYSIS:
   - Variety and strength of action verbs used
   - Repetition issues
   - Industry-appropriate verb recommendations

5. ROLE-SPECIFIC EVALUATION:
   - How well the resume matches the target role requirements
   - Experience level appropriateness (too junior/senior)
   - Missing role-specific skills or qualifications
   - Industry alignment

6. INDUSTRY BENCHMARKING:
   - Compare against typical resumes for this role/level
   - Identify what top performers include that this resume lacks
   - Industry-specific formatting and content expectations

7. IMPROVEMENT ROADMAP:
   - Prioritized action plan tailored to the target role
   - Quick wins (high impact, low effort)
   - Long-term improvements

Return as JSON with this enhanced structure:

{
  "overallScore": <number 0-100>,
  "summaryFeedback": "<Brief summary like 'Decent — Fix Gaps to Compete'>",
  "scoreGap": <number of points needed to reach 95+>,
  "categories": {
    "ats": { "score": <number 0-20>, "max": 20, "why": "<Brief explanation of why this score>" },
    "content": { "score": <number 0-40>, "max": 40, "why": "<Brief explanation of why this score>" },
    "writing": { "score": <number 0-10>, "max": 10, "why": "<Brief explanation of why this score>" },
    "jobMatch": { "score": <number 0-25>, "max": 25, "why": "<Brief explanation of why this score>" },
    "ready": { "score": <number 0-5>, "max": 5, "why": "<Brief explanation of why this score>" }
  },
  "suggestions": [
    {
      "priority": "high|medium|low",
      "category": "keywords|format|experience|completeness|readability|quantifiableMetrics|actionVerbs",
      "suggestion": "Specific actionable suggestion with context",
      "impact": "Expected score improvement (e.g., +5 points)",
      "example": "Concrete example of how to implement",
      "beforeAfter": {
        "before": "Current text from resume",
        "after": "Improved version"
      }
    }
  ],
  "strengths": [
    {
      "point": "Strong point description",
      "evidence": "Where this appears in the resume",
      "impact": "Why this matters for ATS/recruiters"
    }
  ],
  "detailedFeedback": {
    "executiveSummary": "High-level overview tailored to target role (2-3 sentences)",
    "keyFindings": ["Top 3-5 critical findings specific to the role"],
    "improvementRoadmap": "Step-by-step prioritized plan for the target role",
    "industryInsights": "Industry-specific advice and benchmarks for this role"
  },
  "keywordAnalysis": {
    "found": ["List of keywords found in resume"],
    "missing": ["List of important missing keywords for the target role"],
    "recommendations": ["Suggested keywords to add with context"]
  },
  "sectionAnalysis": {
    "Personal Info": {
      "score": <number>,
      "strengths": ["Specific strengths"],
      "weaknesses": ["Specific weaknesses"],
      "recommendations": ["Actionable recommendations"],
      "wordCount": <number>,
      "idealWordCount": <number>
    },
    "Experience": { /* same structure */ },
    "Education": { /* same structure */ },
    "Skills": { /* same structure */ }
    /* Add other sections as found in resume */
  },
  "industryBenchmarks": {
    "averageScore": <number>,
    "percentile": <number>,
    "topPerformers": ["What top resumes for this role have that this one lacks"]
  }
}

SCORING CRITERIA (5 categories with specific max values, MUST BE TAILORED TO TARGET ROLE):

1. ATS & Structure (max: 20 points):
   - Does the resume contain keywords that ATS systems look for in THIS SPECIFIC ROLE?
   - A backend engineer resume should have different keywords than a frontend resume
   - Missing role-specific technical keywords = lower score
   - Score 15-20: Has most keywords for this role
   - Score 10-14: Has some keywords but missing important ones for this role
   - Score 0-9: Missing most keywords relevant to this specific role

2. Content Quality (max: 40 points):
   - Is the experience RELEVANT to the target role?
   - A general software engineer resume applying for ML role should score LOWER than one with ML projects
   - Score 30-40: Experience directly relevant to target role
   - Score 20-29: Some relevant experience but gaps for this role
   - Score 0-19: Experience not well-aligned with target role

3. Writing Quality (max: 10 points): Writing quality, clarity, professional tone, action verbs, grammar, industry-appropriate language, conciseness

4. Job Optimization (max: 25 points) - THIS IS THE MOST ROLE-SPECIFIC CATEGORY:
   - How well does this resume match THIS SPECIFIC role?
   - Score 20-25: Resume is clearly tailored for this exact role
   - Score 12-19: Resume has transferable skills but not tailored for this role
   - Score 0-11: Resume is for a different type of role (e.g., frontend resume for ML job)
   - CRITICAL: A general resume should NEVER score above 15 for a specialized role

5. Application Ready (max: 5 points): Overall readiness for the target role, completeness, professional presentation

IMPORTANT SCORING DIFFERENTIATION:
- The SAME resume should get DIFFERENT overall scores for different roles
- Example: A frontend-heavy resume should score ~75-85 for Frontend Developer, but only ~50-65 for Machine Learning Engineer
- The jobMatch category (25 points) is where the biggest score difference should appear

IMPORTANT CONSIDERATIONS:
1. Evaluate the resume specifically for the target role: ${jobContext}
2. Adjust expectations based on experience level (entry-level vs senior expectations)
3. Highlight missing role-specific keywords and skills
4. Consider if experience matches the target level (too junior/senior)
5. Provide role-specific action items
6. Be specific and cite exact examples from the resume
7. Provide concrete before/after examples for suggestions
8. Use industry-standard terminology
9. Consider ATS parsing limitations (Taleo, Workday, Greenhouse, etc.)

Focus on:
1. Role-specific keywords and technical skills
2. Experience relevance to target position
3. Appropriate level of detail for experience level
4. Industry-standard terminology
5. Quantifiable achievements relevant to the role
6. Specific, actionable improvements with examples

IMPORTANT:
- Return scores in the format: { "score": <number>, "max": <max_value>, "why": "<explanation>" }
- Each category must include a "why" field explaining the score in 1-2 sentences
- Calculate scoreGap as the difference between overallScore and 95
- summaryFeedback should be a brief, actionable summary (e.g., "Decent — Fix Gaps to Compete", "Strong — Minor Tweaks Needed")
- Calculate scores based on the specific max values for each category
- Be specific and cite exact examples from the resume
- Provide concrete before/after examples for suggestions
- Use professional, recruiter-friendly language

**CRITICAL REMINDER - ROLE-SPECIFIC SCORING:**
- This resume is being evaluated for: ${jobContext}
- Your scores MUST reflect fit for THIS SPECIFIC ROLE
- The jobMatch category should clearly reflect how well the resume matches the target role
- If evaluating the same resume for different roles, scores SHOULD BE DIFFERENT
- A generic software engineer resume should score LOWER for specialized roles (ML, DevOps, Security) than for general roles
- In the "why" field for each category, explain how well the resume fits THIS SPECIFIC TARGET ROLE
- Missing role-specific skills/keywords should be called out in suggestions with HIGH priority

Return ONLY valid JSON, no markdown or additional text.`;
}

