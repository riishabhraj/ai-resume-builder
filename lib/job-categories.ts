// Job categories, fields, and experience levels for AI Resume Review

export interface ExperienceLevel {
  id: string;
  label: string;
  years: string;
}

export interface JobField {
  id: string;
  name: string;
  experienceLevels: ExperienceLevel[];
}

export interface JobCategory {
  id: string;
  name: string;
  icon: string;
  fields: JobField[];
}

const experienceLevels: ExperienceLevel[] = [
  { id: 'entry', label: 'Entry Level (0-2 years)', years: '0-2' },
  { id: 'mid', label: 'Mid Level (2-5 years)', years: '2-5' },
  { id: 'senior', label: 'Senior Level (5-10 years)', years: '5-10' },
  { id: 'lead', label: 'Lead/Principal (10+ years)', years: '10+' },
];

export const jobCategories: JobCategory[] = [
  {
    id: 'software-engineering',
    name: 'Software Engineering',
    icon: '💻',
    fields: [
      {
        id: 'backend-developer',
        name: 'Backend Developer',
        experienceLevels,
      },
      {
        id: 'frontend-developer',
        name: 'Frontend Developer',
        experienceLevels,
      },
      {
        id: 'fullstack-developer',
        name: 'Full Stack Developer',
        experienceLevels,
      },
      {
        id: 'mobile-developer',
        name: 'Mobile Developer',
        experienceLevels,
      },
      {
        id: 'devops-engineer',
        name: 'DevOps Engineer',
        experienceLevels,
      },
      {
        id: 'sre',
        name: 'Site Reliability Engineer (SRE)',
        experienceLevels,
      },
      {
        id: 'security-engineer',
        name: 'Security Engineer',
        experienceLevels,
      },
      {
        id: 'qa-engineer',
        name: 'QA/Test Engineer',
        experienceLevels,
      },
    ],
  },
  {
    id: 'data-science',
    name: 'Data Science & AI',
    icon: '📊',
    fields: [
      {
        id: 'data-scientist',
        name: 'Data Scientist',
        experienceLevels,
      },
      {
        id: 'ml-engineer',
        name: 'Machine Learning Engineer',
        experienceLevels,
      },
      {
        id: 'data-engineer',
        name: 'Data Engineer',
        experienceLevels,
      },
      {
        id: 'data-analyst',
        name: 'Data Analyst',
        experienceLevels,
      },
      {
        id: 'ai-researcher',
        name: 'AI Researcher',
        experienceLevels,
      },
    ],
  },
  {
    id: 'product-design',
    name: 'Product & Design',
    icon: '🎨',
    fields: [
      {
        id: 'product-manager',
        name: 'Product Manager',
        experienceLevels,
      },
      {
        id: 'ux-designer',
        name: 'UX Designer',
        experienceLevels,
      },
      {
        id: 'ui-designer',
        name: 'UI Designer',
        experienceLevels,
      },
      {
        id: 'product-designer',
        name: 'Product Designer',
        experienceLevels,
      },
    ],
  },
  {
    id: 'marketing-sales',
    name: 'Marketing & Sales',
    icon: '📈',
    fields: [
      {
        id: 'digital-marketer',
        name: 'Digital Marketing Manager',
        experienceLevels,
      },
      {
        id: 'content-marketer',
        name: 'Content Marketing Manager',
        experienceLevels,
      },
      {
        id: 'seo-specialist',
        name: 'SEO Specialist',
        experienceLevels,
      },
      {
        id: 'sales-exec',
        name: 'Sales Executive',
        experienceLevels,
      },
      {
        id: 'account-manager',
        name: 'Account Manager',
        experienceLevels,
      },
    ],
  },
  {
    id: 'business',
    name: 'Business & Finance',
    icon: '💼',
    fields: [
      {
        id: 'business-analyst',
        name: 'Business Analyst',
        experienceLevels,
      },
      {
        id: 'financial-analyst',
        name: 'Financial Analyst',
        experienceLevels,
      },
      {
        id: 'accountant',
        name: 'Accountant',
        experienceLevels,
      },
      {
        id: 'consultant',
        name: 'Consultant',
        experienceLevels,
      },
    ],
  },
];

// Helper functions
export function getCategoryById(categoryId: string): JobCategory | undefined {
  return jobCategories.find((cat) => cat.id === categoryId);
}

export function getFieldById(categoryId: string, fieldId: string): JobField | undefined {
  const category = getCategoryById(categoryId);
  return category?.fields.find((field) => field.id === fieldId);
}

export function getExperienceLevelById(levelId: string): ExperienceLevel | undefined {
  return experienceLevels.find((level) => level.id === levelId);
}

