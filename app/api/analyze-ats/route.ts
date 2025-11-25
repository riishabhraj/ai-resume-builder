import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateEmbedding } from '@/lib/embeddings';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface ATSAnalysisResult {
  overallScore: number;
  categories: {
    keywords: number;
    format: number;
    experience: number;
    completeness: number;
    readability: number;
  };
  suggestions: Array<{
    priority: 'high' | 'medium' | 'low';
    category: string;
    suggestion: string;
    impact: string;
  }>;
  strengths: string[];
  detailedFeedback: string;
}

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
    
    console.log('Generating embedding for resume...');
    const resumeEmbedding = await generateEmbedding(resumeText);

    // Retrieve relevant knowledge from vector database
    console.log('Searching for relevant ATS knowledge...');
    let relevantDocs: any[] | null = null;
    
    if (supabase) {
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
    } else {
      console.log('Supabase not configured, skipping RAG');
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
              'You are an expert ATS (Applicant Tracking System) analyst and senior recruiter with 20+ years of experience. You provide detailed, actionable feedback to help candidates optimize their resumes for ATS systems. Return your analysis as valid JSON only, no additional text.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3, // Lower temperature for more consistent scoring
        max_tokens: 2000,
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

${jobDescription ? `JOB DESCRIPTION:\n${jobDescription}\n\n` : ''}

RESUME TO ANALYZE:
${resumeText}

Provide a comprehensive ATS analysis in the following JSON format:

{
  "overallScore": <number 0-100>,
  "categories": {
    "keywords": <number 0-100>,
    "format": <number 0-100>,
    "experience": <number 0-100>,
    "completeness": <number 0-100>,
    "readability": <number 0-100>
  },
  "suggestions": [
    {
      "priority": "high|medium|low",
      "category": "keywords|format|experience|completeness|readability",
      "suggestion": "Specific actionable suggestion",
      "impact": "Expected score improvement (e.g., +5 points)"
    }
  ],
  "strengths": ["List 3-5 strong points of the resume"],
  "detailedFeedback": "2-3 paragraph summary of the analysis"
}

SCORING CRITERIA:
- Keywords (25%): Industry terms, technical skills, job-relevant keywords${jobDescription ? ', match with job description' : ''}
- Format (20%): Standard sections, clean structure, ATS-parseable format
- Experience (30%): Action verbs, quantifiable achievements, impact demonstration
- Completeness (15%): All necessary sections present, sufficient detail
- Readability (10%): Length appropriate, clear language, professional tone

Focus on:
1. Specific, actionable improvements
2. Quantifiable metrics and achievements
3. Keyword optimization ${jobDescription ? 'for the job description' : ''}
4. ATS system compatibility
5. Recruiter appeal

Return ONLY the JSON object, no additional text or markdown.`;
}

