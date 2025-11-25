import { NextRequest, NextResponse } from 'next/server';
import { supabase, hasSupabase } from '@/lib/supabase';
import { generateEmbedding, hasOpenAI } from '@/lib/embeddings';
import { getCategoryById, getFieldById, getExperienceLevelById } from '@/lib/job-categories';
// @ts-ignore
import pdf from 'pdf-parse';

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
              'You are an expert ATS analyst and senior recruiter specializing in resume optimization. You provide detailed, actionable feedback tailored to specific roles and experience levels. Return your analysis as valid JSON only, no additional text.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 2500,
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

Provide a comprehensive ATS analysis tailored to the target role in the following JSON format:

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
  "detailedFeedback": "2-3 paragraph summary tailored to the target role"
}

SCORING CRITERIA (tailored to target role):
- Keywords (30%): Role-specific technical skills, industry terms, required qualifications
- Format (15%): Standard sections, clean structure, ATS-parseable format
- Experience (30%): Relevant experience for the target role and level, quantifiable achievements
- Completeness (15%): All necessary sections, appropriate detail for experience level
- Readability (10%): Length appropriate for experience level, clear language

IMPORTANT CONSIDERATIONS:
1. Evaluate the resume specifically for the target role: ${jobContext}
2. Adjust expectations based on experience level (entry-level vs senior expectations)
3. Highlight missing role-specific keywords and skills
4. Consider if experience matches the target level (too junior/senior)
5. Provide role-specific action items

Focus on:
1. Role-specific keywords and technical skills
2. Experience relevance to target position
3. Appropriate level of detail for experience level
4. Industry-standard terminology
5. Quantifiable achievements relevant to the role

Return ONLY the JSON object, no additional text or markdown.`;
}

