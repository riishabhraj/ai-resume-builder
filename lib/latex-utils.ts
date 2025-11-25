import { loadTemplate } from './template-loader';
import { getDefaultTemplateId } from './templates/index';

export function escapeLatex(text: string): string {
  const replacements: Record<string, string> = {
    '\\': '\\textbackslash{}',
    '%': '\\%',
    '$': '\\$',
    '_': '\\_',
    '{': '\\{',
    '}': '\\}',
    '&': '\\&',
    '#': '\\#',
    '^': '\\^{}',
    '~': '\\~{}',
  };

  return text.replace(/[\\%$_{}&#^~]/g, (match) => replacements[match] || match);
}

/**
 * Get a LaTeX template by ID
 * @param templateId - The template identifier (defaults to 'modern')
 * @returns The LaTeX template string
 */
export function getLatexTemplate(templateId: string = getDefaultTemplateId()): string {
  return loadTemplate(templateId);
}

export function populateLatexTemplate(
  template: string,
  data: {
    name: string;
    contact: string;
    summary: string;
    experiences: string;
    skills: string;
    education: string;
  }
): string {
  let result = template;

  result = result.replace('{{NAME}}', escapeLatex(data.name));
  result = result.replace('{{CONTACT}}', data.contact); // Contact already has LaTeX formatting
  result = result.replace('{{SUMMARY}}', data.summary); // Summary already has LaTeX formatting
  result = result.replace('{{EXPERIENCES}}', data.experiences);
  result = result.replace('{{SKILLS}}', data.skills); // Skills already have LaTeX formatting
  result = result.replace('{{EDUCATION}}', data.education);

  return result;
}

export function formatExperiencesForLatex(experiences: Array<{ heading: string; bullets: string[] }>): string {
  let result = '\\textbf{\\Large PROFESSIONAL EXPERIENCE}\\\\[0.1em]\n';
  result += '\\rule{\\textwidth}{0.5pt}\\\\[0.4em]\n\n';

  experiences.forEach((exp) => {
    // Parse heading: "Role — Company (start - end)" or "Company — Role (Location, start - end)"
    // Try different separators: —, -, |
    let headingParts: string[] = [];
    let role = '';
    let company = '';
    let dates = '';
    let location = '';

    if (exp.heading.includes('—')) {
      headingParts = exp.heading.split('—');
    } else if (exp.heading.includes('|')) {
      headingParts = exp.heading.split('|');
    } else if (exp.heading.includes(' - ')) {
      headingParts = exp.heading.split(' - ');
    } else {
      // Fallback: use entire heading as company
      company = exp.heading;
    }

    if (headingParts.length >= 2) {
      // Assume format: "Role — Company (Location, start - end)" or "Company — Role (start - end)"
      const firstPart = headingParts[0].trim();
      const secondPart = headingParts[1].trim();
      
      // Try to extract dates/location from parentheses
      const dateMatch = secondPart.match(/\(([^)]+)\)/);
      if (dateMatch) {
        const dateLocationStr = dateMatch[1];
        dates = dateLocationStr;
        company = secondPart.replace(/\([^)]+\)/g, '').trim();
        role = firstPart;
      } else {
        // No dates in parentheses, assume second part is company
        company = secondPart;
        role = firstPart;
      }
    } else if (headingParts.length === 1) {
      // Single part - try to extract dates
      const dateMatch = headingParts[0].match(/\(([^)]+)\)/);
      if (dateMatch) {
        dates = dateMatch[1];
        company = headingParts[0].replace(/\([^)]+\)/g, '').trim();
      } else {
        company = headingParts[0];
      }
    }

    // Format: Company (bold, left) | Dates/Location (right)
    result += '\\noindent\\begin{tabular*}{\\textwidth}{@{\\extracolsep{\\fill}}lr}\n';
    result += `\\textbf{${escapeLatex(company || exp.heading)}} & ${escapeLatex(dates)}\\\\\n`;
    if (role) {
      result += `${escapeLatex(role)} & \\\\\n`;
    }
    result += '\\end{tabular*}\\\\[0.2em]\n';
    
    result += '\\begin{itemize}\n';
    exp.bullets.forEach((bullet) => {
      result += `\\item ${escapeLatex(bullet)}\n`;
    });
    result += '\\end{itemize}\n\\vspace{0.4em}\n\n';
  });

  return result;
}

/**
 * Format experiences directly from form data (alternative to AI-generated format)
 */
export function formatExperiencesFromFormData(experiences: Array<{ company: string; role: string; start: string; end: string; bullets: string[] }>): string {
  let result = '\\textbf{\\Large PROFESSIONAL EXPERIENCE}\\\\[0.1em]\n';
  result += '\\rule{\\textwidth}{0.5pt}\\\\[0.4em]\n\n';

  experiences.forEach((exp) => {
    const dates = `${escapeLatex(exp.start)} - ${escapeLatex(exp.end)}`;
    
    // Format: Company (bold, left) | Dates (right)
    result += '\\noindent\\begin{tabular*}{\\textwidth}{@{\\extracolsep{\\fill}}lr}\n';
    result += `\\textbf{${escapeLatex(exp.company.toUpperCase())}} & ${dates}\\\\\n`;
    result += `${escapeLatex(exp.role)} & \\\\\n`;
    result += '\\end{tabular*}\\\\[0.2em]\n';
    
    result += '\\begin{itemize}\n';
    exp.bullets.forEach((bullet) => {
      result += `\\item ${escapeLatex(bullet)}\n`;
    });
    result += '\\end{itemize}\n\\vspace{0.4em}\n\n';
  });

  return result;
}
