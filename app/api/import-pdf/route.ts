import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore
import pdf from 'pdf-parse';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

interface ExtractedResumeData {
  personalInfo?: {
    fullName?: string;
    title?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  professionalSummary?: string;
  careerObjective?: string;
  experience?: Array<{
    company: string;
    role: string;
    additionalRole?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    bullets: Array<{ text: string }>;
  }>;
  education?: Array<{
    institution: string;
    degree: string;
    field?: string;
    startDate?: string;
    endDate?: string;
    gpa?: string;
    location?: string;
  }>;
  skills?: {
    categories: Array<{
      name: string;
      keywords: string[];
    }>;
  };
  projects?: Array<{
    name: string;
    description?: string;
    technologies?: string;
    link?: string;
  }>;
  certifications?: Array<{
    title: string;
    issuer?: string;
    date?: string;
    description?: string;
  }>;
  awards?: Array<{
    title: string;
    issuer?: string;
    date?: string;
    description?: string;
  }>;
  leadership?: Array<{
    company: string;
    role: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    bullets: Array<{ text: string }>;
  }>;
  publications?: Array<{
    title: string;
    authors?: string;
    venue?: string;
    year?: string;
    link?: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    if (!GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'File must be a PDF' },
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

    if (!resumeText || resumeText.trim().length < 50) {
      return NextResponse.json(
        { error: 'Resume appears to be empty or too short. Please upload a complete resume.' },
        { status: 400 }
      );
    }

    console.log(`Extracted ${resumeText.length} characters from PDF`);

    // Use AI to extract structured data
    const systemPrompt = `You are an expert at parsing resumes and extracting structured data. Extract all information from the resume text and return it as a JSON object matching this exact structure:

{
  "personalInfo": {
    "fullName": "string or null",
    "title": "string or null",
    "email": "string or null",
    "phone": "string or null",
    "location": "string or null",
    "linkedin": "string or null",
    "github": "string or null",
    "website": "string or null"
  },
  "professionalSummary": "string or null",
  "careerObjective": "string or null",
  "experience": [
    {
      "company": "string",
      "role": "string",
      "additionalRole": "string or null",
      "location": "string or null",
      "startDate": "string or null (format: MM/YYYY)",
      "endDate": "string or null (format: MM/YYYY or 'Present')",
      "bullets": [{"text": "string"}]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field": "string or null",
      "startDate": "string or null",
      "endDate": "string or null",
      "gpa": "string or null",
      "location": "string or null"
    }
  ],
  "skills": {
    "categories": [
      {
        "name": "string (e.g., 'Programming Languages', 'Tools', 'Frameworks')",
        "keywords": ["string"]
      }
    ]
  },
  "projects": [
    {
      "name": "string",
      "description": "string or null",
      "technologies": "string or null",
      "link": "string or null"
    }
  ],
  "certifications": [
    {
      "title": "string",
      "issuer": "string or null",
      "date": "string or null",
      "description": "string or null"
    }
  ],
  "awards": [
    {
      "title": "string",
      "issuer": "string or null",
      "date": "string or null",
      "description": "string or null"
    }
  ],
  "leadership": [
    {
      "company": "string",
      "role": "string",
      "location": "string or null",
      "startDate": "string or null",
      "endDate": "string or null",
      "bullets": [{"text": "string"}]
    }
  ],
  "publications": [
    {
      "title": "string",
      "authors": "string or null",
      "venue": "string or null",
      "year": "string or null",
      "link": "string or null"
    }
  ]
}

IMPORTANT:
- Return ONLY valid JSON, no markdown, no code blocks
- If a section doesn't exist, omit it or use empty arrays
- Extract dates in MM/YYYY format when possible
- For experience bullets, split long descriptions into individual bullet points
- Group skills into logical categories
- Be thorough and extract all available information`;

    const userPrompt = `Extract all information from this resume:\n\n${resumeText}`;

    console.log('Calling Groq API to extract structured data...');
    const groqResponse = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error('Groq API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to process resume with AI' },
        { status: 500 }
      );
    }

    const groqData = await groqResponse.json();
    const aiResponse = groqData.choices[0]?.message?.content || '';

    // Parse JSON from AI response (might be wrapped in markdown code blocks)
    let extractedData: ExtractedResumeData;
    try {
      // Remove markdown code blocks if present
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[0] : aiResponse;
      extractedData = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('AI Response:', aiResponse);
      return NextResponse.json(
        { error: 'Failed to parse extracted data. Please try again.' },
        { status: 500 }
      );
    }

    // Transform to match the frontend format
    const sections: any[] = [];

    // Personal Info
    if (extractedData.personalInfo) {
      sections.push({
        id: 'personal-info',
        type: 'personal-info',
        title: 'Personal Info',
        content: {
          fullName: extractedData.personalInfo.fullName || '',
          title: extractedData.personalInfo.title || '',
          email: extractedData.personalInfo.email || '',
          phone: extractedData.personalInfo.phone || '',
          location: extractedData.personalInfo.location || '',
          linkedin: extractedData.personalInfo.linkedin || '',
          github: extractedData.personalInfo.github || '',
          website: extractedData.personalInfo.website || '',
        },
      });
    }

    // Professional Summary
    if (extractedData.professionalSummary) {
      sections.push({
        id: `professional-summary-${Date.now()}`,
        type: 'professional-summary',
        title: 'Professional Summary',
        content: { text: extractedData.professionalSummary },
      });
    }

    // Career Objective
    if (extractedData.careerObjective) {
      sections.push({
        id: `career-objective-${Date.now()}`,
        type: 'career-objective',
        title: 'Career Objective',
        content: { text: extractedData.careerObjective },
      });
    }

    // Experience
    if (extractedData.experience && extractedData.experience.length > 0) {
      sections.push({
        id: `experience-${Date.now()}`,
        type: 'experience',
        title: 'Professional Experience',
        content: extractedData.experience.map((exp, idx) => ({
          id: `exp-${Date.now()}-${idx}`,
          company: exp.company || '',
          role: exp.role || '',
          additionalRole: exp.additionalRole || '',
          location: exp.location || '',
          startDate: exp.startDate || '',
          endDate: exp.endDate || '',
          bullets: exp.bullets.map((bullet, bidx) => ({
            id: `bullet-${Date.now()}-${idx}-${bidx}`,
            text: bullet.text || '',
          })),
        })),
      });
    }

    // Education
    if (extractedData.education && extractedData.education.length > 0) {
      sections.push({
        id: `education-${Date.now()}`,
        type: 'education',
        title: 'Education',
        content: extractedData.education.map((edu, idx) => ({
          id: `edu-${Date.now()}-${idx}`,
          institution: edu.institution || '',
          degree: edu.degree || '',
          field: edu.field || '',
          startDate: edu.startDate || '',
          endDate: edu.endDate || '',
          gpa: edu.gpa || '',
          location: edu.location || '',
        })),
      });
    }

    // Skills
    if (extractedData.skills && extractedData.skills.categories && extractedData.skills.categories.length > 0) {
      sections.push({
        id: `skills-${Date.now()}`,
        type: 'skills',
        title: 'Skills',
        content: {
          categories: extractedData.skills.categories.map((cat, idx) => ({
            id: `cat-${Date.now()}-${idx}`,
            name: cat.name || '',
            keywords: cat.keywords || [],
          })),
        },
      });
    }

    // Projects
    if (extractedData.projects && extractedData.projects.length > 0) {
      sections.push({
        id: `projects-${Date.now()}`,
        type: 'projects',
        title: 'Projects',
        content: extractedData.projects.map((proj, idx) => ({
          id: `proj-${Date.now()}-${idx}`,
          name: proj.name || '',
          description: proj.description || '',
          technologies: proj.technologies || '',
          link: proj.link || '',
        })),
      });
    }

    // Certifications
    if (extractedData.certifications && extractedData.certifications.length > 0) {
      sections.push({
        id: `certifications-${Date.now()}`,
        type: 'certifications',
        title: 'Certifications',
        content: extractedData.certifications.map((cert, idx) => ({
          id: `cert-${Date.now()}-${idx}`,
          title: cert.title || '',
          issuer: cert.issuer || '',
          date: cert.date || '',
          description: cert.description || '',
        })),
      });
    }

    // Awards
    if (extractedData.awards && extractedData.awards.length > 0) {
      sections.push({
        id: `awards-${Date.now()}`,
        type: 'awards',
        title: 'Awards & Honors',
        content: extractedData.awards.map((award, idx) => ({
          id: `award-${Date.now()}-${idx}`,
          title: award.title || '',
          issuer: award.issuer || '',
          date: award.date || '',
          description: award.description || '',
        })),
      });
    }

    // Leadership
    if (extractedData.leadership && extractedData.leadership.length > 0) {
      sections.push({
        id: `leadership-${Date.now()}`,
        type: 'leadership',
        title: 'Leadership',
        content: extractedData.leadership.map((lead, idx) => ({
          id: `lead-${Date.now()}-${idx}`,
          company: lead.company || '',
          role: lead.role || '',
          location: lead.location || '',
          startDate: lead.startDate || '',
          endDate: lead.endDate || '',
          bullets: lead.bullets.map((bullet, bidx) => ({
            id: `bullet-${Date.now()}-${idx}-${bidx}`,
            text: bullet.text || '',
          })),
        })),
      });
    }

    // Publications
    if (extractedData.publications && extractedData.publications.length > 0) {
      sections.push({
        id: `publications-${Date.now()}`,
        type: 'publications',
        title: 'Publications',
        content: extractedData.publications.map((pub, idx) => ({
          id: `pub-${Date.now()}-${idx}`,
          title: pub.title || '',
          authors: pub.authors || '',
          venue: pub.venue || '',
          year: pub.year || '',
          link: pub.link || '',
        })),
      });
    }

    return NextResponse.json({
      success: true,
      sections,
      message: `Successfully imported ${sections.length} section(s) from PDF`,
    });
  } catch (error) {
    console.error('Import PDF error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to import PDF' },
      { status: 500 }
    );
  }
}

