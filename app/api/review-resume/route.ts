import { NextRequest, NextResponse } from 'next/server';
import { supabase, hasSupabase } from '@/lib/supabase';
import { createClient } from '@/lib/supabase/server';
import { generateEmbedding, hasOpenAI } from '@/lib/embeddings';
import { getCategoryById, getFieldById, getExperienceLevelById } from '@/lib/job-categories';
import type { AnalysisResult } from '@/lib/types/analysis';
// @ts-ignore
import pdf from 'pdf-parse';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Alias for API route compatibility
type ATSAnalysisResult = AnalysisResult;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('resume') as File;
    const category = formData.get('category') as string;
    const field = formData.get('field') as string;
    const experience = formData.get('experience') as string;

    if (!file || !category || !field || !experience) {
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

    // Extract text from PDF
    console.log('Extracting text from PDF...');
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    let resumeText = '';
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

    if (!resumeText || resumeText.trim().length < 100) {
      return NextResponse.json(
        { error: 'Resume appears to be empty or too short. Please upload a complete resume.' },
        { status: 400 }
      );
    }

    console.log(`Extracted ${resumeText.length} characters from PDF`);

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

    // Create job description context
    const jobContext = `
JOB TARGET:
- Category: ${categoryInfo.name}
- Role: ${fieldInfo.name}
- Experience Level: ${experienceInfo.label} (${experienceInfo.years} years)

The candidate is applying for ${fieldInfo.name} positions at the ${experienceInfo.label} level in the ${categoryInfo.name} field.
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
        temperature: 0.4, // Balanced for detailed analysis with consistency
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

          // Save resume to database with status 'compiled' (not 'draft')
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
  return `You are analyzing a resume for ATS (Applicant Tracking System) compatibility and competitiveness for a specific role.

${retrievedContext ? `RELEVANT ATS BEST PRACTICES AND REQUIREMENTS:\n${retrievedContext}\n\n` : ''}

${jobContext}

RESUME TO ANALYZE:
${resumeText}

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

SCORING CRITERIA (5 categories with specific max values, tailored to target role):
1. ATS & Structure (max: 20 points): ATS compatibility, parseability, format compliance, keyword optimization for the target role, proper section structure
2. Content Quality (max: 40 points): Quality of content, relevance to target role, completeness, quantifiable achievements, role-specific details, impact demonstration
3. Writing Quality (max: 10 points): Writing quality, clarity, professional tone, action verbs, grammar, industry-appropriate language, conciseness
4. Job Optimization (max: 25 points): Alignment with target role requirements, keyword matching from job description, role relevance, experience level appropriateness, tailored content
5. Application Ready (max: 5 points): Overall readiness for the target role, completeness, professional presentation, all critical sections present, no errors

Calculate each category score based on the max value:
- ATS: 0-20 (e.g., 19/20 = excellent ATS compatibility)
- Content: 0-40 (e.g., 33/40 = good content quality)
- Writing: 0-10 (e.g., 8/10 = strong writing)
- Job Match: 0-25 (e.g., 22/25 = good job alignment)
- Ready: 0-5 (e.g., 5/5 = fully ready)

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

Return ONLY valid JSON, no markdown or additional text.`;
}

