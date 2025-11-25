// ATS Knowledge Base - Curated best practices and requirements

export interface KnowledgeDocument {
  id: string;
  type: 'ats_rule' | 'industry_keywords' | 'best_practice' | 'example' | 'action_verb';
  content: string;
  metadata: {
    industry?: string;
    role?: string;
    importance?: 'critical' | 'high' | 'medium' | 'low';
    source?: string;
    category?: string;
  };
}

export const atsKnowledgeBase: KnowledgeDocument[] = [
  // ATS System Requirements
  {
    id: 'ats-001',
    type: 'ats_rule',
    content: 'ATS systems prioritize exact keyword matches from job descriptions. Include industry-standard terminology and technical skills exactly as they appear in job postings. Avoid creative variations or synonyms.',
    metadata: {
      importance: 'critical',
      source: 'Workday, Greenhouse, Lever documentation',
      category: 'keywords',
    },
  },
  {
    id: 'ats-002',
    type: 'ats_rule',
    content: 'Quantifiable achievements significantly boost ATS scores. Every bullet point should include at least one metric: percentages (%), dollar amounts ($), numbers (#), time saved, or scale (users/requests). Example: "Reduced load time by 40%" instead of "Improved performance".',
    metadata: {
      importance: 'critical',
      source: 'ATS scoring algorithms',
      category: 'metrics',
    },
  },
  {
    id: 'ats-003',
    type: 'ats_rule',
    content: 'Use strong action verbs at the start of each bullet point. Vary your verbs - avoid repeating the same verb. High-impact verbs: Architected, Engineered, Optimized, Delivered, Reduced, Increased, Launched, Scaled, Automated, Streamlined.',
    metadata: {
      importance: 'high',
      source: 'Recruiter best practices',
      category: 'action_verbs',
    },
  },
  {
    id: 'ats-004',
    type: 'ats_rule',
    content: 'ATS systems scan for standard section headers. Use these exact headings: PROFESSIONAL EXPERIENCE, EDUCATION, SKILLS, PROJECTS, CERTIFICATIONS. Avoid creative headers like "My Journey" or "What I Know".',
    metadata: {
      importance: 'high',
      source: 'ATS parsing requirements',
      category: 'format',
    },
  },
  {
    id: 'ats-005',
    type: 'ats_rule',
    content: 'Resume length matters: 1 page for 0-5 years experience, 1-2 pages for 5-15 years, up to 2 pages for 15+ years. ATS systems may truncate longer resumes.',
    metadata: {
      importance: 'medium',
      source: 'Industry standards',
      category: 'length',
    },
  },

  // Software Engineering Keywords
  {
    id: 'tech-001',
    type: 'industry_keywords',
    content: 'Critical technical keywords for Software Engineering roles: microservices, REST API, GraphQL, CI/CD, Docker, Kubernetes, AWS, Azure, GCP, agile, scrum, test-driven development (TDD), system design, scalability, distributed systems, database optimization, cloud architecture.',
    metadata: {
      industry: 'tech',
      role: 'software_engineer',
      importance: 'critical',
      category: 'technical_skills',
    },
  },
  {
    id: 'tech-002',
    type: 'industry_keywords',
    content: 'Frontend Engineering must-haves: React, TypeScript, Next.js, Vue, Angular, responsive design, accessibility (a11y), performance optimization, webpack, state management (Redux, Zustand), CSS-in-JS, mobile-first design.',
    metadata: {
      industry: 'tech',
      role: 'frontend_engineer',
      importance: 'critical',
      category: 'technical_skills',
    },
  },
  {
    id: 'tech-003',
    type: 'industry_keywords',
    content: 'Backend Engineering essentials: Node.js, Python, Java, Go, PostgreSQL, MongoDB, Redis, message queues, event-driven architecture, API design, database indexing, caching strategies, load balancing, authentication/authorization.',
    metadata: {
      industry: 'tech',
      role: 'backend_engineer',
      importance: 'critical',
      category: 'technical_skills',
    },
  },
  {
    id: 'tech-004',
    type: 'industry_keywords',
    content: 'DevOps/SRE keywords: Kubernetes, Docker, Terraform, Jenkins, GitHub Actions, monitoring (Datadog, Prometheus, Grafana), incident management, on-call rotation, SLA/SLO, infrastructure as code (IaC), observability.',
    metadata: {
      industry: 'tech',
      role: 'devops',
      importance: 'critical',
      category: 'technical_skills',
    },
  },

  // Data Science & ML
  {
    id: 'ds-001',
    type: 'industry_keywords',
    content: 'Data Science must-haves: Python, R, SQL, machine learning, deep learning, TensorFlow, PyTorch, scikit-learn, pandas, NumPy, data visualization, A/B testing, statistical analysis, predictive modeling, feature engineering, model deployment.',
    metadata: {
      industry: 'tech',
      role: 'data_scientist',
      importance: 'critical',
      category: 'technical_skills',
    },
  },

  // Product Management
  {
    id: 'pm-001',
    type: 'industry_keywords',
    content: 'Product Management keywords: product roadmap, user stories, stakeholder management, A/B testing, product-market fit, OKRs, KPIs, customer research, data-driven decisions, cross-functional leadership, agile methodologies, go-to-market strategy.',
    metadata: {
      industry: 'tech',
      role: 'product_manager',
      importance: 'critical',
      category: 'skills',
    },
  },

  // Best Practices & Examples
  {
    id: 'bp-001',
    type: 'best_practice',
    content: 'STAR format for bullet points: Situation + Task + Action + Result. Example: "Architected microservices platform (Action) handling 50M+ daily requests (Task), reducing latency by 40% (Result) and saving $200K annually in infrastructure costs (Result)."',
    metadata: {
      importance: 'high',
      category: 'writing',
    },
  },
  {
    id: 'bp-002',
    type: 'best_practice',
    content: 'Show business impact, not just technical tasks. Instead of "Built a new API," write "Delivered RESTful API serving 10M+ requests/day, enabling 3 new product features and increasing user engagement by 25%."',
    metadata: {
      importance: 'high',
      category: 'writing',
    },
  },
  {
    id: 'bp-003',
    type: 'best_practice',
    content: 'Skills section should be categorized and comprehensive. Example format: "Languages: Python, JavaScript, TypeScript, Go | Frameworks: React, Next.js, Django | Cloud: AWS (EC2, S3, Lambda), GCP | Databases: PostgreSQL, MongoDB, Redis"',
    metadata: {
      importance: 'medium',
      category: 'skills',
    },
  },
  {
    id: 'bp-004',
    type: 'best_practice',
    content: 'Education should include: Institution name, degree, major/field, graduation date (or expected), GPA (if 3.5+), relevant coursework (for recent grads), and honors/awards.',
    metadata: {
      importance: 'medium',
      category: 'education',
    },
  },

  // High-Performance Examples
  {
    id: 'ex-001',
    type: 'example',
    content: 'High-scoring experience bullet: "Architected and deployed microservices platform using Kubernetes and Docker, handling 50M+ daily requests across 15 services, reducing API latency by 40% and cutting infrastructure costs by $200K annually."',
    metadata: {
      industry: 'tech',
      role: 'software_engineer',
      importance: 'high',
      category: 'experience_example',
    },
  },
  {
    id: 'ex-002',
    type: 'example',
    content: 'High-scoring experience bullet: "Led cross-functional team of 8 engineers to deliver customer analytics platform, processing 2TB of data daily, which increased user retention by 35% and generated $1.5M in additional revenue."',
    metadata: {
      industry: 'tech',
      role: 'engineering_lead',
      importance: 'high',
      category: 'experience_example',
    },
  },
  {
    id: 'ex-003',
    type: 'example',
    content: 'High-scoring experience bullet: "Optimized database queries and implemented caching layer using Redis, reducing query response time by 70% and improving application throughput from 1K to 10K requests/second."',
    metadata: {
      industry: 'tech',
      role: 'backend_engineer',
      importance: 'high',
      category: 'experience_example',
    },
  },

  // Action Verbs Library
  {
    id: 'verb-001',
    type: 'action_verb',
    content: 'Leadership action verbs: Spearheaded, Led, Directed, Managed, Orchestrated, Championed, Mentored, Coached, Supervised, Coordinated, Facilitated, Guided, Drove.',
    metadata: {
      importance: 'high',
      category: 'action_verbs',
    },
  },
  {
    id: 'verb-002',
    type: 'action_verb',
    content: 'Technical action verbs: Architected, Engineered, Developed, Built, Implemented, Designed, Programmed, Integrated, Deployed, Configured, Automated, Optimized, Refactored, Debugged.',
    metadata: {
      importance: 'high',
      category: 'action_verbs',
    },
  },
  {
    id: 'verb-003',
    type: 'action_verb',
    content: 'Impact action verbs: Achieved, Delivered, Increased, Reduced, Improved, Enhanced, Accelerated, Streamlined, Transformed, Exceeded, Surpassed, Generated, Saved, Boosted.',
    metadata: {
      importance: 'high',
      category: 'action_verbs',
    },
  },
  {
    id: 'verb-004',
    type: 'action_verb',
    content: 'Innovation action verbs: Pioneered, Innovated, Launched, Established, Created, Initiated, Introduced, Founded, Developed, Invented, Conceptualized, Prototyped.',
    metadata: {
      importance: 'high',
      category: 'action_verbs',
    },
  },
];

// Export helper functions
export function getKnowledgeByCategory(category: string): KnowledgeDocument[] {
  return atsKnowledgeBase.filter((doc) => doc.metadata.category === category);
}

export function getKnowledgeByIndustry(industry: string): KnowledgeDocument[] {
  return atsKnowledgeBase.filter((doc) => doc.metadata.industry === industry);
}

export function getKnowledgeByRole(role: string): KnowledgeDocument[] {
  return atsKnowledgeBase.filter((doc) => doc.metadata.role === role);
}

export function getCriticalKnowledge(): KnowledgeDocument[] {
  return atsKnowledgeBase.filter((doc) => doc.metadata.importance === 'critical');
}

