import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface ResumeSection {
  id: string;
  type: string;
  title: string;
  content: any;
}

function sectionsToText(sections: ResumeSection[]): string {
  let text = '';
  
  sections.forEach((section) => {
    if (section.type === 'personal-info') {
      const info = section.content;
      if (info.fullName) text += `Name: ${info.fullName}\n`;
      if (info.title) text += `Title: ${info.title}\n`;
      text += '\n';
    } else if (section.type === 'professional-summary' || section.type === 'career-objective') {
      text += `${section.title}:\n${section.content.text || ''}\n\n`;
    } else if (section.type === 'experience' || section.type === 'leadership') {
      text += `${section.title}:\n`;
      if (Array.isArray(section.content)) {
        section.content.forEach((exp: any) => {
          if (exp.company) text += `${exp.company} - ${exp.role || ''}\n`;
          if (exp.bullets && Array.isArray(exp.bullets)) {
            exp.bullets.forEach((bullet: any) => {
              const bulletText = typeof bullet === 'string' ? bullet : bullet.text;
              if (bulletText) text += `• ${bulletText}\n`;
            });
          }
          text += '\n';
        });
      }
      text += '\n';
    } else if (section.type === 'projects') {
      text += `${section.title}:\n`;
      if (Array.isArray(section.content)) {
        section.content.forEach((proj: any) => {
          if (proj.name) text += `${proj.name}\n`;
          if (proj.description) text += `${proj.description}\n`;
          text += '\n';
        });
      }
    }
  });
  
  return text;
}

export async function POST(request: NextRequest) {
  try {
    const { sections } = await request.json();

    if (!sections || !Array.isArray(sections)) {
      return NextResponse.json(
        { error: 'Resume sections required' },
        { status: 400 }
      );
    }

    const resumeText = sectionsToText(sections);

    const prompt = `You are an expert resume writer specializing in ATS optimization and professional resume enhancement.

Current Resume:
${resumeText}

Task:
Apply general optimization best practices to improve this resume:

1. Apply XYZ formula to all bullet points (Accomplished [X] by doing [Y], resulting in [Z])
2. Replace weak verbs with strong action verbs (e.g., "led" instead of "was responsible for")
3. Add quantifiable metrics and achievements where appropriate
4. Optimize for ATS compatibility by using standard formatting
5. Improve clarity and professional tone
6. Enhance professional summary with impactful language
7. Make project descriptions more compelling

SECTIONS TO OPTIMIZE:
- Experience sections (experience, leadership): Enhance bullet points
- Projects: Improve descriptions
- Professional Summary: Enhance language

SECTIONS TO PRESERVE EXACTLY AS IS:
- personal-info: DO NOT MODIFY - return exactly as received
- education: DO NOT MODIFY - return exactly as received
- skills: DO NOT MODIFY - return exactly as received
- Any other sections not mentioned above: return exactly as received

IMPORTANT RULES:
- Maintain the truthfulness of all information
- Only enhance what's already there, don't add new experiences
- Keep the same structure and organization
- Use industry-standard terminology

CRITICAL INSTRUCTIONS:
- You MUST return ALL sections from the original resume
- Include personal-info, education, and skills sections EXACTLY as they are (do not modify them)
- Only optimize experience, projects, leadership, and summary sections
- Return the complete list of ALL sections in the same order

Return your response as a JSON object with this structure:
{
  "optimizedSections": [
    {
      "id": "section-id",
      "type": "section-type",
      "title": "Section Title",
      "content": {
        // Optimized content matching the original structure
        // For personal-info, education, skills: return EXACTLY as received
      }
    }
    // ... ALL sections must be included
  ],
  "changes": [
    {
      "sectionId": "section-id",
      "sectionTitle": "Section Title",
      "changeType": "bullet_enhanced" | "summary_improved" | "verb_upgraded",
      "description": "What was improved and why"
    }
  ]
}

Return ONLY valid JSON, no additional text or markdown.`;

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
              'You are an expert resume writer. Always return valid JSON only, no markdown, no additional text.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error('Groq API error:', errorText);
      throw new Error('AI optimization failed');
    }

    const groqData = await groqResponse.json();
    const responseText = groqData.choices[0].message.content;

    // Parse JSON response
    let result: {
      optimizedSections?: any[];
      changes?: any[];
    };
    try {
      const jsonMatch =
        responseText.match(/```json\n?([\s\S]*?)\n?```/) ||
        responseText.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : responseText;
      result = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText);
      throw new Error('Failed to parse optimization results');
    }

    if (!result.optimizedSections || !Array.isArray(result.optimizedSections)) {
      throw new Error('Invalid response format from AI');
    }

    // Merge AI's optimized sections with original sections
    // This ensures personal-info and other sections are preserved
    const optimizedSections = result.optimizedSections;
    const mergedSections = sections.map((originalSection) => {
      // Find if AI optimized this section (match by id first, then by type)
      const optimizedSection = optimizedSections.find(
        (os: any) => {
          // Exact ID match is best
          if (os.id === originalSection.id) return true;
          // Type match with same ID structure
          if (os.type === originalSection.type && os.id && originalSection.id) {
            // Check if IDs are similar (e.g., both start with same prefix)
            return os.id.includes(originalSection.id.split('-')[0]) || 
                   originalSection.id.includes(os.id.split('-')[0]);
          }
          // Fallback: just type match
          return os.type === originalSection.type;
        }
      );
      
      // If AI optimized it, use the optimized version, otherwise keep original
      if (optimizedSection) {
        // Ensure the optimized section has the same id and structure
        return {
          ...optimizedSection,
          id: originalSection.id, // Always preserve original ID
          type: originalSection.type, // Always preserve original type
          title: optimizedSection.title || originalSection.title, // Use optimized title or original
          content: optimizedSection.content || originalSection.content, // Use optimized content or fallback to original
        };
      }
      
      // Keep original section if not optimized (especially important for personal-info)
      return originalSection;
    });

    // Add any new sections AI might have suggested (shouldn't happen, but just in case)
    const existingIds = new Set(sections.map(s => s.id));
    const existingTypes = new Set(sections.map(s => s.type));
    const newSections = result.optimizedSections.filter(
      (os: any) => !existingIds.has(os.id) && !existingTypes.has(os.type)
    );

    // Ensure we have at least the same number of sections, and personal-info is preserved
    const finalSections = mergedSections.length > 0 
      ? [...mergedSections, ...newSections]
      : sections; // Fallback to original if merge failed
    
    // Final safety check: ensure personal-info exists
    const hasPersonalInfo = finalSections.some(s => s.id === 'personal-info' || s.type === 'personal-info');
    if (!hasPersonalInfo) {
      const originalPersonalInfo = sections.find(s => s.id === 'personal-info' || s.type === 'personal-info');
      if (originalPersonalInfo) {
        finalSections.unshift(originalPersonalInfo);
      }
    }

    return NextResponse.json({
      success: true,
      optimizedSections: finalSections,
      changes: result.changes || [],
    });
  } catch (error: any) {
    console.error('Resume optimization error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to optimize resume' },
      { status: 500 }
    );
  }
}

