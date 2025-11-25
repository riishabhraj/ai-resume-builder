'use client';

import { X, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface ATSAnalysisResult {
  overallScore: number;
  categories: {
    keywords: number;
    format: number;
    experience: number;
    completeness: number;
    readability: number;
  };
  suggestions: Array<{
    priority: 'high' | 'medium' | 'low';
    category: string;
    suggestion: string;
    impact: string;
  }>;
  strengths: string[];
  detailedFeedback: string;
}

interface ATSAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  sections: any[];
  jobDescription?: string;
}

export default function ATSAnalysisModal({
  isOpen,
  onClose,
  sections,
  jobDescription,
}: ATSAnalysisModalProps) {
  const [analysis, setAnalysis] = useState<ATSAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch analysis when modal opens
  useState(() => {
    if (isOpen && !analysis && !loading) {
      fetchAnalysis();
    }
  });

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze-ats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections, jobDescription }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze resume');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-600';
    if (score >= 60) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-rose-600';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">ATS Score Analysis</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-16 h-16 text-brand-cyan animate-spin mb-4" />
              <p className="text-gray-400">Analyzing your resume...</p>
              <p className="text-sm text-gray-500 mt-2">
                Using AI and ATS best practices database
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-start space-x-3 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 font-medium">Analysis Error</p>
                <p className="text-red-300/80 text-sm mt-1">{error}</p>
                <button
                  onClick={fetchAnalysis}
                  className="mt-3 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {analysis && (
            <div className="space-y-6">
              {/* Overall Score */}
              <div className="text-center">
                <div className="inline-block relative">
                  <svg className="w-40 h-40 transform -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      className="text-gray-700"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="url(#gradient)"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 70}`}
                      strokeDashoffset={`${2 * Math.PI * 70 * (1 - analysis.overallScore / 100)}`}
                      className="transition-all duration-1000"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop
                          offset="0%"
                          className={getScoreGradient(analysis.overallScore).split(' ')[0].replace('from-', 'stop-')}
                        />
                        <stop
                          offset="100%"
                          className={getScoreGradient(analysis.overallScore).split(' ')[1].replace('to-', 'stop-')}
                        />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-5xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                      {analysis.overallScore}
                    </span>
                    <span className="text-gray-400 text-sm">/ 100</span>
                  </div>
                </div>
                <p className="text-gray-300 mt-4">
                  {analysis.overallScore >= 80 && 'Excellent! Your resume is highly ATS-friendly.'}
                  {analysis.overallScore >= 60 && analysis.overallScore < 80 && 'Good! Some improvements will boost your score.'}
                  {analysis.overallScore < 60 && 'Needs work. Follow suggestions to improve significantly.'}
                </p>
              </div>

              {/* Category Breakdown */}
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">📊 Category Breakdown</h3>
                <div className="space-y-4">
                  {Object.entries(analysis.categories).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-300 capitalize">{key.replace('_', ' ')}</span>
                        <span className={getScoreColor(value)}>{value}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full bg-gradient-to-r ${getScoreGradient(value)} transition-all duration-1000`}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths */}
              {analysis.strengths && analysis.strengths.length > 0 && (
                <div className="bg-green-500/10 rounded-lg p-6 border border-green-500/30">
                  <h3 className="text-lg font-semibold text-green-400 mb-3 flex items-center">
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Strengths
                  </h3>
                  <ul className="space-y-2">
                    {analysis.strengths.map((strength, idx) => (
                      <li key={idx} className="text-green-300/90 text-sm flex items-start">
                        <span className="mr-2">✓</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggestions */}
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">💡 Improvement Suggestions</h3>
                
                {['high', 'medium', 'low'].map((priority) => {
                  const prioritySuggestions = analysis.suggestions.filter(
                    (s) => s.priority === priority
                  );
                  
                  if (prioritySuggestions.length === 0) return null;

                  return (
                    <div key={priority} className="mb-6 last:mb-0">
                      <h4 className="text-sm font-medium text-gray-400 uppercase mb-3 flex items-center">
                        <span className="mr-2">{getPriorityIcon(priority)}</span>
                        {priority} Priority
                      </h4>
                      <div className="space-y-3">
                        {prioritySuggestions.map((suggestion, idx) => (
                          <div
                            key={idx}
                            className={`p-4 rounded-lg border ${getPriorityColor(suggestion.priority)}`}
                          >
                            <p className="text-sm mb-2">{suggestion.suggestion}</p>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-400 capitalize">
                                Category: {suggestion.category}
                              </span>
                              <span className="text-gray-400">{suggestion.impact}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Detailed Feedback */}
              {analysis.detailedFeedback && (
                <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-3">📝 Detailed Feedback</h3>
                  <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                    {analysis.detailedFeedback}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700">
          <p className="text-xs text-gray-500">
            Powered by AI + ATS Best Practices Database
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-brand-cyan hover:bg-brand-cyan/90 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

