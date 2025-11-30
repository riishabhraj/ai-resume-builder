export interface Profile {
  id: string;
  full_name: string | null;
  created_at: string;
}

export interface JobTarget {
  id: string;
  user_id: string;
  title: string | null;
  company: string | null;
  job_description: string | null;
  created_at: string;
}

export interface ResumeVersion {
  id: string;
  user_id: string;
  title: string;
  plain_text: string | null;
  latex_source: string | null;
  pdf_url: string | null;
  ats_score: number | null;
  status: 'draft' | 'compiled';
  template_id?: string | null;
  sections_data?: StructuredResumeSection[] | null; // Structured resume sections
  created_at: string;
  updated_at: string;
}

export interface ExperienceItem {
  company: string;
  role: string;
  start: string;
  end: string;
  bullets: string[];
}

export interface ResumeFormData {
  fullName: string;
  title: string;
  email: string;
  location: string;
  summary: string;
  skills: string;
  experiences: ExperienceItem[];
  education: string;
  jobDescription?: string;
  templateId?: string;
}

// Legacy ResumeSection interface (for backward compatibility)
export interface ResumeSection {
  title: string;
  items: Array<string | { heading: string; bullets: string[] }>;
}

// Section type definition
export type SectionType = 
  | 'personal-info'
  | 'professional-summary'
  | 'career-objective'
  | 'education'
  | 'experience'
  | 'leadership'
  | 'projects'
  | 'research'
  | 'certifications'
  | 'awards'
  | 'publications'
  | 'skills';

// Structured ResumeSection interface (used in resume builder and stored in sections_data)
export interface StructuredResumeSection {
  id: string;
  type: SectionType;
  title: string;
  content: any; // Content structure varies by type:
  // - personal-info: { fullName, title, email, phone, location, linkedin, github, website }
  // - professional-summary/career-objective: { text }
  // - experience/leadership: [{ id, company, role, location, startDate, endDate, bullets: [{ id, text }] }]
  // - education: [{ id, institution, degree, field, startDate, endDate, gpa?, location? }]
  // - skills: { categories: [{ id, name, keywords: string[] }] }
  // - projects: [{ id, name, description, technologies, link? }]
  // - certifications/awards: [{ id, title, issuer, date, description? }]
  // - publications/research: [{ id, title, authors, venue, year, link? }]
}

// Resume Analysis interface
export interface ResumeAnalysis {
  id: string;
  user_id: string;
  resume_id: string | null;
  analysis_type: 'ats' | 'tailor' | 'optimize' | 'review' | string;
  job_description: string | null;
  ats_score: number | null;
  feedback: any | null; // JSONB structure for AI feedback
  created_at: string;
}

export interface GeneratedResume {
  title: string;
  sections: ResumeSection[];
  plain_text_resume: string;
}
