// Client-safe exports (no Node.js dependencies)
export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  category: 'modern' | 'classic' | 'creative' | 'minimal';
  preview?: string;
}

export const TEMPLATE_METADATA: ResumeTemplate[] = [
  {
    id: 'professional',
    name: 'Professional',
    description: 'Clean, ATS-friendly format with clear sections and professional styling',
    category: 'classic',
    preview: '/templates/previews/professional.png',
  },
];

/**
 * Get template metadata by ID (client-safe)
 */
export function getTemplateMetadata(templateId: string): ResumeTemplate | undefined {
  return TEMPLATE_METADATA.find(t => t.id === templateId);
}

/**
 * Get all available templates (client-safe)
 */
export function getAllTemplates(): ResumeTemplate[] {
  return TEMPLATE_METADATA;
}

/**
 * Get default template ID (client-safe)
 */
export function getDefaultTemplateId(): string {
  return 'professional';
}

