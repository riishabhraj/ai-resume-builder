/**
 * Shared types for ATS analysis results
 */

export interface AnalysisResult {
  overallScore: number;
  summaryFeedback?: string;
  scoreGap?: number;
  categories: {
    ats: { score: number; max: number; why: string };
    content: { score: number; max: number; why: string };
    writing: { score: number; max: number; why: string };
    jobMatch: { score: number; max: number; why: string };
    ready: { score: number; max: number; why: string };
  };
  suggestions: Array<{
    priority: 'high' | 'medium' | 'low';
    category: string;
    suggestion: string;
    impact: string;
    example?: string;
    beforeAfter?: {
      before: string;
      after: string;
    };
  }>;
  strengths: Array<string | {
    point: string;
    evidence?: string;
    impact?: string;
  }>;
  detailedFeedback: string | {
    executiveSummary?: string;
    keyFindings?: string[];
    improvementRoadmap?: string;
    industryInsights?: string;
  };
  keywordAnalysis?: {
    found: string[];
    missing: string[];
    recommendations: string[];
  };
  sectionAnalysis?: {
    [sectionName: string]: {
      score: number;
      strengths: string[];
      weaknesses: string[];
      recommendations: string[];
      wordCount?: number;
      idealWordCount?: number;
    };
  };
  industryBenchmarks?: {
    averageScore: number;
    percentile: number;
    topPerformers: string[];
  };
}

