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
      if (info.email) text += `Email: ${info.email}\n`;
      if (info.phone) text += `Phone: ${info.phone}\n`;
      if (info.location) text += `Location: ${info.location}\n`;
      text += '\n';
    } else if (section.type === 'professional-summary' || section.type === 'career-objective') {
      text += `${section.title}:\n${section.content.text || ''}\n\n`;
    } else if (section.type === 'experience' || section.type === 'leadership') {
      text += `${section.title}:\n`;
      if (Array.isArray(section.content)) {
        section.content.forEach((exp: any) => {
          if (exp.company) text += `${exp.company} - ${exp.role || ''}\n`;
          if (exp.location) text += `Location: ${exp.location}\n`;
          if (exp.startDate || exp.endDate) {
            text += `${exp.startDate || ''} - ${exp.endDate || ''}\n`;
          }
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
          if (proj.technologies) text += `Technologies: ${proj.technologies}\n`;
          text += '\n';
        });
      }
    } else if (section.type === 'education') {
      text += `${section.title}:\n`;
      if (Array.isArray(section.content)) {
        section.content.forEach((edu: any) => {
          if (edu.institution) text += `${edu.institution}\n`;
          if (edu.degree) text += `${edu.degree}\n`;
          if (edu.field) text += `${edu.field}\n`;
          text += '\n';
        });
      }
    } else if (section.type === 'skills') {
      text += `${section.title}:\n`;
      if (section.content?.categories) {
        section.content.categories.forEach((cat: any) => {
          if (cat.name) text += `${cat.name}: `;
          if (cat.keywords && Array.isArray(cat.keywords)) {
            text += cat.keywords.join(', ') + '\n';
          }
        });
      }
    }
  });
  
  return text;
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

    if (!jobDescription || !jobDescription.trim()) {
      return NextResponse.json(
        { error: 'Job description required' },
        { status: 400 }
      );
    }

    const resumeText = sectionsToText(sections);

    const prompt = `You are an expert resume writer specializing in ATS optimization and job-specific tailoring.

Job Description:
${jobDescription}

Current Resume:
${resumeText}

Task:
You are an expert resume writer. Your job is to TAILOR and ENHANCE the resume to match the job description.

1. Analyze the job description to identify key requirements, skills, keywords, and qualifications
2. For EACH experience entry, REWRITE ALL bullet points to:
   - Incorporate relevant keywords from the job description naturally
   - Add quantifiable metrics and achievements (numbers, percentages, dollar amounts)
   - Use stronger action verbs (e.g., "Led", "Architected", "Optimized" instead of "Worked on", "Helped")
   - Make descriptions more impactful and aligned with job requirements
   - Show impact and results, not just responsibilities
3. For projects, enhance descriptions to highlight relevance to the job
4. For professional summary, completely rewrite it to align with the target role and incorporate key requirements

IMPORTANT: You MUST make substantial improvements. Do not return content that is identical or nearly identical to the original. Every bullet point should be enhanced with keywords, metrics, or stronger language.

SECTIONS TO MODIFY AND ENHANCE (YOU MUST ENHANCE ALL OF THESE):
- Experience sections (experience, leadership): 
  * REWRITE ALL bullet points - do not return them as-is
  * Incorporate job-relevant keywords naturally
  * Add quantifiable metrics and achievements (numbers, percentages, dollar amounts)
  * Use stronger action verbs (Led, Architected, Optimized, Delivered, etc.)
  * Make descriptions more impactful and aligned with job requirements
  * Show impact and results, not just responsibilities
  * PRESERVE the structure: company, role, dates, location - ONLY enhance bullets
  
- Projects: 
  * ENHANCE descriptions to highlight relevance to the job
  * Add keywords from job description naturally
  * Make project descriptions more compelling and impactful
  
- Professional Summary: 
  * COMPLETELY REWRITE to align with the target role
  * Incorporate key requirements from job description
  * Make it more impactful and targeted
  * Do not return the original summary - create a new one
  
- Skills: 
  * ENHANCE the skills section to match job requirements
  * Add relevant skills from job description that the candidate likely has based on their experience
  * Reorder skills to prioritize those mentioned in the job description
  * Group skills into relevant categories
  * PRESERVE existing skills - only add/reorder/enhance, don't remove

SECTIONS TO PRESERVE EXACTLY AS IS (DO NOT INCLUDE IN YOUR RESPONSE):
- personal-info: DO NOT MODIFY - DO NOT INCLUDE in your response
- education: DO NOT MODIFY - DO NOT INCLUDE in your response

IMPORTANT: Only return sections that you are modifying. Do NOT return personal-info or education sections.

IMPORTANT RULES:
- Only suggest changes that align with the candidate's actual experience
- Never add skills, technologies, or experiences the candidate doesn't have
- Maintain the truthfulness and authenticity of the resume
- Incorporate keywords naturally, avoid keyword stuffing
- Add metrics and numbers where they make sense
- Use strong action verbs

CRITICAL INSTRUCTIONS:
- ONLY return sections that you are modifying (experience, projects, leadership, summary, skills)
- DO NOT return personal-info or education sections - they will be preserved automatically
- Focus on ENHANCING and TAILORING the content to match the job description
- Make substantial improvements - don't just return content as-is
- For experience: EVERY bullet point must be rewritten with enhancements
- For skills: Add relevant skills from job description, reorder to prioritize job-relevant skills
- If a section has no content to enhance, DO NOT return it (don't return empty sections)

Return your response as a JSON object with this structure:
{
  "tailoredSections": [
    {
      "id": "section-id",
      "type": "section-type",
      "title": "Section Title",
      "content": {
        // CRITICAL: Content structure must match exactly:
        
        // For experience/leadership sections:
        // content must be an ARRAY of objects, each with:
        // {
        //   "id": "exp-123" (preserve original id if possible),
        //   "company": "Company Name",
        //   "role": "Job Title",
        //   "additionalRole": "",
        //   "location": "City, State",
        //   "startDate": "Jan 2020",
        //   "endDate": "Dec 2022",
        //   "bullets": [
        //     { "id": "bullet-1", "text": "Enhanced bullet point text here" },
        //     { "id": "bullet-2", "text": "Another enhanced bullet" }
        //   ]
        // }
        // IMPORTANT: Each bullet MUST be an object with "id" and "text" properties, NOT a string
        
        // For projects sections:
        // content must be an ARRAY of objects:
        // {
        //   "id": "proj-123",
        //   "name": "Project Name",
        //   "description": "Enhanced description",
        //   "technologies": "Tech stack",
        //   "url": "https://..."
        // }
        
        // For professional-summary:
        // content: { "text": "Enhanced summary text" }
        
        // For skills sections:
        // content: {
        //   "categories": [
        //     {
        //       "id": "cat-123",
        //       "name": "Technical Skills",
        //       "keywords": ["Skill1", "Skill2", "Skill3"]
        //     }
        //   ]
        // }
        // IMPORTANT: Add skills from job description, reorder to prioritize job-relevant skills
        
        // For personal-info, education: return EXACTLY as received (do not modify)
      }
    }
    // ... ALL sections must be included
  ],
  "changes": [
    {
      "sectionId": "section-id",
      "sectionTitle": "Section Title",
      "changeType": "bullet_updated" | "summary_updated" | "skill_added",
      "description": "What was changed and why"
    }
  ]
}

CRITICAL: 
- For experience sections, bullets MUST be objects with "id" and "text", not strings
- Preserve original IDs when possible
- Return ALL sections, including unmodified ones
- Content structure must match the original exactly

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
      throw new Error('AI tailoring failed');
    }

    const groqData = await groqResponse.json();
    const responseText = groqData.choices[0].message.content;

    // Parse JSON response
    let result;
    try {
      const jsonMatch =
        responseText.match(/```json\n?([\s\S]*?)\n?```/) ||
        responseText.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : responseText;
      result = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText);
      console.error('Parse error:', parseError);
      throw new Error('Failed to parse tailoring results');
    }

    // Ensure we return sections in the same structure
    if (!result.tailoredSections || !Array.isArray(result.tailoredSections)) {
      console.error('Invalid AI response structure:', result);
      throw new Error('Invalid response format from AI');
    }

    // Log what we received for debugging
    console.log('AI returned', result.tailoredSections.length, 'sections');
    console.log('Original sections:', sections.length);
    result.tailoredSections.forEach((ts: any, idx: number) => {
      console.log(`AI Section ${idx}:`, { id: ts.id, type: ts.type, title: ts.title });
      if (ts.type === 'experience' || ts.type === 'leadership') {
        console.log(`  - Content is array:`, Array.isArray(ts.content));
        if (Array.isArray(ts.content)) {
          console.log(`  - Experiences count:`, ts.content.length);
          if (ts.content.length > 0) {
            console.log(`  - First exp structure:`, Object.keys(ts.content[0]));
            if (ts.content[0].bullets) {
              console.log(`  - Bullets structure:`, Array.isArray(ts.content[0].bullets), ts.content[0].bullets.length);
            }
          }
        }
      }
    });

    // Filter out empty sections and validate content BEFORE merging
    const validTailoredSections = result.tailoredSections.filter((ts: any) => {
      // Skip personal-info and education (shouldn't be in response)
      if (ts.type === 'personal-info' || ts.type === 'education') {
        return false;
      }
      
      // Validate that section has actual content
      if (!ts.content) {
        console.warn(`AI returned ${ts.type} section with no content, skipping`);
        return false;
      }
      
      // For experience/leadership, ensure it has entries
      if ((ts.type === 'experience' || ts.type === 'leadership') && 
          (!Array.isArray(ts.content) || ts.content.length === 0)) {
        console.warn(`AI returned ${ts.type} section with empty array, skipping`);
        return false;
      }
      
      // For projects, ensure it has entries
      if (ts.type === 'projects' && (!Array.isArray(ts.content) || ts.content.length === 0)) {
        console.warn(`AI returned ${ts.type} section with empty array, skipping`);
        return false;
      }
      
      // For summary, ensure it has text
      if ((ts.type === 'professional-summary' || ts.type === 'career-objective') && 
          (!ts.content.text || ts.content.text.trim() === '')) {
        console.warn(`AI returned ${ts.type} section with empty text, skipping`);
        return false;
      }
      
      // For skills, ensure it has categories
      if (ts.type === 'skills' && 
          (!ts.content.categories || !Array.isArray(ts.content.categories) || ts.content.categories.length === 0)) {
        console.warn(`AI returned ${ts.type} section with no categories, skipping`);
        return false;
      }
      
      return true;
    });
    
    console.log(`Valid tailored sections after filtering: ${validTailoredSections.length} out of ${result.tailoredSections.length}`);

    // Helper function to normalize experience content structure
    // BUG FIX: Preserves all original entries, only normalizes the ones AI provided
    const normalizeExperienceContent = (content: any, originalContent: any): any => {
      if (!Array.isArray(content)) {
        // If AI didn't return an array, use original
        return originalContent;
      }
      
      if (!Array.isArray(originalContent)) {
        // If original is not an array, just normalize AI content
        return content.map((exp: any, idx: number) => ({
          id: exp.id || `exp-${Date.now()}-${idx}`,
          company: exp.company || '',
          role: exp.role || '',
          additionalRole: exp.additionalRole || '',
          location: exp.location || '',
          startDate: exp.startDate || '',
          endDate: exp.endDate || '',
          bullets: Array.isArray(exp.bullets) ? exp.bullets : []
        }));
      }
      
      // Map AI experiences to normalized format
      const normalizedAiExperiences = content.map((exp: any, idx: number) => {
        // Find matching original experience by index, company/role, or ID
        const originalExp = originalContent[idx] || 
          originalContent.find((oe: any) => 
            (oe.company && exp.company && oe.company === exp.company) ||
            (oe.role && exp.role && oe.role === exp.role) ||
            (oe.id && exp.id && oe.id === exp.id)
          ) || { id: `exp-${Date.now()}-${idx}` };
        
        // Ensure bullets have proper structure (id and text)
        let normalizedBullets = [];
        if (exp.bullets && Array.isArray(exp.bullets)) {
          normalizedBullets = exp.bullets.map((bullet: any, bulletIdx: number) => {
            if (typeof bullet === 'string') {
              // Convert string bullet to object
              return {
                id: `bullet-${Date.now()}-${idx}-${bulletIdx}`,
                text: bullet
              };
            } else if (bullet && typeof bullet === 'object' && bullet.text) {
              // Ensure it has an id
              return {
                id: bullet.id || `bullet-${Date.now()}-${idx}-${bulletIdx}`,
                text: bullet.text
              };
            }
            return bullet;
          });
        } else if (exp.bullets && !Array.isArray(exp.bullets)) {
          // Handle case where bullets might be in wrong format
          normalizedBullets = originalExp.bullets || [];
        } else {
          // Preserve original bullets if AI didn't provide them
          normalizedBullets = originalExp.bullets || [];
        }
        
        return {
          id: originalExp.id || `exp-${Date.now()}-${idx}`,
          company: exp.company || originalExp.company || '',
          role: exp.role || originalExp.role || '',
          additionalRole: exp.additionalRole || originalExp.additionalRole || '',
          location: exp.location || originalExp.location || '',
          startDate: exp.startDate || originalExp.startDate || '',
          endDate: exp.endDate || originalExp.endDate || '',
          bullets: normalizedBullets
        };
      });
      
      // BUG FIX: Preserve original entries that weren't in AI response
      // Track which original entries were matched by AI
      const matchedOriginalIds = new Set(
        normalizedAiExperiences.map((exp: any) => exp.id)
      );
      
      // Add original entries that weren't matched
      const preservedOriginalExperiences = originalContent
        .filter((origExp: any) => !matchedOriginalIds.has(origExp.id))
        .map((origExp: any) => origExp); // Keep original structure
      
      // Combine normalized AI experiences with preserved originals
      return [...normalizedAiExperiences, ...preservedOriginalExperiences];
    };

    // Merge AI's tailored sections with original sections
    // This ensures personal-info and education are preserved
    const mergedSections = sections.map((originalSection) => {
      // CRITICAL: NEVER modify personal-info or education sections
      // Always return them exactly as they are
      if (originalSection.type === 'personal-info' || 
          originalSection.type === 'education') {
        console.log(`Preserving original ${originalSection.type} section (never modified)`);
        return originalSection;
      }
      
      // Find if AI tailored this section (match by id first, then by type)
      const tailoredSection = validTailoredSections.find(
        (ts: any) => {
          // Skip personal-info, education from AI response (we ignore them)
          if (ts.type === 'personal-info' || ts.type === 'education') {
            return false;
          }
          // Exact ID match is best
          if (ts.id === originalSection.id) return true;
          // Type match with same ID structure
          if (ts.type === originalSection.type && ts.id && originalSection.id) {
            // Check if IDs are similar (e.g., both start with same prefix)
            return ts.id.includes(originalSection.id.split('-')[0]) || 
                   originalSection.id.includes(ts.id.split('-')[0]);
          }
          // Fallback: just type match
          return ts.type === originalSection.type;
        }
      );
      
      // If AI tailored it, use the tailored version, otherwise keep original
      if (tailoredSection) {
        let normalizedContent = tailoredSection.content;
        
        // Normalize experience/leadership sections
        if ((tailoredSection.type === 'experience' || tailoredSection.type === 'leadership') && 
            Array.isArray(originalSection.content)) {
          normalizedContent = normalizeExperienceContent(tailoredSection.content, originalSection.content);
          console.log(`Normalized ${tailoredSection.type} section:`, {
            originalCount: originalSection.content.length,
            tailoredCount: tailoredSection.content?.length || 0,
            normalizedCount: normalizedContent.length
          });
        }
        // Normalize projects sections
        else if (tailoredSection.type === 'projects' && Array.isArray(originalSection.content)) {
          if (Array.isArray(tailoredSection.content)) {
            // Map AI projects to normalized format with original data
            const normalizedAiProjects = tailoredSection.content.map((proj: any, idx: number) => {
              // Find matching original project by index, name, or ID
              const originalProj = originalSection.content[idx] || 
                originalSection.content.find((op: any) => 
                  (op.name && proj.name && op.name === proj.name) ||
                  (op.id && proj.id && op.id === proj.id)
                ) || {};
              
              return {
                id: originalProj.id || proj.id || `proj-${Date.now()}-${idx}`,
                name: proj.name || originalProj.name || '',
                description: proj.description || originalProj.description || '',
                technologies: proj.technologies || originalProj.technologies || '',
                url: proj.url || originalProj.url || ''
              };
            });
            
            // BUG FIX: Preserve original projects that weren't in AI response
            // Track which original projects were matched by AI
            const matchedOriginalIds = new Set(
              normalizedAiProjects.map((proj: any) => proj.id)
            );
            
            // Add original projects that weren't matched
            const preservedOriginalProjects = originalSection.content
              .filter((origProj: any) => !matchedOriginalIds.has(origProj.id))
              .map((origProj: any) => origProj); // Keep original structure
            
            // Combine normalized AI projects with preserved originals
            normalizedContent = [...normalizedAiProjects, ...preservedOriginalProjects];
            
            console.log(`Normalized ${tailoredSection.type} section:`, {
              originalCount: originalSection.content.length,
              tailoredCount: tailoredSection.content?.length || 0,
              normalizedCount: normalizedContent.length
            });
          } else {
            normalizedContent = originalSection.content;
          }
        }
        // For professional-summary/career-objective
        else if (tailoredSection.type === 'professional-summary' || tailoredSection.type === 'career-objective') {
          // Ensure it has the text property
          if (tailoredSection.content && typeof tailoredSection.content === 'object') {
            normalizedContent = {
              text: tailoredSection.content.text || originalSection.content?.text || ''
            };
          } else if (typeof tailoredSection.content === 'string') {
            normalizedContent = { text: tailoredSection.content };
          } else {
            normalizedContent = originalSection.content;
          }
        }
        // For skills sections
        else if (tailoredSection.type === 'skills') {
          // Normalize skills content structure
          if (tailoredSection.content && tailoredSection.content.categories) {
            // Ensure categories have proper structure
            normalizedContent = {
              categories: tailoredSection.content.categories.map((cat: any, idx: number) => {
                const originalCat = originalSection.content?.categories?.[idx] || {};
                return {
                  id: originalCat.id || cat.id || `cat-${Date.now()}-${idx}`,
                  name: cat.name || originalCat.name || '',
                  keywords: Array.isArray(cat.keywords) ? cat.keywords : (originalCat.keywords || [])
                };
              })
            };
          } else if (originalSection.content?.categories) {
            // If AI didn't provide proper structure, use original but log warning
            console.warn('AI returned skills but without proper categories structure, using original');
            normalizedContent = originalSection.content;
          } else {
            normalizedContent = originalSection.content;
          }
        }
        // For other sections, use tailored content or fallback to original
        else if (!normalizedContent) {
          normalizedContent = originalSection.content;
        }
        
        // Ensure the tailored section has the same id and structure
        const merged = {
          ...tailoredSection,
          id: originalSection.id, // Always preserve original ID
          type: originalSection.type, // Always preserve original type
          title: tailoredSection.title || originalSection.title, // Use tailored title or original
          content: normalizedContent
        };
        
        console.log(`Merged section ${originalSection.id}:`, {
          type: merged.type,
          hasContent: !!merged.content,
          contentType: Array.isArray(merged.content) ? 'array' : typeof merged.content,
          contentLength: Array.isArray(merged.content) ? merged.content.length : 'N/A',
          contentPreview: Array.isArray(merged.content) 
            ? `Array with ${merged.content.length} items`
            : typeof merged.content === 'object' && merged.content.text
            ? `Summary: ${merged.content.text.substring(0, 50)}...`
            : 'Other'
        });
        
        return merged;
      }
      
      // Keep original section if not tailored
      console.log(`Keeping original section ${originalSection.id} (not tailored by AI)`);
      return originalSection;
    });

    // Add any new sections AI might have suggested (shouldn't happen, but just in case)
    const existingIds = new Set(sections.map(s => s.id));
    const existingTypes = new Set(sections.map(s => s.type));
    const newSections = validTailoredSections.filter(
      (ts: any) => !existingIds.has(ts.id) && !existingTypes.has(ts.type)
    );

    // Ensure we have at least the same number of sections, and personal-info is preserved
    let finalSections = mergedSections.length > 0 
      ? [...mergedSections, ...newSections]
      : sections; // Fallback to original if merge failed
    
    // Validate that we actually got some tailored content
    const tailoredCount = mergedSections.filter(s => {
      const original = sections.find(os => os.id === s.id);
      if (!original) return false;
      // Check if content actually changed
      return JSON.stringify(s.content) !== JSON.stringify(original.content);
    }).length;
    
    console.log(`=== VALIDATION ===`);
    console.log(`Sections actually tailored: ${tailoredCount} out of ${mergedSections.length}`);
    
    if (tailoredCount === 0 && result.tailoredSections.length > 0) {
      console.warn('WARNING: AI returned sections but no content was actually enhanced!');
    }
    
    // Final safety check: ensure personal-info exists and has correct content
    const personalInfoIndex = finalSections.findIndex(s => s.id === 'personal-info' || s.type === 'personal-info');
    if (personalInfoIndex === -1) {
      // Add it if missing
      const originalPersonalInfo = sections.find(s => s.id === 'personal-info' || s.type === 'personal-info');
      if (originalPersonalInfo) {
        finalSections.unshift(originalPersonalInfo);
        console.log('Added missing personal-info section');
      }
    } else {
      // Ensure personal-info content is preserved from original
      const originalPersonalInfo = sections.find(s => s.id === 'personal-info' || s.type === 'personal-info');
      if (originalPersonalInfo) {
        finalSections[personalInfoIndex] = originalPersonalInfo;
        console.log('Restored original personal-info content');
      }
    }
    
    // Log final section count and types
    console.log('=== FINAL MERGED SECTIONS ===');
    console.log('Total sections:', finalSections.length);
    finalSections.forEach((s, idx) => {
      console.log(`${idx}: ${s.type} (${s.id})`);
      if (s.type === 'personal-info') {
        console.log(`  Personal info content:`, {
          hasName: !!s.content?.fullName,
          name: s.content?.fullName || 'MISSING',
          hasEmail: !!s.content?.email,
          hasPhone: !!s.content?.phone
        });
      }
    });

    return NextResponse.json({
      success: true,
      tailoredSections: finalSections,
      changes: result.changes || [],
    });
  } catch (error: any) {
    console.error('Resume tailoring error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to tailor resume' },
      { status: 500 }
    );
  }
}

