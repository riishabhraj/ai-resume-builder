import fs from 'fs';
import path from 'path';

const TEMPLATES_DIR = path.join(process.cwd(), 'lib', 'templates');

/**
 * Load a LaTeX template by ID
 * @param templateId - The template identifier (defaults to 'professional')
 * @returns The LaTeX template string
 */
export function loadTemplate(templateId: string = 'professional'): string {
  const templatePath = path.join(TEMPLATES_DIR, `${templateId}.tex`);
  
  if (!fs.existsSync(templatePath)) {
    console.warn(`Template ${templateId} not found, using default 'professional'`);
    // Fallback to professional if template doesn't exist
    const fallbackPath = path.join(TEMPLATES_DIR, 'professional.tex');
    if (fs.existsSync(fallbackPath)) {
      return fs.readFileSync(fallbackPath, 'utf-8');
    }
    // Ultimate fallback - return inline template
    return getDefaultTemplate();
  }
  
  return fs.readFileSync(templatePath, 'utf-8');
}

/**
 * Get list of available template IDs
 * @returns Array of template IDs
 */
export function listTemplates(): string[] {
  if (!fs.existsSync(TEMPLATES_DIR)) {
    return [];
  }
  
  const files = fs.readdirSync(TEMPLATES_DIR);
  return files
    .filter(f => f.endsWith('.tex'))
    .map(f => f.replace('.tex', ''));
}

/**
 * Default template (fallback)
 */
function getDefaultTemplate(): string {
  return `\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{lmodern}
\\usepackage[margin=0.75in]{geometry}
\\usepackage{enumitem}
\\usepackage{hyperref}

\\pagestyle{empty}
\\setlength{\\parindent}{0pt}
\\setlist[itemize]{leftmargin=*,nosep}

\\begin{document}

\\begin{center}
{\\Large \\textbf{{{NAME}}}}\\\\[0.5em]
{{CONTACT}}
\\end{center}

\\vspace{1em}

{{SUMMARY}}

\\vspace{1em}

{{EXPERIENCES}}

\\vspace{1em}

{{SKILLS}}

\\vspace{1em}

{{EDUCATION}}

\\end{document}`;
}

