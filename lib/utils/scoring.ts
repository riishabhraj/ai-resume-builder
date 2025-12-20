/**
 * Shared scoring utility functions for ATS analysis display
 */

/**
 * Get text color class based on score percentage
 */
export function getScoreColor(score: number, max: number): string {
  if (max <= 0 || !isFinite(max) || !isFinite(score)) {
    return 'text-red-500'; // Default to red for invalid inputs
  }
  const percentage = (score / max) * 100;
  if (percentage >= 90) return 'text-green-500';
  if (percentage >= 70) return 'text-yellow-500';
  return 'text-red-500';
}

/**
 * Get gradient color values (hex) for score-based gradients
 * Returns [fromColor, toColor] as hex strings
 */
export function getScoreGradientColors(score: number, max: number): [string, string] {
  if (max <= 0 || !isFinite(max) || !isFinite(score)) {
    return ['#ef4444', '#dc2626']; // Default to red for invalid inputs
  }
  const percentage = (score / max) * 100;
  if (percentage >= 90) return ['#10b981', '#059669']; // green-500 to emerald-600
  if (percentage >= 70) return ['#eab308', '#ea580c']; // yellow-500 to orange-600
  return ['#ef4444', '#dc2626']; // red-500 to rose-600
}

/**
 * Get Tailwind gradient class string (for non-SVG use)
 */
export function getScoreGradient(score: number, max: number): string {
  if (max <= 0 || !isFinite(max) || !isFinite(score)) {
    return 'from-red-500 to-rose-600'; // Default to red for invalid inputs
  }
  const percentage = (score / max) * 100;
  if (percentage >= 90) return 'from-green-500 to-emerald-600';
  if (percentage >= 70) return 'from-yellow-500 to-orange-600';
  return 'from-red-500 to-rose-600';
}

/**
 * Get background color class for progress bars
 */
export function getBarColor(score: number, max: number): string {
  if (max <= 0 || !isFinite(max) || !isFinite(score)) {
    return 'bg-red-500'; // Default to red for invalid inputs
  }
  const percentage = (score / max) * 100;
  if (percentage >= 90) return 'bg-green-500';
  if (percentage >= 70) return 'bg-yellow-500';
  return 'bg-red-500';
}

