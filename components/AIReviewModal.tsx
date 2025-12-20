'use client';

import { X, Upload, FileText, Loader2, AlertCircle, CheckCircle2, ChevronRight, ArrowLeft, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { jobCategories, getCategoryById } from '@/lib/job-categories';
import type { AnalysisResult } from '@/lib/types/analysis';
import { getScoreColor, getScoreGradient, getBarColor } from '@/lib/utils/scoring';
import { ModalSkeleton } from '@/components/skeletons/ModalSkeleton';

interface AIReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'upload' | 'category' | 'field' | 'experience' | 'analyzing' | 'results';

export default function AIReviewModal({ isOpen, onClose }: AIReviewModalProps) {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState('');
  const [field, setField] = useState('');
  const [experience, setExperience] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedCategory = getCategoryById(category);
  const selectedField = selectedCategory?.fields.find((f) => f.id === field);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Please upload a PDF file');
        setFile(null);
      }
    }
  };

  const handleNext = () => {
    if (step === 'upload' && !file) {
      setError('Please upload a resume first');
      return;
    }
    
    if (step === 'upload') {
      setStep('category');
    } else if (step === 'category' && category) {
      setStep('field');
    } else if (step === 'field' && field) {
      setStep('experience');
    } else if (step === 'experience' && experience) {
      handleAnalyze();
    }
  };

  const handleBack = () => {
    if (step === 'category') {
      setStep('upload');
    } else if (step === 'field') {
      setStep('category');
      setField('');
    } else if (step === 'experience') {
      setStep('field');
      setExperience('');
    } else if (step === 'results') {
      handleReset();
    }
  };

  const handleAnalyze = async () => {
    if (!file || !category || !field || !experience) {
      setError('Please complete all fields');
      return;
    }

    setStep('analyzing');
    setError(null);

    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('category', category);
      formData.append('field', field);
      formData.append('experience', experience);

      const response = await fetch('/api/review-resume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setAnalysis(data.analysis);
      setStep('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze resume');
      setStep('experience');
    }
  };

  const handleReset = () => {
    setStep('upload');
    setFile(null);
    setCategory('');
    setField('');
    setExperience('');
    setAnalysis(null);
    setError(null);
  };

  const getStepNumber = () => {
    switch (step) {
      case 'upload': return 1;
      case 'category': return 2;
      case 'field': return 3;
      case 'experience': return 4;
      default: return 4;
    }
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">AI Resume Review</h2>
            {step !== 'analyzing' && step !== 'results' && (
              <div className="flex items-center gap-2 mt-2">
                {[1, 2, 3, 4].map((num) => (
                  <div
                    key={num}
                    className={`h-1.5 w-12 rounded-full transition-all ${
                      num <= getStepNumber()
                        ? 'bg-brand-cyan'
                        : 'bg-gray-700'
                    }`}
                  />
                ))}
                <span className="text-sm text-gray-400 ml-2">
                  Step {getStepNumber()} of 4
                </span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Upload Resume */}
          {step === 'upload' && (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-cyan/10 rounded-full mb-4">
                  <Upload className="w-8 h-8 text-brand-cyan" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Upload Your Resume
                </h3>
                <p className="text-gray-400">
                  Upload your existing resume to get instant AI-powered feedback
                </p>
              </div>

              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                  file
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-gray-600 hover:border-brand-cyan bg-gray-800/50'
                }`}
              >
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="resume-upload"
                />
                <label htmlFor="resume-upload" className="cursor-pointer">
                  {file ? (
                    <div className="flex flex-col items-center">
                      <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                      <FileText className="w-12 h-12 text-green-400 mb-3" />
                      <p className="text-green-400 font-medium text-lg">{file.name}</p>
                      <p className="text-gray-400 text-sm mt-2">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button className="mt-4 text-sm text-brand-cyan hover:underline">
                        Change file
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="w-16 h-16 text-gray-400 mb-4" />
                      <p className="text-gray-300 font-medium text-lg mb-2">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-gray-500 text-sm">PDF files only (Max 10MB)</p>
                    </div>
                  )}
                </label>
              </div>

              {error && (
                <div className="flex items-start space-x-3 p-4 bg-red-500/10 border border-red-500/50 rounded-lg mt-4">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Category */}
          {step === 'category' && (
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-cyan/10 rounded-full mb-4">
                  <span className="text-3xl">💼</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Select Job Category
                </h3>
                <p className="text-gray-400">
                  Choose the industry you're applying to
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {jobCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      category === cat.id
                        ? 'border-brand-cyan bg-brand-cyan/10 shadow-lg shadow-brand-cyan/20 scale-105'
                        : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:scale-102'
                    }`}
                  >
                    <div className="text-4xl mb-3">{cat.icon}</div>
                    <div className="text-base font-semibold text-white">{cat.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Select Field/Role */}
          {step === 'field' && selectedCategory && (
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-cyan/10 rounded-full mb-4">
                  <span className="text-3xl">{selectedCategory.icon}</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Select Your Role
                </h3>
                <p className="text-gray-400">
                  What position are you targeting in {selectedCategory.name}?
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedCategory.fields.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setField(f.id)}
                    className={`p-5 rounded-lg border-2 transition-all text-left flex items-center justify-between ${
                      field === f.id
                        ? 'border-brand-cyan bg-brand-cyan/10 shadow-lg'
                        : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                    }`}
                  >
                    <span className="text-white font-medium">{f.name}</span>
                    {field === f.id && (
                      <CheckCircle2 className="w-5 h-5 text-brand-cyan" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Select Experience Level */}
          {step === 'experience' && selectedField && (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-cyan/10 rounded-full mb-4">
                  <span className="text-3xl">📊</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Experience Level
                </h3>
                <p className="text-gray-400">
                  How many years of experience do you have as a {selectedField.name}?
                </p>
              </div>

              <div className="space-y-3">
                {selectedField.experienceLevels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setExperience(level.id)}
                    className={`w-full p-6 rounded-lg border-2 transition-all text-left flex items-center justify-between ${
                      experience === level.id
                        ? 'border-brand-cyan bg-brand-cyan/10 shadow-lg'
                        : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                    }`}
                  >
                    <div>
                      <div className="text-white font-semibold text-lg mb-1">
                        {level.label}
                      </div>
                      <div className="text-gray-400 text-sm">
                        Perfect for candidates with {level.years} years of experience
                      </div>
                    </div>
                    {experience === level.id && (
                      <CheckCircle2 className="w-6 h-6 text-brand-cyan" />
                    )}
                  </button>
                ))}
              </div>

              {error && (
                <div className="flex items-start space-x-3 p-4 bg-red-500/10 border border-red-500/50 rounded-lg mt-4">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}
            </div>
          )}

          {/* Analyzing State */}
          {step === 'analyzing' && <ModalSkeleton />}

          {step === 'results' && analysis && (
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
                        <stop offset="0%" stopColor={analysis.overallScore >= 80 ? '#10b981' : analysis.overallScore >= 60 ? '#eab308' : '#ef4444'} />
                        <stop offset="100%" stopColor={analysis.overallScore >= 80 ? '#059669' : analysis.overallScore >= 60 ? '#ea580c' : '#dc2626'} />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-5xl font-bold ${getScoreColor(analysis.overallScore, 100)}`}>
                      {analysis.overallScore}
                    </span>
                    <span className="text-gray-400 text-sm">/ 100</span>
                  </div>
                </div>
                <p className="text-gray-300 mt-4">
                  {analysis.overallScore >= 80 && 'Excellent! Your resume is highly competitive.'}
                  {analysis.overallScore >= 60 && analysis.overallScore < 80 && 'Good! Some improvements will make it stand out.'}
                  {analysis.overallScore < 60 && 'Needs improvement. Follow suggestions below.'}
                </p>
              </div>

              {/* Category Breakdown - 5 Bars Only */}
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">📊 Category Breakdown</h3>
                <div className="space-y-4">
                  {(() => {
                    // Define the 5 categories in order
                    const categoryOrder = [
                      { key: 'ats', label: 'ATS & Structure' },
                      { key: 'content', label: 'Content Quality' },
                      { key: 'writing', label: 'Writing Quality' },
                      { key: 'jobMatch', label: 'Job Optimization' },
                      { key: 'ready', label: 'Application Ready' },
                    ];

                    return categoryOrder.map(({ key, label }) => {
                      const categoryData = analysis.categories[key as keyof typeof analysis.categories];
                      if (!categoryData) return null;

                      // Handle both old format (number) and new format ({ score, max })
                      const score = typeof categoryData === 'number' ? categoryData : categoryData.score;
                      const max = typeof categoryData === 'number' ? 100 : categoryData.max;
                      const percentage = (score / max) * 100;

                      const whyText = typeof categoryData === 'object' && 'why' in categoryData ? categoryData.why : '';

                      return (
                        <div key={key}>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-300 font-medium">{label}</span>
                            <span className={getScoreColor(score, max)}>
                              {score}/{max}
                            </span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2.5 mb-2">
                            <div
                              className={`h-2.5 rounded-full ${getBarColor(score, max)} transition-all duration-1000`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          {whyText && (
                            <p className="text-gray-400 text-xs mb-3">{whyText}</p>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Executive Summary */}
              {analysis.detailedFeedback && typeof analysis.detailedFeedback === 'object' && analysis.detailedFeedback.executiveSummary && (
                <div className="bg-blue-500/10 rounded-lg p-6 border border-blue-500/30">
                  <h3 className="text-lg font-semibold text-blue-400 mb-3">📋 Executive Summary</h3>
                  <p className="text-blue-300/90 text-sm leading-relaxed">
                    {analysis.detailedFeedback.executiveSummary}
                  </p>
                </div>
              )}

              {/* Industry Benchmarks */}
              {analysis.industryBenchmarks && (
                <div className="bg-purple-500/10 rounded-lg p-6 border border-purple-500/30">
                  <h3 className="text-lg font-semibold text-purple-400 mb-4">📊 Industry Benchmarks</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-purple-300/80 text-sm mb-1">Industry Average</p>
                      <p className="text-2xl font-bold text-purple-300">{analysis.industryBenchmarks.averageScore}</p>
                    </div>
                    <div>
                      <p className="text-purple-300/80 text-sm mb-1">Your Percentile</p>
                      <p className="text-2xl font-bold text-purple-300">{analysis.industryBenchmarks.percentile}th</p>
                    </div>
                  </div>
                  {analysis.industryBenchmarks.topPerformers && analysis.industryBenchmarks.topPerformers.length > 0 && (
                    <div>
                      <p className="text-purple-300/80 text-sm mb-2">What Top Resumes Include:</p>
                      <ul className="space-y-1">
                        {analysis.industryBenchmarks.topPerformers.map((item, idx) => (
                          <li key={idx} className="text-purple-300/70 text-xs flex items-start">
                            <span className="mr-2">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Keyword Analysis */}
              {analysis.keywordAnalysis && (
                <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">🔑 Keyword Analysis</h3>
                  <div className="space-y-4">
                    {analysis.keywordAnalysis.found && analysis.keywordAnalysis.found.length > 0 && (
                      <div>
                        <p className="text-green-400 text-sm font-medium mb-2">Found Keywords ({analysis.keywordAnalysis.found.length})</p>
                        <div className="flex flex-wrap gap-2">
                          {analysis.keywordAnalysis.found.slice(0, 20).map((keyword, idx) => (
                            <span key={idx} className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">
                              {keyword}
                            </span>
                          ))}
                          {analysis.keywordAnalysis.found.length > 20 && (
                            <span className="px-2 py-1 bg-gray-700 text-gray-400 rounded text-xs">
                              +{analysis.keywordAnalysis.found.length - 20} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    {analysis.keywordAnalysis.missing && analysis.keywordAnalysis.missing.length > 0 && (
                      <div>
                        <p className="text-red-400 text-sm font-medium mb-2">Missing Keywords ({analysis.keywordAnalysis.missing.length})</p>
                        <div className="flex flex-wrap gap-2">
                          {analysis.keywordAnalysis.missing.slice(0, 15).map((keyword, idx) => (
                            <span key={idx} className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs">
                              {keyword}
                            </span>
                          ))}
                          {analysis.keywordAnalysis.missing.length > 15 && (
                            <span className="px-2 py-1 bg-gray-700 text-gray-400 rounded text-xs">
                              +{analysis.keywordAnalysis.missing.length - 15} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    {analysis.keywordAnalysis.recommendations && analysis.keywordAnalysis.recommendations.length > 0 && (
                      <div>
                        <p className="text-blue-400 text-sm font-medium mb-2">Recommended Keywords</p>
                        <ul className="space-y-1">
                          {analysis.keywordAnalysis.recommendations.map((rec, idx) => (
                            <li key={idx} className="text-blue-300/80 text-xs flex items-start">
                              <span className="mr-2">→</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Strengths */}
              {analysis.strengths && analysis.strengths.length > 0 && (
                <div className="bg-green-500/10 rounded-lg p-6 border border-green-500/30">
                  <h3 className="text-lg font-semibold text-green-400 mb-3 flex items-center">
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Strengths
                  </h3>
                  <ul className="space-y-3">
                    {analysis.strengths.map((strength, idx) => {
                      const strengthObj = typeof strength === 'object' ? strength : { point: strength };
                      return (
                        <li key={idx} className="text-green-300/90 text-sm">
                          <div className="flex items-start">
                            <span className="mr-2 mt-1">✓</span>
                            <div className="flex-1">
                              <p className="font-medium">{strengthObj.point}</p>
                              {strengthObj.evidence && (
                                <p className="text-green-300/70 text-xs mt-1">📍 {strengthObj.evidence}</p>
                              )}
                              {strengthObj.impact && (
                                <p className="text-green-300/60 text-xs mt-1">💡 {strengthObj.impact}</p>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
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
                            <p className="text-sm mb-2 font-medium">{suggestion.suggestion}</p>
                            {suggestion.example && (
                              <div className="bg-gray-900/50 rounded p-2 mb-2 mt-2">
                                <p className="text-xs text-gray-400 mb-1">Example:</p>
                                <p className="text-xs text-gray-300">{suggestion.example}</p>
                              </div>
                            )}
                            {suggestion.beforeAfter && (
                              <div className="bg-gray-900/50 rounded p-2 mb-2 mt-2 space-y-2">
                                <div>
                                  <p className="text-xs text-red-400 mb-1">Before:</p>
                                  <p className="text-xs text-gray-400 line-through">{suggestion.beforeAfter.before}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-green-400 mb-1">After:</p>
                                  <p className="text-xs text-gray-300">{suggestion.beforeAfter.after}</p>
                                </div>
                              </div>
                            )}
                            <div className="flex items-center justify-between text-xs mt-2">
                              <span className="text-gray-400 capitalize">
                                Category: {suggestion.category}
                              </span>
                              <span className="text-gray-400 font-medium">{suggestion.impact}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Section Analysis */}
              {analysis.sectionAnalysis && Object.keys(analysis.sectionAnalysis).length > 0 && (
                <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">📑 Section-by-Section Analysis</h3>
                  <div className="space-y-4">
                    {Object.entries(analysis.sectionAnalysis).map(([sectionName, sectionData]) => (
                      <div key={sectionName} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-base font-semibold text-white capitalize">{sectionName}</h4>
                          <span className={`text-lg font-bold ${getScoreColor(sectionData.score, 100)}`}>
                            {sectionData.score}%
                          </span>
                        </div>
                        {sectionData.wordCount !== undefined && sectionData.idealWordCount !== undefined && (
                          <div className="mb-3">
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                              <span>Word Count: {sectionData.wordCount}</span>
                              <span>Ideal: {sectionData.idealWordCount}</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full bg-gradient-to-r ${getScoreGradient(sectionData.score, 100)}`}
                                style={{ 
                                  width: `${sectionData.idealWordCount > 0 
                                    ? Math.min(100, (sectionData.wordCount / sectionData.idealWordCount) * 100) 
                                    : 0}%` 
                                }}
                              />
                            </div>
                          </div>
                        )}
                        {sectionData.strengths && sectionData.strengths.length > 0 && (
                          <div className="mb-2">
                            <p className="text-green-400 text-xs font-medium mb-1">Strengths:</p>
                            <ul className="space-y-1">
                              {sectionData.strengths.map((strength, idx) => (
                                <li key={idx} className="text-green-300/80 text-xs flex items-start">
                                  <span className="mr-1">✓</span>
                                  <span>{strength}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {sectionData.weaknesses && sectionData.weaknesses.length > 0 && (
                          <div className="mb-2">
                            <p className="text-red-400 text-xs font-medium mb-1">Areas for Improvement:</p>
                            <ul className="space-y-1">
                              {sectionData.weaknesses.map((weakness, idx) => (
                                <li key={idx} className="text-red-300/80 text-xs flex items-start">
                                  <span className="mr-1">•</span>
                                  <span>{weakness}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {sectionData.recommendations && sectionData.recommendations.length > 0 && (
                          <div>
                            <p className="text-blue-400 text-xs font-medium mb-1">Recommendations:</p>
                            <ul className="space-y-1">
                              {sectionData.recommendations.map((rec, idx) => (
                                <li key={idx} className="text-blue-300/80 text-xs flex items-start">
                                  <span className="mr-1">→</span>
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detailed Feedback */}
              {analysis.detailedFeedback && (
                <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-3">📝 Detailed Feedback</h3>
                  {typeof analysis.detailedFeedback === 'string' ? (
                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                      {analysis.detailedFeedback}
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {analysis.detailedFeedback.keyFindings && analysis.detailedFeedback.keyFindings.length > 0 && (
                        <div>
                          <p className="text-yellow-400 text-sm font-medium mb-2">Key Findings:</p>
                          <ul className="space-y-2">
                            {analysis.detailedFeedback.keyFindings.map((finding, idx) => (
                              <li key={idx} className="text-gray-300 text-sm flex items-start">
                                <span className="mr-2 text-yellow-400">•</span>
                                <span>{finding}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {analysis.detailedFeedback.improvementRoadmap && (
                        <div>
                          <p className="text-blue-400 text-sm font-medium mb-2">Improvement Roadmap:</p>
                          <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                            {analysis.detailedFeedback.improvementRoadmap}
                          </p>
                        </div>
                      )}
                      {analysis.detailedFeedback.industryInsights && (
                        <div>
                          <p className="text-purple-400 text-sm font-medium mb-2">Industry Insights:</p>
                          <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                            {analysis.detailedFeedback.industryInsights}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700">
          {step !== 'analyzing' && step !== 'results' && (
            <>
              <button
                onClick={step === 'upload' ? onClose : handleBack}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {step === 'upload' ? 'Cancel' : 'Back'}
              </button>
              <button
                onClick={handleNext}
                disabled={
                  (step === 'upload' && !file) ||
                  (step === 'category' && !category) ||
                  (step === 'field' && !field) ||
                  (step === 'experience' && !experience)
                }
                className="px-6 py-2 bg-brand-cyan hover:bg-brand-cyan/90 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {step === 'experience' ? 'Analyze Resume' : 'Next'}
                {step !== 'experience' && <ArrowRight className="w-4 h-4 ml-2" />}
                {step === 'experience' && <BarChart3 className="w-4 h-4 ml-2" />}
              </button>
            </>
          )}
          {step === 'results' && (
            <>
              <p className="text-xs text-gray-500">
                Powered by AI + ATS Best Practices
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={handleReset}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Analyze Another
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-brand-cyan hover:bg-brand-cyan/90 text-white rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function BarChart3({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

