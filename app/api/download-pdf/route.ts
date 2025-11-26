import { NextRequest, NextResponse } from 'next/server';
import { getLatexTemplate, populateLatexTemplate, escapeLatex } from '@/lib/latex-utils';

const LATEX_COMPILE_URL = process.env.LATEX_COMPILE_URL || 'http://localhost:3001/compile';
const PX_TO_PT = 72 / 96; // 1 CSS px = 0.75pt
const pxToPt = (px: number) => `${(px * PX_TO_PT).toFixed(2)}pt`;
const emToPt = (em: number, basePt = 11) => `${(em * basePt).toFixed(2)}pt`; // preview uses 11pt font size
const SECTION_TITLE_GAP = pxToPt(5); // h2 margin-bottom
const SECTION_RULE_GAP = pxToPt(8); // hr margin + content margin
const SECTION_SPACING = pxToPt(10); // collapsed margin between sections
const COMPANY_ROLE_GAP = pxToPt(1);
const ADDITIONAL_ROLE_GAP = pxToPt(0.5);
const EXPERIENCE_ENTRY_GAP = pxToPt(10);
const EDUCATION_ENTRY_GAP = pxToPt(10);
const PROJECT_DESC_GAP = pxToPt(3);
const ISSUER_GAP = pxToPt(2);
const DESCRIPTION_GAP = pxToPt(3);
const SKILL_CATEGORY_GAP = pxToPt(5);
const PROJECT_ENTRY_GAP = emToPt(0.8);
const CERT_ITEM_GAP = emToPt(0.8);
const SECTION_BREAK = `\n\\vspace{${SECTION_SPACING}}\n\n`;

interface ResumeSection {
  type: string;
  content: any;
}

interface PersonalInfo {
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  website?: string;
}

interface ExperienceEntry {
  id: string;
  company: string;
  location: string;
  role: string;
  additionalRole?: string;
  startDate: string;
  endDate: string;
  bullets: { id: string; text: string }[];
}

interface EducationEntry {
  id: string;
  institution: string;
  location: string;
  degree: string;
  field?: string;
  gpa?: string;
  startDate: string;
  endDate: string;
}

interface ProjectEntry {
  id: string;
  name: string;
  technologies: string;
  link?: string;
  description?: string;
  bulletPoints?: { id: string; text: string }[];
}

interface SkillCategory {
  id: string;
  name: string;
  keywords: string[];
}

interface CertificationEntry {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description?: string;
}

interface AwardEntry {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description?: string;
}

// Transform sections array to LaTeX format
function sectionsToLatex(sections: ResumeSection[]): {
  name: string;
  contact: string;
  summary: string;
  experiences: string;
  skills: string;
  education: string;
} {
  let name = 'YOUR NAME';
  let contactParts: string[] = [];
  let summary = '';
  let experiences = '';
  let skills = '';
  let education = '';

  let summaryExists = false;
  let experiencesExists = false;
  let skillsExists = false;

  sections.forEach((section) => {
    switch (section.type) {
      case 'personal-info': {
        const info = section.content as PersonalInfo;
        name = info.fullName || 'YOUR NAME';
        
        // Build contact line - MATCH PREVIEW ORDER: email | phone | location | linkedin
        if (info.email) contactParts.push(escapeLatex(info.email));
        if (info.phone) contactParts.push(escapeLatex(info.phone));
        if (info.location) contactParts.push(escapeLatex(info.location));
        if (info.linkedin) contactParts.push(escapeLatex(info.linkedin));
        if (info.website) contactParts.push(escapeLatex(info.website));
        break;
      }

      case 'professional-summary':
      case 'career-objective': {
        // MATCH PREVIEW: section.content.text (object with text property)
        const content = section.content as { text?: string };
        const summaryText = content?.text || '';
        if (summaryText) {
          summary = `\\textbf{\\Large PROFESSIONAL SUMMARY}\\\\[${SECTION_TITLE_GAP}]
\\rule{\\textwidth}{0.5pt}\\\\[${SECTION_RULE_GAP}]
${escapeLatex(summaryText)}\\\\[0.2em]`;
          summaryExists = true;
        }
        break;
      }

      case 'experience': {
        const experienceData = section.content as ExperienceEntry[];
        if (experienceData && experienceData.length > 0) {
          const prefix = summaryExists ? SECTION_BREAK : '';
          experiences = `\\textbf{\\Large PROFESSIONAL EXPERIENCE}\\\\[${SECTION_TITLE_GAP}]
\\rule{\\textwidth}{0.5pt}\\\\[${SECTION_RULE_GAP}]

`;
          experiences = prefix + experiences;
          experienceData.forEach((exp, idx) => {
            experiences += `\\textbf{${escapeLatex(exp.company)}} \\hfill \\textbf{${escapeLatex(exp.location)}}\\\\[${COMPANY_ROLE_GAP}]
\\textit{${escapeLatex(exp.role)}} \\hfill \\textbf{${formatDateRange(exp.startDate, exp.endDate)}}\\\\`;
            
            if (exp.additionalRole) {
              experiences += `\n\\textit{${escapeLatex(exp.additionalRole)}}\\\\[${ADDITIONAL_ROLE_GAP}]`;
            }
            
            if (exp.bullets && exp.bullets.length > 0) {
              experiences += '\n\\begin{itemize}\n';
              exp.bullets.forEach((bullet) => {
                if (bullet.text.trim()) {
                  experiences += `  \\item ${escapeLatex(bullet.text)}\n`;
                }
              });
              experiences += '\\end{itemize}';
            }
            
            if (idx < experienceData.length - 1) {
              experiences += `\n\\vspace{${EXPERIENCE_ENTRY_GAP}}\n\n`;
            }
          });
          experiencesExists = true;
        }
        break;
      }

      case 'leadership': {
        const leadershipData = section.content as ExperienceEntry[];
        if (leadershipData && leadershipData.length > 0) {
          if (experiences) {
            experiences += SECTION_BREAK;
          }
          experiences += `\\textbf{\\Large LEADERSHIP EXPERIENCE}\\\\[${SECTION_TITLE_GAP}]
\\rule{\\textwidth}{0.5pt}\\\\[${SECTION_RULE_GAP}]

`;
          leadershipData.forEach((exp, idx) => {
            experiences += `\\textbf{${escapeLatex(exp.company)}} \\hfill \\textbf{${escapeLatex(exp.location)}}\\\\[${COMPANY_ROLE_GAP}]
\\textit{${escapeLatex(exp.role)}} \\hfill \\textbf{${formatDateRange(exp.startDate, exp.endDate)}}\\\\`;
            
            if (exp.additionalRole) {
              experiences += `\n\\textit{${escapeLatex(exp.additionalRole)}}\\\\[${ADDITIONAL_ROLE_GAP}]`;
            }
            
            if (exp.bullets && exp.bullets.length > 0) {
              experiences += '\n\\begin{itemize}\n';
              exp.bullets.forEach((bullet) => {
                if (bullet.text.trim()) {
                  experiences += `  \\item ${escapeLatex(bullet.text)}\n`;
                }
              });
              experiences += '\\end{itemize}';
            }
            
            if (idx < leadershipData.length - 1) {
              experiences += `\n\\vspace{${EXPERIENCE_ENTRY_GAP}}\n\n`;
            }
          });
        }
        break;
      }

      case 'education': {
        const educationData = section.content as EducationEntry[];
        if (educationData && educationData.length > 0) {
          const prefix = (summaryExists || experiencesExists || skillsExists) ? SECTION_BREAK : '';
          education = prefix + `\\textbf{\\Large EDUCATION}\\\\[${SECTION_TITLE_GAP}]
\\rule{\\textwidth}{0.5pt}\\\\[${SECTION_RULE_GAP}]

`;
          educationData.forEach((edu, idx) => {
            education += `\\textbf{${escapeLatex(edu.institution)}} \\hfill \\textbf{${escapeLatex(edu.location)}}\\\\[${COMPANY_ROLE_GAP}]
\\textit{${formatEducationDegree(edu.degree, edu.field, edu.gpa)}} \\hfill \\textbf{${formatDateRange(edu.startDate, edu.endDate)}}\\\\`;
            
            if (idx < educationData.length - 1) {
              education += `\n\\vspace{${EDUCATION_ENTRY_GAP}}\n\n`;
            }
          });
        }
        break;
      }

      case 'projects': {
        const projectsData = section.content as ProjectEntry[];
        if (projectsData && projectsData.length > 0) {
          if (experiences) {
            experiences += SECTION_BREAK;
          }
          experiences += `\\textbf{\\Large PROJECTS}\\\\[${SECTION_TITLE_GAP}]
\\rule{\\textwidth}{0.5pt}\\\\[${SECTION_RULE_GAP}]

`;
          projectsData.forEach((proj, idx) => {
            // MATCH PREVIEW: Show as bullet list item with name, link, technologies, and description
            experiences += '\\begin{itemize}\n';
            let projectLine = `  \\item \\textbf{${escapeLatex(proj.name)}}`;
            if (proj.link) {
              projectLine += ` (\\href{${escapeLatex(proj.link)}}{Link})`;
            }
            if (proj.technologies) {
              projectLine += ` \\hfill \\textit{${escapeLatex(proj.technologies)}}`;
            }
            experiences += projectLine + '\n';
            
            // MATCH PREVIEW: Show description if available (marginTop 4px)
            if (proj.description) {
              experiences += `  ${escapeLatex(proj.description)}\\\\[${PROJECT_DESC_GAP}]\n`;
            }
            
            // Also handle bulletPoints if they exist (for backward compatibility)
            if (proj.bulletPoints && proj.bulletPoints.length > 0) {
              proj.bulletPoints.forEach((bullet) => {
                if (bullet.text.trim()) {
                  experiences += `  \\item ${escapeLatex(bullet.text)}\n`;
                }
              });
            }
            
            experiences += '\\end{itemize}';
            
            if (idx < projectsData.length - 1) {
              experiences += `\n\\vspace{${PROJECT_ENTRY_GAP}}\n\n`;
            }
          });
        }
        break;
      }

      case 'skills': {
        // MATCH PREVIEW: section.content.categories (nested structure)
        const skillsContent = section.content as { categories?: SkillCategory[] };
        const skillsData = skillsContent?.categories || [];
        if (skillsData.length > 0) {
          const prefix = (summaryExists || experiencesExists) ? SECTION_BREAK : '';
          skills = prefix + `\\textbf{\\Large SKILLS}\\\\[${SECTION_TITLE_GAP}]
\\rule{\\textwidth}{0.5pt}\\\\[${SECTION_RULE_GAP}]

`;
          skillsData.forEach((category, idx) => {
            if (category.keywords && category.keywords.length > 0) {
              skills += `\\textbf{${escapeLatex(category.name)}:} ${category.keywords.map(k => escapeLatex(k)).join(', ')}`;
              // MATCH PREVIEW: category marginBottom 6px=0.54em (except last)
              if (idx < skillsData.length - 1) {
                skills += `\\\\[${SKILL_CATEGORY_GAP}]\n`;
              } else {
                skills += '\n';
              }
            }
          });
          skillsExists = true;
        }
        break;
      }

      case 'certifications': {
        const certData = section.content as CertificationEntry[];
        if (certData && certData.length > 0) {
          if (education) {
            education += SECTION_BREAK;
          } else if (summaryExists || experiencesExists || skillsExists) {
            education += SECTION_BREAK;
          }
          education += `\\textbf{\\Large CERTIFICATIONS}\\\\[${SECTION_TITLE_GAP}]
\\rule{\\textwidth}{0.5pt}\\\\[${SECTION_RULE_GAP}]

`;
          certData.forEach((cert, idx) => {
            // MATCH PREVIEW: Title on left, Date on right
            education += `\\textbf{${escapeLatex(cert.title)}} \\hfill \\textbf{${escapeLatex(cert.date)}}\\\\`;
            // MATCH PREVIEW: Issuer on next line (marginTop 2px=0.18em)
            if (cert.issuer) {
              education += `\\textit{${escapeLatex(cert.issuer)}}\\\\[${ISSUER_GAP}]`;
            }
            // MATCH PREVIEW: Description on next line (marginTop 4px=0.36em)
            if (cert.description) {
              education += `${escapeLatex(cert.description)}\\\\[${DESCRIPTION_GAP}]`;
            }
            // MATCH PREVIEW: item marginBottom 0.8em (except last)
            if (idx < certData.length - 1) {
              education += `\n\\vspace{${CERT_ITEM_GAP}}\n\n`;
            } else {
              education += '\n';
            }
          });
        }
        break;
      }

      case 'awards': {
        const awardData = section.content as AwardEntry[];
        if (awardData && awardData.length > 0) {
          if (education) {
            education += SECTION_BREAK;
          } else if (summaryExists || experiencesExists || skillsExists) {
            education += SECTION_BREAK;
          }
          education += `\\textbf{\\Large AWARDS}\\\\[${SECTION_TITLE_GAP}]
\\rule{\\textwidth}{0.5pt}\\\\[${SECTION_RULE_GAP}]

`;
          awardData.forEach((award, idx) => {
            // MATCH PREVIEW: Title on left, Date on right
            education += `\\textbf{${escapeLatex(award.title)}} \\hfill \\textbf{${escapeLatex(award.date)}}\\\\`;
            // MATCH PREVIEW: Issuer on next line (marginTop 2px=0.18em)
            if (award.issuer) {
              education += `\\textit{${escapeLatex(award.issuer)}}\\\\[${ISSUER_GAP}]`;
            }
            // MATCH PREVIEW: Description on next line (marginTop 4px=0.36em)
            if (award.description) {
              education += `${escapeLatex(award.description)}\\\\[${DESCRIPTION_GAP}]`;
            }
            // MATCH PREVIEW: item marginBottom 0.8em (except last)
            if (idx < awardData.length - 1) {
              education += `\n\\vspace{${CERT_ITEM_GAP}}\n\n`;
            } else {
              education += '\n';
            }
          });
        }
        break;
      }
    }
  });

  return {
    name,
    contact: contactParts.join(' | '), // MATCH PREVIEW: Use | separator
    summary,
    experiences,
    skills,
    education,
  };
}

// Helper function to format date range - MATCH PREVIEW: startDate - endDate or endDate || startDate
function formatDateRange(startDate: string, endDate: string): string {
  if (startDate && endDate) {
    return `${escapeLatex(startDate)} - ${escapeLatex(endDate)}`;
  } else if (endDate) {
    return escapeLatex(endDate);
  } else if (startDate) {
    return escapeLatex(startDate);
  }
  return '';
}

// Helper function to format education degree - MATCH PREVIEW: {degree} in {field} (GPA: {gpa})
function formatEducationDegree(degree: string, field?: string, gpa?: string): string {
  let result = escapeLatex(degree || '');
  if (field) {
    result += ` in ${escapeLatex(field)}`;
  }
  if (gpa) {
    result += ` (GPA: ${escapeLatex(gpa)})`;
  }
  return result;
}

export async function POST(request: NextRequest) {
  try {
    const { sections, templateId } = await request.json();

    if (!sections || !Array.isArray(sections)) {
      return NextResponse.json({ error: 'Sections array required' }, { status: 400 });
    }

    // Transform sections to LaTeX data
    const latexData = sectionsToLatex(sections);

    // Get template and populate it
    const template = getLatexTemplate(templateId || 'professional');
    const latexSource = populateLatexTemplate(template, latexData);

    // Send to LaTeX compile service
    const compileResponse = await fetch(LATEX_COMPILE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        latex_source: latexSource,
        file_name: `resume_${Date.now()}`,
      }),
    });

    if (!compileResponse.ok) {
      const errorText = await compileResponse.text();
      console.error('LaTeX compile error:', errorText);
      return NextResponse.json(
        { error: 'PDF compilation failed', details: errorText },
        { status: 500 }
      );
    }

    // Get PDF buffer
    const pdfBuffer = await compileResponse.arrayBuffer();

    // Return PDF as download
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="resume_${Date.now()}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}


