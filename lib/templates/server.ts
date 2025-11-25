// Server-only template loading functions
// DO NOT import this in client components - use index.ts instead

import { loadTemplate as loadTemplateImpl, listTemplates as listTemplatesImpl } from '../template-loader';

/**
 * Get a template by ID (server-only)
 * @param templateId - The template identifier
 * @returns The LaTeX template string
 */
export function getTemplate(templateId: string): string {
  return loadTemplateImpl(templateId);
}

/**
 * Load a template by ID (server-only)
 * @param templateId - The template identifier
 * @returns The LaTeX template string
 */
export function loadTemplate(templateId: string): string {
  return loadTemplateImpl(templateId);
}

/**
 * List all available template IDs (server-only)
 * @returns Array of template IDs
 */
export function listTemplates(): string[] {
  return listTemplatesImpl();
}

