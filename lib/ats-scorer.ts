export function calculateATSScore(resumeText: string, jobDescription?: string): number {
  let score = 0;
  const maxScore = 100;

  if (!resumeText) return 0;

  const hasMetrics = /\d+%|\d+\+|\$\d+|increased|decreased|reduced|improved/gi.test(resumeText);
  if (hasMetrics) score += 15;

  const hasSections = /experience|education|skills/gi.test(resumeText);
  if (hasSections) score += 20;

  const hasActionVerbs = /\b(led|managed|developed|created|implemented|designed|built|improved|optimized|achieved)\b/gi.test(resumeText);
  if (hasActionVerbs) score += 15;

  const wordCount = resumeText.split(/\s+/).length;
  if (wordCount >= 200 && wordCount <= 800) score += 15;

  if (jobDescription) {
    const keywords = extractKeywords(jobDescription);
    const matchedKeywords = keywords.filter((keyword) =>
      new RegExp(`\\b${keyword}\\b`, 'gi').test(resumeText)
    );
    const keywordScore = Math.min(35, Math.round((matchedKeywords.length / keywords.length) * 35));
    score += keywordScore;
  } else {
    score += 20;
  }

  return Math.min(maxScore, score);
}

function extractKeywords(text: string): string[] {
  const commonWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might',
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 3 && !commonWords.has(word));

  const wordFreq = new Map<string, number>();
  words.forEach((word) => {
    wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
  });

  return Array.from(wordFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word);
}

export function getATSRecommendations(score: number, resumeText: string, jobDescription?: string): string[] {
  const recommendations: string[] = [];

  if (score < 50) {
    recommendations.push('Your resume needs significant improvement for ATS compatibility.');
  }

  if (!/\d+%|\d+\+|\$\d+|increased|decreased|reduced|improved/gi.test(resumeText)) {
    recommendations.push('Add quantifiable metrics and achievements (e.g., "Increased sales by 25%").');
  }

  if (!/\b(led|managed|developed|created|implemented|designed|built|improved|optimized|achieved)\b/gi.test(resumeText)) {
    recommendations.push('Use strong action verbs to start your bullet points.');
  }

  const wordCount = resumeText.split(/\s+/).length;
  if (wordCount < 200) {
    recommendations.push('Your resume is too short. Add more detail about your experience.');
  } else if (wordCount > 800) {
    recommendations.push('Your resume is too long. Focus on the most relevant information.');
  }

  if (jobDescription) {
    const keywords = extractKeywords(jobDescription);
    const missingKeywords = keywords.filter(
      (keyword) => !new RegExp(`\\b${keyword}\\b`, 'gi').test(resumeText)
    );
    if (missingKeywords.length > 0) {
      recommendations.push(
        `Consider including these keywords from the job description: ${missingKeywords.slice(0, 5).join(', ')}.`
      );
    }
  }

  if (recommendations.length === 0) {
    recommendations.push('Great job! Your resume is well-optimized for ATS systems.');
  }

  return recommendations;
}
