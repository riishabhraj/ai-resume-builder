import { NextRequest, NextResponse } from 'next/server';
import { getLatexTemplate, populateLatexTemplate, escapeLatex } from '@/lib/latex-utils';
import type { ResumeSection } from '@/lib/types';

const LATEX_COMPILE_URL = process.env.LATEX_COMPILE_URL || 'http://localhost:3001/compile';

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
  graduationDate: string;
  additionalInfo?: string;
}

interface ProjectEntry {
  id: string;
  name: string;
  technologies: string;
  link?: string;
  bulletPoints: { id: string; text: string }[];
}

interface SkillCategory {
  id: string;
  name: string;
  keywords: string[];
}

interface CertificationEntry {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

interface AwardEntry {
  id: string;
  name: string;
  issuer: string;
  date: string;
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

  sections.forEach((section) => {
    switch (section.type) {
      case 'personal-info': {
        const info = section.content as PersonalInfo;
        name = info.fullName || 'YOUR NAME';
        
        // Build contact line
        if (info.location) contactParts.push(escapeLatex(info.location));
        if (info.phone) contactParts.push(escapeLatex(info.phone));
        if (info.email) contactParts.push(escapeLatex(info.email));
        if (info.linkedin) contactParts.push(escapeLatex(info.linkedin));
        if (info.website) contactParts.push(escapeLatex(info.website));
        break;
      }

      case 'summary': {
        const summaryText = section.content as string;
        if (summaryText) {
          summary = `\\textbf{\\Large PROFESSIONAL SUMMARY}\\\\[0.03em]
\\rule{\\textwidth}{0.5pt}\\\\[0.15em]
${escapeLatex(summaryText)}\\\\[0.2em]`; // Text content is escaped
        }
        break;
      }

      case 'experience': {
        const experienceData = section.content as ExperienceEntry[];
        if (experienceData && experienceData.length > 0) {
          experiences = `\\textbf{\\Large PROFESSIONAL EXPERIENCE}\\\\[0.03em]
\\rule{\\textwidth}{0.5pt}\\\\[0.15em]

`;
          experienceData.forEach((exp, idx) => {
            experiences += `\\textbf{${escapeLatex(exp.company)}} \\hfill \\textbf{${escapeLatex(exp.location)}}\\\\
\\textit{${escapeLatex(exp.role)}} \\hfill \\textbf{${escapeLatex(exp.startDate)} -- ${escapeLatex(exp.endDate)}}\\\\`;
            
            if (exp.additionalRole) {
              experiences += `\n\\textit{${escapeLatex(exp.additionalRole)}}\\\\`;
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
              experiences += '\n\\vspace{0.15em}\n\n';
            }
          });
        }
        break;
      }

      case 'leadership': {
        const leadershipData = section.content as ExperienceEntry[];
        if (leadershipData && leadershipData.length > 0) {
          if (experiences) {
            experiences += '\n\\vspace{0.3em}\n\n';
          }
          experiences += `\\textbf{\\Large LEADERSHIP EXPERIENCE}\\\\[0.03em]
\\rule{\\textwidth}{0.5pt}\\\\[0.15em]

`;
          leadershipData.forEach((exp, idx) => {
            experiences += `\\textbf{${escapeLatex(exp.company)}} \\hfill \\textbf{${escapeLatex(exp.location)}}\\\\
\\textit{${escapeLatex(exp.role)}} \\hfill \\textbf{${escapeLatex(exp.startDate)} -- ${escapeLatex(exp.endDate)}}\\\\`;
            
            if (exp.additionalRole) {
              experiences += `\n\\textit{${escapeLatex(exp.additionalRole)}}\\\\`;
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
              experiences += '\n\\vspace{0.15em}\n\n';
            }
          });
        }
        break;
      }

      case 'education': {
        const educationData = section.content as EducationEntry[];
        if (educationData && educationData.length > 0) {
          education = `\\textbf{\\Large EDUCATION}\\\\[0.03em]
\\rule{\\textwidth}{0.5pt}\\\\[0.15em]

`;
          educationData.forEach((edu, idx) => {
            education += `\\textbf{${escapeLatex(edu.institution)}} \\hfill \\textbf{${escapeLatex(edu.location)}}\\\\
\\textit{${escapeLatex(edu.degree)}} \\hfill \\textbf{${escapeLatex(edu.graduationDate)}}\\\\`;
            
            if (edu.additionalInfo) {
              education += `\n${escapeLatex(edu.additionalInfo)}\\\\`;
            }
            
            if (idx < educationData.length - 1) {
              education += '\n\\vspace{0.15em}\n\n';
            }
          });
        }
        break;
      }

      case 'projects': {
        const projectsData = section.content as ProjectEntry[];
        if (projectsData && projectsData.length > 0) {
          if (experiences) {
            experiences += '\n\\vspace{0.3em}\n\n';
          }
          experiences += `\\textbf{\\Large PROJECTS}\\\\[0.03em]
\\rule{\\textwidth}{0.5pt}\\\\[0.15em]

`;
          projectsData.forEach((proj, idx) => {
            let projectHeader = `\\textbf{${escapeLatex(proj.name)}}`;
            if (proj.link) {
              projectHeader += ` \\hfill ${escapeLatex(proj.link)}`;
            }
            experiences += `${projectHeader}\\\\
\\textit{${escapeLatex(proj.technologies)}}\\\\`;
            
            if (proj.bulletPoints && proj.bulletPoints.length > 0) {
              experiences += '\n\\begin{itemize}\n';
              proj.bulletPoints.forEach((bullet) => {
                if (bullet.text.trim()) {
                  experiences += `  \\item ${escapeLatex(bullet.text)}\n`;
                }
              });
              experiences += '\\end{itemize}';
            }
            
            if (idx < projectsData.length - 1) {
              experiences += '\n\\vspace{0.15em}\n\n';
            }
          });
        }
        break;
      }

      case 'skills': {
        const skillsData = section.content as SkillCategory[];
        if (skillsData && skillsData.length > 0) {
          skills = `\\textbf{\\Large SKILLS}\\\\[0.03em]
\\rule{\\textwidth}{0.5pt}\\\\[0.15em]

`;
          skillsData.forEach((category) => {
            if (category.keywords && category.keywords.length > 0) {
              skills += `\\textbf{${escapeLatex(category.name)}:} ${category.keywords.map(k => escapeLatex(k)).join(', ')}\\\\[0.1em]\n`;
            }
          });
        }
        break;
      }

      case 'certifications': {
        const certData = section.content as CertificationEntry[];
        if (certData && certData.length > 0) {
          if (education) {
            education += '\n\\vspace{0.3em}\n\n';
          }
          education += `\\textbf{\\Large CERTIFICATIONS}\\\\[0.03em]
\\rule{\\textwidth}{0.5pt}\\\\[0.15em]

`;
          certData.forEach((cert) => {
            education += `\\textbf{${escapeLatex(cert.name)}} -- ${escapeLatex(cert.issuer)} \\hfill \\textbf{${escapeLatex(cert.date)}}\\\\[0.1em]\n`;
          });
        }
        break;
      }

      case 'awards': {
        const awardData = section.content as AwardEntry[];
        if (awardData && awardData.length > 0) {
          if (education) {
            education += '\n\\vspace{0.3em}\n\n';
          }
          education += `\\textbf{\\Large AWARDS}\\\\[0.03em]
\\rule{\\textwidth}{0.5pt}\\\\[0.15em]

`;
          awardData.forEach((award) => {
            education += `\\textbf{${escapeLatex(award.name)}} -- ${escapeLatex(award.issuer)} \\hfill \\textbf{${escapeLatex(award.date)}}\\\\[0.1em]\n`;
          });
        }
        break;
      }
    }
  });

  return {
    name,
    contact: contactParts.join(' \\textbullet\\ '),
    summary,
    experiences,
    skills,
    education,
  };
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


