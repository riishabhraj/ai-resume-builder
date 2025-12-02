import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculateATSScore } from '@/lib/ats-scorer';
import { getLatexTemplate, populateLatexTemplate, formatExperiencesForLatex, formatExperiencesFromFormData, escapeLatex } from '@/lib/latex-utils';
import type { ResumeFormData, GeneratedResume, ExperienceItem, ResumeSection } from '@/lib/types';

const LLM_PROVIDER = process.env.LLM_PROVIDER || 'openai';

async function callLLM(prompt: string): Promise<GeneratedResume> {
  if (LLM_PROVIDER === 'openai') {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert resume writer who creates ATS-optimized resumes. Always respond with valid JSON only.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    return JSON.parse(content);
  } else if (LLM_PROVIDER === 'groq') {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('Groq API key not configured');
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert resume writer who creates ATS-optimized resumes. Always respond with valid JSON only.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from LLM response');
    }
    return JSON.parse(jsonMatch[0]);
  }

  throw new Error(`Unsupported LLM provider: ${LLM_PROVIDER}`);
}

/**
 * Generate plain text resume from form data (no AI)
 */
function generatePlainTextResume(formData: ResumeFormData): string {
  let text = `${formData.fullName}\n`;
  if (formData.title) text += `${formData.title}\n`;
  if (formData.email) text += `${formData.email}`;
  if (formData.location) text += ` | ${formData.location}`;
  text += '\n\n';

  if (formData.summary) {
    text += `PROFESSIONAL SUMMARY\n${formData.summary}\n\n`;
  }

  if (formData.experiences && formData.experiences.length > 0) {
    text += 'PROFESSIONAL EXPERIENCE\n';
    formData.experiences.forEach((exp) => {
      text += `${exp.role} at ${exp.company} (${exp.start} - ${exp.end})\n`;
      exp.bullets.forEach((bullet) => {
        text += `• ${bullet}\n`;
      });
      text += '\n';
    });
  }

  if (formData.skills) {
    text += `SKILLS\n${formData.skills}\n\n`;
  }

  if (formData.education) {
    text += `EDUCATION\n${formData.education}\n`;
  }

  return text;
}

/**
 * Generate resume sections from form data (no AI)
 */
function generateResumeFromFormData(formData: ResumeFormData): GeneratedResume {
  const sections: ResumeSection[] = [];

  if (formData.summary) {
    sections.push({
      title: 'Summary',
      items: [formData.summary],
    });
  }

  if (formData.experiences && formData.experiences.length > 0) {
    sections.push({
      title: 'Work Experience',
      items: formData.experiences.map((exp) => ({
        heading: `${exp.role} — ${exp.company} (${exp.start} - ${exp.end})`,
        bullets: exp.bullets,
      })),
    });
  }

  if (formData.skills) {
    sections.push({
      title: 'Skills',
      items: [formData.skills],
    });
  }

  if (formData.education) {
    sections.push({
      title: 'Education',
      items: [formData.education],
    });
  }

  return {
    title: `Resume — ${formData.fullName}`,
    sections,
    plain_text_resume: generatePlainTextResume(formData),
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData: ResumeFormData = await request.json();

    // Use form data directly - no AI needed for basic resume creation
    const generatedResume = generateResumeFromFormData(formData);

    // Calculate ATS score (no job description needed for basic scoring)
    const atsScore = calculateATSScore(generatedResume.plain_text_resume);

    // Format experiences for LaTeX
    const experiencesLatex = formatExperiencesFromFormData(formData.experiences);

    // Format skills
    const skillsText = formData.skills
      ? `\\textbf{\\Large SKILLS}\\\\[0.1em]\n\\rule{\\textwidth}{0.5pt}\\\\[0.4em]\n${escapeLatex(formData.skills)}`
      : '';

    // Format education
    const educationText = formData.education
      ? `\\textbf{\\Large EDUCATION}\\\\[0.1em]\n\\rule{\\textwidth}{0.5pt}\\\\[0.4em]\n${escapeLatex(formData.education)}`
      : '';

    const templateId = formData.templateId || 'professional';
    const latexTemplate = getLatexTemplate(templateId);
    
    // Format contact info with proper separators
    const contactParts = [];
    if (formData.email) contactParts.push(formData.email);
    if (formData.location) contactParts.push(formData.location);
    const contactInfo = contactParts.join(' | ');
    
    // Format summary section if provided
    const summarySectionFormatted = formData.summary
      ? `\\textbf{\\Large PROFESSIONAL SUMMARY}\\\\[0.1em]\n\\rule{\\textwidth}{0.5pt}\\\\[0.4em]\n${escapeLatex(formData.summary)}`
      : '';
    
    const latexSource = populateLatexTemplate(latexTemplate, {
      name: formData.fullName,
      contact: contactInfo,
      summary: summarySectionFormatted,
      experiences: experiencesLatex,
      skills: skillsText,
      education: educationText,
    });

    // Get authenticated user
    const supabase = await createClient();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Save resume to database
    const { data: resume, error } = await supabase
      .from('resume_versions')
      .insert({
        user_id: user.id,
        title: generatedResume.title || 'Generated Resume',
        plain_text: generatedResume.plain_text_resume,
        latex_source: latexSource,
        ats_score: atsScore,
        status: 'draft',
        template_id: templateId || null,
        sections_data: generatedResume.sections || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to save resume', details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Resume generated and saved successfully');
    console.log('Resume ID:', resume.id);
    console.log('ATS Score:', atsScore);

    return NextResponse.json({
      resumeId: resume.id,
      sections: generatedResume.sections,
      atsScore,
    });
  } catch (error) {
    console.error('Error generating resume:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate resume' },
      { status: 500 }
    );
  }
}
