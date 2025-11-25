import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function POST(request: NextRequest) {
  try {
    const { text, role, company } = await request.json();

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: 'Bullet point text is required' },
        { status: 400 }
      );
    }

    if (!GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Groq API key not configured' },
        { status: 500 }
      );
    }

    // Create context-aware prompt
    const contextInfo = role && company ? `for a ${role} at ${company}` : '';
    
    const prompt = `You are a senior technical recruiter with 15+ years of experience who has reviewed 50,000+ resumes and understands ATS (Applicant Tracking Systems) deeply. Your goal is to transform this bullet point ${contextInfo} to maximize ATS score and recruiter appeal.

ATS OPTIMIZATION RULES (CRITICAL):
1. Use industry-standard keywords and technical terms that ATS systems scan for
2. Start with a strong, VARIED action verb - choose the MOST appropriate one for the specific achievement. Rotate through diverse verbs such as: Architected, Engineered, Orchestrated, Designed, Developed, Implemented, Delivered, Optimized, Streamlined, Transformed, Accelerated, Established, Executed, Enhanced, Built, Created, Launched, Pioneered, Drove, Championed, Collaborated, Managed, Directed, Facilitated, Integrated, Automated, Revamped, Scaled. CRITICAL: Match the verb intensity and type to the actual work done - don't use "Spearheaded" for everything.
3. Add quantifiable metrics (%, $, #, time saved, users impacted, revenue increased)
4. Use STAR format: Action + Result + Impact
5. Avoid buzzwords like "team player", "hard worker" - use concrete achievements
6. Include relevant technical skills/tools naturally
7. Make it scannable - clear, concise, achievement-focused
8. Length: 1-2 lines maximum (ATS prefers concise)
9. VERB DIVERSITY: Select action verbs that authentically match the work described. "Architected" for system design, "Engineered" for technical building, "Orchestrated" for coordination, "Streamlined" for process improvement, "Delivered" for completing projects, etc.

RECRUITER PERSPECTIVE:
- Recruiters spend 6 seconds per resume - make impact immediately visible
- Numbers and percentages catch the eye
- Show ROI (Return on Investment) and business impact
- Demonstrate leadership, initiative, and problem-solving
- Use industry-specific terminology

Original bullet point:
"${text}"

Transform this into an ATS-optimized, recruiter-approved bullet point that:
✓ Passes ATS keyword scanning
✓ Shows measurable impact
✓ Uses strong action verbs
✓ Demonstrates concrete achievements
✓ Includes relevant technical keywords
✓ Highlights business value

Enhanced version (return ONLY the enhanced bullet point, no quotes or explanation):`;

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', // Latest and best model for this task
        messages: [
          {
            role: 'system',
            content: 'You are a senior recruiter and ATS expert who has placed 1000+ candidates at Fortune 500 companies. Provide only the enhanced, ATS-optimized bullet point without quotes or explanation. Focus on quantifiable achievements, industry keywords, and business impact. CRITICAL: Use diverse action verbs that match the specific work - avoid overusing "Spearheaded" or any single verb. Choose contextually appropriate verbs.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 250,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Groq API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to enhance bullet point' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const enhancedText = data.choices[0]?.message?.content?.trim();

    if (!enhancedText) {
      return NextResponse.json(
        { error: 'No enhanced text received from AI' },
        { status: 500 }
      );
    }

    // Remove quotes if AI added them
    const cleanedText = enhancedText.replace(/^["']|["']$/g, '');

    return NextResponse.json({
      original: text,
      enhanced: cleanedText,
      model: 'llama-3.3-70b-versatile',
    });
  } catch (error) {
    console.error('Error enhancing bullet point:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to enhance bullet point' },
      { status: 500 }
    );
  }
}

