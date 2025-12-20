import { NextRequest, NextResponse } from 'next/server';
import { supabase, hasSupabase } from '@/lib/supabase';
import { generateEmbedding, hasOpenAI } from '@/lib/embeddings';
import type { AnalysisResult } from '@/lib/types/analysis';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Alias for API route compatibility
type ATSAnalysisResult = AnalysisResult;

export async function POST(request: NextRequest) {
  try {
    const { sections, jobDescription } = await request.json();

    if (!sections || !Array.isArray(sections)) {
      return NextResponse.json(
        { error: 'Resume sections required' },
        { status: 400 }
      );
    }

    // Convert resume sections to text for embedding and analysis
    const resumeText = sectionsToText(sections);
    
    // RAG (Retrieval-Augmented Generation) - Optional Enhancement
    let relevantDocs: any[] | null = null;
    
    // Only attempt RAG if OpenAI and Supabase are configured
    if (hasOpenAI && hasSupabase && supabase) {
      try {
        console.log('RAG enabled - Generating embedding for resume...');
        const resumeEmbedding = await generateEmbedding(resumeText);

        // Retrieve relevant knowledge from vector database
        console.log('Searching for relevant ATS knowledge...');
        const { data, error: searchError } = await supabase.rpc(
          'match_ats_knowledge',
          {
            query_embedding: resumeEmbedding,
            match_threshold: 0.5,
            match_count: 10,
          }
        );

        if (searchError) {
          console.error('Vector search error:', searchError);
          // Continue without RAG if vector search fails
        } else {
          relevantDocs = data;
        }
      } catch (ragError) {
        console.error('RAG enhancement failed, continuing without it:', ragError);
        // Continue without RAG if embedding generation fails
      }
    } else {
      if (!hasOpenAI) {
        console.log('OpenAI not configured, skipping RAG enhancement');
      }
      if (!hasSupabase || !supabase) {
        console.log('Supabase not configured, skipping RAG enhancement');
      }
    }

    // Build context from retrieved documents
    const retrievedContext = relevantDocs
      ? relevantDocs
          .map(
            (doc: any, idx: number) =>
              `[Document ${idx + 1} - ${doc.type}] ${doc.content}`
          )
          .join('\n\n')
      : '';

    console.log(`Retrieved ${relevantDocs?.length || 0} relevant documents`);

    // Create comprehensive AI prompt with RAG context
    const prompt = buildAnalysisPrompt(resumeText, jobDescription, retrievedContext);

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
              'You are a senior ATS analyst and career consultant with 20+ years of experience at Fortune 500 companies. You specialize in resume optimization for top tech companies, consulting firms, and financial institutions. Your analysis is trusted by recruiters at Google, Microsoft, McKinsey, and Goldman Sachs. Provide comprehensive, actionable feedback with specific examples and industry benchmarks. Return your analysis as valid JSON only, no additional text.',
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
      // Extract JSON from markdown code blocks if present
      const jsonMatch = analysisText.match(/```json\n?([\s\S]*?)\n?```/) || 
                       analysisText.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : analysisText;
      analysis = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', analysisText);
      throw new Error('Failed to parse analysis results');
    }

    return NextResponse.json({
      success: true,
      analysis,
      retrievedDocsCount: relevantDocs?.length || 0,
      ragEnabled: hasOpenAI && hasSupabase,
    });
  } catch (error) {
    console.error('ATS analysis error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze resume',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Convert resume sections to plain text for analysis
 */
function sectionsToText(sections: any[]): string {
  let text = '';

  sections.forEach((section) => {
    text += `\n\n=== ${section.type.toUpperCase()} ===\n`;

    if (section.type === 'personal-info') {
      const info = section.content;
      if (info.fullName) text += `Name: ${info.fullName}\n`;
      if (info.email) text += `Email: ${info.email}\n`;
      if (info.phone) text += `Phone: ${info.phone}\n`;
      if (info.location) text += `Location: ${info.location}\n`;
      if (info.linkedin) text += `LinkedIn: ${info.linkedin}\n`;
      if (info.website) text += `Website: ${info.website}\n`;
    } else if (section.type === 'summary') {
      text += section.content || '';
    } else if (section.type === 'experience' || section.type === 'leadership') {
      section.content.forEach((exp: any) => {
        text += `\n${exp.company} - ${exp.role}\n`;
        text += `${exp.location} | ${exp.startDate} - ${exp.endDate}\n`;
        if (exp.bullets) {
          exp.bullets.forEach((bullet: any) => {
            if (bullet.text) text += `• ${bullet.text}\n`;
          });
        }
      });
    } else if (section.type === 'education') {
      section.content.forEach((edu: any) => {
        text += `\n${edu.institution} - ${edu.degree}\n`;
        text += `${edu.location} | ${edu.graduationDate}\n`;
        if (edu.additionalInfo) text += `${edu.additionalInfo}\n`;
      });
    } else if (section.type === 'skills') {
      section.content.forEach((cat: any) => {
        text += `\n${cat.name}: ${cat.keywords.join(', ')}\n`;
      });
    } else if (section.type === 'projects') {
      section.content.forEach((proj: any) => {
        text += `\n${proj.name}\n`;
        text += `${proj.technologies}\n`;
        if (proj.description) text += `${proj.description}\n`;
      });
    } else if (section.type === 'certifications') {
      section.content.forEach((cert: any) => {
        text += `\n${cert.name} - ${cert.issuer} (${cert.date})\n`;
      });
    }
  });

  return text;
}

/**
 * Build comprehensive analysis prompt with RAG context
 */
function buildAnalysisPrompt(
  resumeText: string,
  jobDescription: string | undefined,
  retrievedContext: string
): string {
  return `You are analyzing a resume for ATS (Applicant Tracking System) compatibility and recruiter appeal.

${retrievedContext ? `RELEVANT ATS BEST PRACTICES AND REQUIREMENTS:\n${retrievedContext}\n\n` : ''}

${jobDescription ? `TARGET JOB DESCRIPTION:\n${jobDescription}\n\n` : ''}

RESUME TO ANALYZE:
${resumeText}

Provide a COMPREHENSIVE, PROFESSIONAL analysis with the following structure:

1. KEYWORD ANALYSIS:
   - List all relevant keywords found (technical skills, industry terms, job requirements)
   - Identify missing critical keywords ${jobDescription ? 'from the job description' : 'for the industry'}
   - Calculate keyword density and distribution
   - Provide specific keyword recommendations with context

2. SECTION-BY-SECTION ANALYSIS:
   For EACH section (Personal Info, Summary, Experience, Education, Skills, etc.):
   - Score (0-100) with justification
   - Word count vs. ideal word count for experience level
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

5. INDUSTRY BENCHMARKING:
   - Compare against typical resumes for this role/level
   - Identify what top performers include that this resume lacks
   - Industry-specific formatting and content expectations

6. RECRUITER APPEAL:
   - First impression assessment
   - Readability and flow
   - Professional tone and language

7. IMPROVEMENT ROADMAP:
   - Prioritized action plan
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
    "executiveSummary": "High-level overview (2-3 sentences)",
    "keyFindings": ["Top 3-5 critical findings"],
    "improvementRoadmap": "Step-by-step prioritized plan",
    "industryInsights": "Industry-specific advice and benchmarks"
  },
  "keywordAnalysis": {
    "found": ["List of keywords found in resume"],
    "missing": ["List of important missing keywords"],
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
    "topPerformers": ["What top resumes have that this one lacks"]
  }
}

SCORING CRITERIA (5 categories with specific max values):
1. ATS & Structure (max: 20 points): ATS compatibility, parseability, format compliance, keyword optimization, proper section structure
2. Content Quality (max: 40 points): Quality of content, relevance, completeness, quantifiable achievements, impact demonstration
3. Writing Quality (max: 10 points): Writing quality, clarity, professional tone, action verbs, grammar, conciseness
4. Job Optimization (max: 25 points): ${jobDescription ? 'Alignment with job description, keyword matching, role relevance, tailored content' : 'Industry alignment, role appropriateness, targeted content'}
5. Application Ready (max: 5 points): Overall readiness, completeness, professional presentation, all critical sections present, no errors

Calculate each category score based on the max value:
- ATS: 0-20 (e.g., 19/20 = excellent ATS compatibility)
- Content: 0-40 (e.g., 33/40 = good content quality)
- Writing: 0-10 (e.g., 8/10 = strong writing)
- Job Match: 0-25 (e.g., 22/25 = good job alignment)
- Ready: 0-5 (e.g., 5/5 = fully ready)

SCORING GUIDELINES:
- Be specific and cite exact examples from the resume
- Provide concrete before/after examples for suggestions
- Use industry-standard terminology
- Consider ATS parsing limitations (Taleo, Workday, Greenhouse, etc.)
- Balance technical optimization with human readability
- Reference specific line numbers or sections when possible

IMPORTANT:
- All scores should be justified with specific evidence
- Each category must include a "why" field explaining the score in 1-2 sentences
- Calculate scoreGap as the difference between overallScore and 95
- summaryFeedback should be a brief, actionable summary (e.g., "Decent — Fix Gaps to Compete", "Strong — Minor Tweaks Needed")
- Suggestions must include actionable examples
- Strengths should reference specific resume content
- Use professional, recruiter-friendly language
- Return scores in the format: { "score": <number>, "max": <max_value>, "why": "<explanation>" }

Return ONLY valid JSON, no markdown or additional text.`;
}

