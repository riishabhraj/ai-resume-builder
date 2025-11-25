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

  // ============ MORE TECH ROLES ============

  // Mobile Development
  {
    id: 'tech-mobile-001',
    type: 'industry_keywords',
    content: 'Mobile Development keywords: Swift, Kotlin, React Native, Flutter, iOS, Android, App Store optimization, TestFlight, Firebase, push notifications, offline-first architecture, mobile CI/CD, UI/UX design patterns, Core Data, Room database.',
    metadata: {
      industry: 'tech',
      role: 'mobile_developer',
      importance: 'critical',
      category: 'technical_skills',
    },
  },

  // Security Engineering
  {
    id: 'tech-security-001',
    type: 'industry_keywords',
    content: 'Cybersecurity keywords: penetration testing, vulnerability assessment, OWASP, encryption, OAuth, JWT, zero-trust architecture, SIEM, SOC, incident response, threat modeling, compliance (SOC2, GDPR, HIPAA), security audits, intrusion detection.',
    metadata: {
      industry: 'tech',
      role: 'security_engineer',
      importance: 'critical',
      category: 'technical_skills',
    },
  },

  // QA Engineering
  {
    id: 'tech-qa-001',
    type: 'industry_keywords',
    content: 'QA/Testing keywords: automated testing, Selenium, Cypress, Jest, unit testing, integration testing, end-to-end testing, test coverage, CI/CD pipelines, performance testing, load testing, regression testing, bug tracking, quality assurance.',
    metadata: {
      industry: 'tech',
      role: 'qa_engineer',
      importance: 'critical',
      category: 'technical_skills',
    },
  },

  // Cloud Architecture
  {
    id: 'tech-cloud-001',
    type: 'industry_keywords',
    content: 'Cloud Architecture keywords: AWS (EC2, S3, Lambda, ECS, RDS), Azure, GCP, cloud migration, serverless, cost optimization, multi-cloud, hybrid cloud, cloud security, auto-scaling, load balancers, CDN, cloud-native.',
    metadata: {
      industry: 'tech',
      role: 'cloud_architect',
      importance: 'critical',
      category: 'technical_skills',
    },
  },

  // Machine Learning Engineering
  {
    id: 'tech-mle-001',
    type: 'industry_keywords',
    content: 'ML Engineering keywords: model deployment, MLOps, model monitoring, feature stores, model versioning, A/B testing, model performance, data pipelines, training pipelines, model serving, Docker, Kubernetes, TensorFlow Serving, PyTorch.',
    metadata: {
      industry: 'tech',
      role: 'ml_engineer',
      importance: 'critical',
      category: 'technical_skills',
    },
  },

  // UI/UX Design
  {
    id: 'tech-design-001',
    type: 'industry_keywords',
    content: 'UI/UX Design keywords: Figma, Sketch, Adobe XD, user research, wireframing, prototyping, design systems, accessibility, usability testing, information architecture, responsive design, design thinking, user personas, journey mapping.',
    metadata: {
      industry: 'tech',
      role: 'uiux_designer',
      importance: 'critical',
      category: 'technical_skills',
    },
  },

  // Full Stack Development
  {
    id: 'tech-fullstack-001',
    type: 'industry_keywords',
    content: 'Full Stack keywords: MERN stack (MongoDB, Express, React, Node.js), MEAN stack, Next.js, TypeScript, REST APIs, GraphQL, database design, authentication, deployment, version control (Git), agile development.',
    metadata: {
      industry: 'tech',
      role: 'fullstack_developer',
      importance: 'critical',
      category: 'technical_skills',
    },
  },

  // ============ COMMON MISTAKES ============

  {
    id: 'mistake-001',
    type: 'ats_rule',
    content: 'AVOID: Starting bullets with "Responsible for..." This is passive and weak. INSTEAD: Use strong action verbs. Replace "Responsible for maintaining backend systems" with "Maintained and optimized backend systems, reducing downtime by 30%."',
    metadata: {
      importance: 'high',
      category: 'common_mistakes',
    },
  },
  {
    id: 'mistake-002',
    type: 'ats_rule',
    content: 'AVOID: Vague accomplishments like "Worked on various projects" or "Helped the team." INSTEAD: Be specific with metrics. "Contributed to 5 microservices handling 100K+ daily users, improving response time by 25%."',
    metadata: {
      importance: 'high',
      category: 'common_mistakes',
    },
  },
  {
    id: 'mistake-003',
    type: 'ats_rule',
    content: 'AVOID: Overused buzzwords without context: "team player," "hard worker," "innovative." INSTEAD: Show these qualities through achievements. "Collaborated with 3 cross-functional teams to launch feature used by 1M+ users."',
    metadata: {
      importance: 'high',
      category: 'common_mistakes',
    },
  },
  {
    id: 'mistake-004',
    type: 'ats_rule',
    content: 'AVOID: Listing job duties instead of achievements. "Daily standup meetings" or "Code reviews." INSTEAD: Show impact of these activities. "Led agile ceremonies for 10-person team, improving sprint velocity by 30%."',
    metadata: {
      importance: 'high',
      category: 'common_mistakes',
    },
  },
  {
    id: 'mistake-005',
    type: 'ats_rule',
    content: 'AVOID: Generic statements without metrics. "Improved system performance." INSTEAD: Quantify everything. "Optimized database queries reducing response time from 2s to 200ms (90% improvement) for 50K+ daily users."',
    metadata: {
      importance: 'critical',
      category: 'common_mistakes',
    },
  },

  // ============ EXPERIENCE LEVEL EXAMPLES ============

  // Entry Level (0-2 years)
  {
    id: 'ex-entry-001',
    type: 'example',
    content: 'Entry-level (0-2 yrs) bullet: "Built responsive web application using React and Node.js serving 500+ university students, implementing JWT authentication and real-time chat features with Socket.io."',
    metadata: {
      industry: 'tech',
      role: 'software_engineer',
      importance: 'high',
      category: 'experience_example_entry',
    },
  },
  {
    id: 'ex-entry-002',
    type: 'example',
    content: 'Entry-level (0-2 yrs) bullet: "Developed automated testing suite using Jest and Cypress, achieving 85% code coverage and reducing bug reports by 40% in production."',
    metadata: {
      industry: 'tech',
      role: 'software_engineer',
      importance: 'high',
      category: 'experience_example_entry',
    },
  },
  {
    id: 'ex-entry-003',
    type: 'example',
    content: 'Entry-level (0-2 yrs) bullet: "Created REST API using Express.js and PostgreSQL handling 10K+ daily requests, implementing rate limiting and caching for improved performance."',
    metadata: {
      industry: 'tech',
      role: 'backend_engineer',
      importance: 'high',
      category: 'experience_example_entry',
    },
  },

  // Mid Level (3-7 years)
  {
    id: 'ex-mid-001',
    type: 'example',
    content: 'Mid-level (3-7 yrs) bullet: "Architected microservices migration from monolithic application, reducing deployment time by 60% and enabling 5 teams to deploy independently, serving 2M+ active users."',
    metadata: {
      industry: 'tech',
      role: 'software_engineer',
      importance: 'high',
      category: 'experience_example_mid',
    },
  },
  {
    id: 'ex-mid-002',
    type: 'example',
    content: 'Mid-level (3-7 yrs) bullet: "Led development of customer-facing dashboard using React and TypeScript, improving user engagement by 45% and reducing support tickets by 30%, impacting 100K+ monthly users."',
    metadata: {
      industry: 'tech',
      role: 'frontend_engineer',
      importance: 'high',
      category: 'experience_example_mid',
    },
  },
  {
    id: 'ex-mid-003',
    type: 'example',
    content: 'Mid-level (3-7 yrs) bullet: "Designed and implemented event-driven architecture using Kafka and Redis, processing 500K+ events per minute with 99.9% uptime, enabling real-time analytics for business teams."',
    metadata: {
      industry: 'tech',
      role: 'backend_engineer',
      importance: 'high',
      category: 'experience_example_mid',
    },
  },

  // Senior Level (8+ years)
  {
    id: 'ex-senior-001',
    type: 'example',
    content: 'Senior-level (8+ yrs) bullet: "Directed technical architecture for multi-tenant SaaS platform serving 500+ enterprise clients, leading team of 15 engineers and generating $10M ARR through scalable infrastructure design."',
    metadata: {
      industry: 'tech',
      role: 'senior_engineer',
      importance: 'high',
      category: 'experience_example_senior',
    },
  },
  {
    id: 'ex-senior-002',
    type: 'example',
    content: 'Senior-level (8+ yrs) bullet: "Established engineering standards and mentored 20+ engineers across 4 teams, improving code quality metrics by 50% and reducing production incidents by 70%, while delivering 3 major product launches."',
    metadata: {
      industry: 'tech',
      role: 'senior_engineer',
      importance: 'high',
      category: 'experience_example_senior',
    },
  },
  {
    id: 'ex-senior-003',
    type: 'example',
    content: 'Senior-level (8+ yrs) bullet: "Drove cloud migration strategy from on-premise to AWS, reducing infrastructure costs by $2M annually while improving system reliability from 99.5% to 99.99%, managing $5M budget."',
    metadata: {
      industry: 'tech',
      role: 'senior_engineer',
      importance: 'high',
      category: 'experience_example_senior',
    },
  },

  // ============ ADVANCED TECHNIQUES ============

  {
    id: 'bp-advanced-001',
    type: 'best_practice',
    content: 'Show progression and growth. For multiple roles at same company, demonstrate increasing responsibility. Entry: "Developed features" → Mid: "Led feature development" → Senior: "Architected platform strategy."',
    metadata: {
      importance: 'high',
      category: 'advanced_techniques',
    },
  },
  {
    id: 'bp-advanced-002',
    type: 'best_practice',
    content: 'Quantify team impact and collaboration. Instead of "worked with team," use "Led cross-functional team of 8 (3 engineers, 2 designers, 3 PMs) to deliver X, resulting in Y metric improvement."',
    metadata: {
      importance: 'high',
      category: 'advanced_techniques',
    },
  },
  {
    id: 'bp-advanced-003',
    type: 'best_practice',
    content: 'Link technical work to business outcomes. "Built caching layer (technical) → reduced API latency by 60% (technical result) → improved conversion rate by 15% (business impact) → generated $500K additional revenue (business value)."',
    metadata: {
      importance: 'critical',
      category: 'advanced_techniques',
    },
  },
  {
    id: 'bp-advanced-004',
    type: 'best_practice',
    content: 'For remote work achievements, emphasize async communication and distributed collaboration. "Coordinated with distributed team across 5 time zones using async workflows, delivering project 3 weeks ahead of schedule."',
    metadata: {
      importance: 'medium',
      category: 'advanced_techniques',
    },
  },
  {
    id: 'bp-advanced-005',
    type: 'best_practice',
    content: 'Open source contributions show initiative. "Contributed to React ecosystem with 50+ merged PRs, maintained library with 10K+ downloads/month, and mentored 15+ open source contributors."',
    metadata: {
      importance: 'medium',
      category: 'advanced_techniques',
    },
  },

  // ============ STACK-SPECIFIC KEYWORDS ============

  {
    id: 'stack-mern-001',
    type: 'industry_keywords',
    content: 'MERN Stack specific: MongoDB (aggregation, indexing, sharding), Express.js (middleware, routing, error handling), React (hooks, context, performance), Node.js (event loop, streams, clustering), JWT, bcrypt, Mongoose.',
    metadata: {
      industry: 'tech',
      role: 'fullstack_developer',
      importance: 'high',
      category: 'stack_specific',
    },
  },
  {
    id: 'stack-python-001',
    type: 'industry_keywords',
    content: 'Python/Django ecosystem: Django (ORM, middleware, signals), Flask, FastAPI, Celery, SQLAlchemy, pytest, asyncio, type hints, virtual environments, pip, poetry, Django Rest Framework.',
    metadata: {
      industry: 'tech',
      role: 'backend_engineer',
      importance: 'high',
      category: 'stack_specific',
    },
  },
  {
    id: 'stack-java-001',
    type: 'industry_keywords',
    content: 'Java/Spring ecosystem: Spring Boot, Spring MVC, Spring Security, Hibernate, JPA, Maven, Gradle, JUnit, Mockito, microservices, dependency injection, aspect-oriented programming.',
    metadata: {
      industry: 'tech',
      role: 'backend_engineer',
      importance: 'high',
      category: 'stack_specific',
    },
  },
  {
    id: 'stack-dotnet-001',
    type: 'industry_keywords',
    content: '.NET ecosystem: ASP.NET Core, Entity Framework, C#, LINQ, Blazor, SignalR, Azure integration, dependency injection, middleware, Web API, MVC pattern, xUnit.',
    metadata: {
      industry: 'tech',
      role: 'backend_engineer',
      importance: 'high',
      category: 'stack_specific',
    },
  },
  {
    id: 'stack-mobile-001',
    type: 'industry_keywords',
    content: 'iOS ecosystem: Swift, SwiftUI, UIKit, Combine, Core Data, URLSession, Xcode, TestFlight, App Store Connect, CocoaPods, Swift Package Manager, Core Animation, push notifications.',
    metadata: {
      industry: 'tech',
      role: 'mobile_developer',
      importance: 'high',
      category: 'stack_specific',
    },
  },
  {
    id: 'stack-mobile-002',
    type: 'industry_keywords',
    content: 'Android ecosystem: Kotlin, Jetpack Compose, Room, Retrofit, Coroutines, ViewModel, LiveData, Gradle, Android Studio, Play Store Console, Material Design, WorkManager.',
    metadata: {
      industry: 'tech',
      role: 'mobile_developer',
      importance: 'high',
      category: 'stack_specific',
    },
  },

  // ============ NON-TECH INDUSTRIES ============

  // Marketing
  {
    id: 'marketing-001',
    type: 'industry_keywords',
    content: 'Digital Marketing keywords: SEO, SEM, Google Analytics, Google Ads, social media marketing, content marketing, email campaigns, conversion rate optimization (CRO), marketing automation, HubSpot, Salesforce, A/B testing, ROI tracking.',
    metadata: {
      industry: 'marketing',
      role: 'digital_marketer',
      importance: 'critical',
      category: 'skills',
    },
  },

  // Data Analytics
  {
    id: 'analytics-001',
    type: 'industry_keywords',
    content: 'Data Analytics keywords: SQL, Python, R, Tableau, Power BI, data visualization, statistical analysis, Excel, data modeling, ETL, business intelligence, dashboards, KPI tracking, predictive analytics.',
    metadata: {
      industry: 'data',
      role: 'data_analyst',
      importance: 'critical',
      category: 'technical_skills',
    },
  },

  // Sales
  {
    id: 'sales-001',
    type: 'industry_keywords',
    content: 'Sales keywords: B2B sales, B2C sales, CRM (Salesforce, HubSpot), pipeline management, cold calling, lead generation, quota attainment, negotiation, relationship building, sales forecasting, enterprise sales, SaaS sales.',
    metadata: {
      industry: 'sales',
      role: 'sales',
      importance: 'critical',
      category: 'skills',
    },
  },

  // Project Management
  {
    id: 'pm-general-001',
    type: 'industry_keywords',
    content: 'Project Management keywords: agile, scrum, Kanban, Jira, Asana, stakeholder management, risk management, budget management, timeline management, resource allocation, sprint planning, retrospectives, PMP, CSM.',
    metadata: {
      industry: 'management',
      role: 'project_manager',
      importance: 'critical',
      category: 'skills',
    },
  },

  // ============ MORE ROLE EXAMPLES ============

  // Mobile Development Examples
  {
    id: 'ex-mobile-001',
    type: 'example',
    content: 'Mobile Development bullet: "Developed iOS app using Swift and SwiftUI with 50K+ downloads and 4.8-star rating, implementing offline-first architecture and reducing crashes by 85% through comprehensive testing."',
    metadata: {
      industry: 'tech',
      role: 'mobile_developer',
      importance: 'high',
      category: 'experience_example',
    },
  },
  {
    id: 'ex-mobile-002',
    type: 'example',
    content: 'Mobile Development bullet: "Built React Native cross-platform app deployed to both iOS and Android, serving 200K+ users and reducing development time by 40% compared to native approaches."',
    metadata: {
      industry: 'tech',
      role: 'mobile_developer',
      importance: 'high',
      category: 'experience_example',
    },
  },

  // DevOps Examples
  {
    id: 'ex-devops-001',
    type: 'example',
    content: 'DevOps bullet: "Implemented CI/CD pipeline using GitHub Actions and Terraform, reducing deployment time from 2 hours to 15 minutes and enabling 50+ daily deployments with zero downtime."',
    metadata: {
      industry: 'tech',
      role: 'devops',
      importance: 'high',
      category: 'experience_example',
    },
  },
  {
    id: 'ex-devops-002',
    type: 'example',
    content: 'DevOps bullet: "Established monitoring and alerting using Datadog and PagerDuty, reducing mean time to detection (MTTD) by 70% and mean time to resolution (MTTR) by 50% for production incidents."',
    metadata: {
      industry: 'tech',
      role: 'devops',
      importance: 'high',
      category: 'experience_example',
    },
  },

  // Data Science Examples
  {
    id: 'ex-ds-001',
    type: 'example',
    content: 'Data Science bullet: "Built machine learning model using Python and TensorFlow to predict customer churn with 92% accuracy, enabling proactive retention campaigns that saved $1.2M in annual revenue."',
    metadata: {
      industry: 'tech',
      role: 'data_scientist',
      importance: 'high',
      category: 'experience_example',
    },
  },
  {
    id: 'ex-ds-002',
    type: 'example',
    content: 'Data Science bullet: "Developed recommendation system processing 10M+ user interactions daily, increasing click-through rate by 35% and contributing to 20% growth in user engagement metrics."',
    metadata: {
      industry: 'tech',
      role: 'data_scientist',
      importance: 'high',
      category: 'experience_example',
    },
  },

  // QA Engineering Examples
  {
    id: 'ex-qa-001',
    type: 'example',
    content: 'QA Engineering bullet: "Established automated testing framework using Selenium and Cypress, achieving 90% test coverage and reducing regression testing time from 5 days to 2 hours."',
    metadata: {
      industry: 'tech',
      role: 'qa_engineer',
      importance: 'high',
      category: 'experience_example',
    },
  },
  {
    id: 'ex-qa-002',
    type: 'example',
    content: 'QA Engineering bullet: "Implemented performance testing suite using JMeter, identifying and resolving 15+ critical bottlenecks, improving system throughput by 300% under peak load conditions."',
    metadata: {
      industry: 'tech',
      role: 'qa_engineer',
      importance: 'high',
      category: 'experience_example',
    },
  },

  // Security Examples
  {
    id: 'ex-security-001',
    type: 'example',
    content: 'Security Engineering bullet: "Conducted penetration testing and security audits identifying 30+ vulnerabilities, implementing fixes that achieved SOC2 compliance and passed external security review."',
    metadata: {
      industry: 'tech',
      role: 'security_engineer',
      importance: 'high',
      category: 'experience_example',
    },
  },
  {
    id: 'ex-security-002',
    type: 'example',
    content: 'Security Engineering bullet: "Designed zero-trust security architecture for microservices platform, implementing OAuth 2.0 and JWT authentication serving 5M+ users with zero security breaches."',
    metadata: {
      industry: 'tech',
      role: 'security_engineer',
      importance: 'high',
      category: 'experience_example',
    },
  },

  // UI/UX Examples
  {
    id: 'ex-design-001',
    type: 'example',
    content: 'UI/UX Design bullet: "Redesigned checkout flow based on user research with 200+ participants, increasing conversion rate by 28% and generating $800K in additional quarterly revenue."',
    metadata: {
      industry: 'tech',
      role: 'uiux_designer',
      importance: 'high',
      category: 'experience_example',
    },
  },
  {
    id: 'ex-design-002',
    type: 'example',
    content: 'UI/UX Design bullet: "Established design system in Figma with 100+ reusable components, reducing design-to-development time by 50% and ensuring consistent UX across 15+ product features."',
    metadata: {
      industry: 'tech',
      role: 'uiux_designer',
      importance: 'high',
      category: 'experience_example',
    },
  },

  // Product Management Examples
  {
    id: 'ex-pm-001',
    type: 'example',
    content: 'Product Management bullet: "Defined product roadmap and led launch of mobile app feature adopted by 500K+ users in first 3 months, driving 40% increase in daily active users and $2M in new revenue."',
    metadata: {
      industry: 'tech',
      role: 'product_manager',
      importance: 'high',
      category: 'experience_example',
    },
  },
  {
    id: 'ex-pm-002',
    type: 'example',
    content: 'Product Management bullet: "Conducted customer research with 100+ users and A/B testing with 50K+ participants, validating product-market fit and achieving 85% customer satisfaction score."',
    metadata: {
      industry: 'tech',
      role: 'product_manager',
      importance: 'high',
      category: 'experience_example',
    },
  },

  // Marketing Examples
  {
    id: 'ex-marketing-001',
    type: 'example',
    content: 'Digital Marketing bullet: "Developed and executed SEO strategy that increased organic traffic by 250% over 6 months, generating 10K+ qualified leads and reducing customer acquisition cost by 35%."',
    metadata: {
      industry: 'marketing',
      role: 'digital_marketer',
      importance: 'high',
      category: 'experience_example',
    },
  },
  {
    id: 'ex-marketing-002',
    type: 'example',
    content: 'Digital Marketing bullet: "Managed $500K annual ad budget across Google Ads and social media, achieving 5:1 ROAS and driving 3,000+ conversions with 25% lower cost per acquisition."',
    metadata: {
      industry: 'marketing',
      role: 'digital_marketer',
      importance: 'high',
      category: 'experience_example',
    },
  },

  // Data Analytics Examples
  {
    id: 'ex-analytics-001',
    type: 'example',
    content: 'Data Analytics bullet: "Built executive dashboards in Tableau visualizing 20+ KPIs across business units, enabling data-driven decisions that improved operational efficiency by 30%."',
    metadata: {
      industry: 'data',
      role: 'data_analyst',
      importance: 'high',
      category: 'experience_example',
    },
  },
  {
    id: 'ex-analytics-002',
    type: 'example',
    content: 'Data Analytics bullet: "Conducted statistical analysis on customer behavior data (5M+ records) identifying 3 key retention factors, leading to strategies that reduced churn by 22%."',
    metadata: {
      industry: 'data',
      role: 'data_analyst',
      importance: 'high',
      category: 'experience_example',
    },
  },

  // ============ MORE ACTION VERBS ============

  {
    id: 'verb-005',
    type: 'action_verb',
    content: 'Analysis action verbs: Analyzed, Evaluated, Assessed, Investigated, Researched, Examined, Audited, Measured, Calculated, Diagnosed, Reviewed, Tested.',
    metadata: {
      importance: 'high',
      category: 'action_verbs',
    },
  },
  {
    id: 'verb-006',
    type: 'action_verb',
    content: 'Collaboration action verbs: Collaborated, Partnered, Cooperated, Liaised, Coordinated, United, Allied, Consulted, Contributed, Participated, Engaged, Interfaced.',
    metadata: {
      importance: 'medium',
      category: 'action_verbs',
    },
  },
  {
    id: 'verb-007',
    type: 'action_verb',
    content: 'Problem-solving action verbs: Resolved, Troubleshot, Diagnosed, Fixed, Debugged, Remediated, Addressed, Solved, Rectified, Corrected, Overhauled, Revamped.',
    metadata: {
      importance: 'high',
      category: 'action_verbs',
    },
  },

  // ============ MORE BEST PRACTICES ============

  {
    id: 'bp-005',
    type: 'best_practice',
    content: 'Certifications and training add credibility. List relevant certifications: AWS Certified Solutions Architect, Google Cloud Professional, Certified Kubernetes Administrator, PMP, Scrum Master. Include completion dates.',
    metadata: {
      importance: 'medium',
      category: 'certifications',
    },
  },
  {
    id: 'bp-006',
    type: 'best_practice',
    content: 'Side projects and portfolio work demonstrate initiative. Include links to GitHub, deployed applications, or portfolio sites. Quantify impact: "Built weather app with 5K+ active users."',
    metadata: {
      importance: 'medium',
      category: 'projects',
    },
  },
  {
    id: 'bp-007',
    type: 'best_practice',
    content: 'Technical writing and speaking engagements show thought leadership. "Published 10+ technical articles reaching 50K+ readers" or "Presented at 3 industry conferences with 500+ attendees."',
    metadata: {
      importance: 'low',
      category: 'thought_leadership',
    },
  },
  {
    id: 'bp-008',
    type: 'best_practice',
    content: 'Awards and recognition validate excellence. Include company awards, hackathon wins, academic honors. "Won company hackathon (top 5 of 100+ teams)" or "Dean\'s List 4 consecutive semesters."',
    metadata: {
      importance: 'medium',
      category: 'achievements',
    },
  },

  // ============ ATS FORMATTING RULES ============

  {
    id: 'ats-006',
    type: 'ats_rule',
    content: 'Use standard fonts that ATS systems can parse: Arial, Calibri, Times New Roman, Georgia. Avoid decorative fonts, images, tables, or complex formatting that confuses parsers.',
    metadata: {
      importance: 'high',
      source: 'ATS parsing requirements',
      category: 'format',
    },
  },
  {
    id: 'ats-007',
    type: 'ats_rule',
    content: 'File format matters. Submit as .docx or PDF (with selectable text). Avoid scanned PDFs, images, or .pages files. Test that text is selectable by trying to copy-paste from your resume.',
    metadata: {
      importance: 'high',
      source: 'ATS compatibility',
      category: 'format',
    },
  },
  {
    id: 'ats-008',
    type: 'ats_rule',
    content: 'Contact information should be in header/top. Include: Full name, phone, email, LinkedIn URL, GitHub (for tech roles), location (city, state). Make sure phone and email are formatted clearly.',
    metadata: {
      importance: 'critical',
      source: 'ATS parsing requirements',
      category: 'format',
    },
  },
  {
    id: 'ats-009',
    type: 'ats_rule',
    content: 'Dates should be consistent. Use format: "Jan 2020 - Dec 2022" or "January 2020 - December 2022" or "01/2020 - 12/2022". Avoid mixing formats. Always include month and year.',
    metadata: {
      importance: 'medium',
      source: 'ATS parsing requirements',
      category: 'format',
    },
  },
  {
    id: 'ats-010',
    type: 'ats_rule',
    content: 'Use standard bullet points (•) not custom characters or symbols. Keep bullets concise, ideally 1-2 lines each. Start each bullet with an action verb. Aim for 3-5 bullets per role.',
    metadata: {
      importance: 'medium',
      source: 'Best practices',
      category: 'format',
    },
  },

  // ============ INDUSTRY TRENDS ============

  {
    id: 'trend-001',
    type: 'industry_keywords',
    content: 'Emerging tech keywords 2024-2025: AI/ML integration, Large Language Models (LLMs), generative AI, vector databases, edge computing, WebAssembly, serverless architecture, blockchain (if relevant), quantum computing (for specialized roles).',
    metadata: {
      industry: 'tech',
      role: 'software_engineer',
      importance: 'medium',
      category: 'emerging_tech',
    },
  },
  {
    id: 'trend-002',
    type: 'industry_keywords',
    content: 'Remote work skills: async communication, distributed team collaboration, self-motivation, time management across time zones, virtual presentation, remote pair programming, documentation-first culture.',
    metadata: {
      importance: 'medium',
      category: 'remote_work',
    },
  },
  {
    id: 'trend-003',
    type: 'industry_keywords',
    content: 'Soft skills that ATS looks for: leadership, communication, problem-solving, critical thinking, adaptability, teamwork, time management, conflict resolution, emotional intelligence, mentoring.',
    metadata: {
      importance: 'medium',
      category: 'soft_skills',
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

