/**
 * Utility functions for mapping suggestion categories and section names
 * to the 5 main analysis categories
 */

/**
 * Map suggestion categories to our 5 main categories
 */
export function mapSuggestionCategory(suggestionCategory: string): string | null {
  const categoryLower = suggestionCategory.toLowerCase();
  // ATS & Structure
  if (categoryLower.includes('ats') || categoryLower.includes('format') || categoryLower.includes('structure') || 
      categoryLower.includes('keyword') || categoryLower.includes('parseability') || categoryLower.includes('compatibility')) {
    return 'ats';
  }
  // Content Quality
  if (categoryLower.includes('content') || categoryLower.includes('experience') || categoryLower.includes('completeness') || 
      categoryLower.includes('quantifiable') || categoryLower.includes('metrics') || categoryLower.includes('achievement')) {
    return 'content';
  }
  // Writing Quality
  if (categoryLower.includes('writing') || categoryLower.includes('readability') || categoryLower.includes('action verb') ||
      categoryLower.includes('grammar') || categoryLower.includes('clarity') || categoryLower.includes('tone') ||
      categoryLower.includes('language') || categoryLower.includes('conciseness')) {
    return 'writing';
  }
  // Job Optimization
  if (categoryLower.includes('job') || categoryLower.includes('match') || categoryLower.includes('optimization') || 
      categoryLower.includes('role') || categoryLower.includes('tailored') || categoryLower.includes('alignment') ||
      categoryLower.includes('target')) {
    return 'jobMatch';
  }
  // Application Ready
  if (categoryLower.includes('ready') || categoryLower.includes('application') || categoryLower.includes('presentation') ||
      categoryLower.includes('professional') || categoryLower.includes('error')) {
    return 'ready';
  }
  return null;
}

/**
 * Map section names to categories
 */
export function mapSectionToCategory(sectionName: string): string | null {
  const sectionLower = sectionName.toLowerCase();
  if (sectionLower.includes('personal') || sectionLower.includes('header') || sectionLower.includes('contact')) {
    return 'ats'; // Personal info affects ATS parsing
  }
  if (sectionLower.includes('experience') || sectionLower.includes('work') || sectionLower.includes('employment')) {
    return 'content';
  }
  if (sectionLower.includes('education')) {
    return 'content';
  }
  if (sectionLower.includes('skill')) {
    return 'ats'; // Skills affect keyword matching
  }
  if (sectionLower.includes('summary') || sectionLower.includes('objective')) {
    return 'writing';
  }
  // All sections can contribute to "ready" category
  // This ensures we get feedback for Application Ready
  return 'ready';
}

