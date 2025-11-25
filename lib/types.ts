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

export interface ResumeSection {
  title: string;
  items: Array<string | { heading: string; bullets: string[] }>;
}

export interface GeneratedResume {
  title: string;
  sections: ResumeSection[];
  plain_text_resume: string;
}
