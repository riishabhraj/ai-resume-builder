'use client';

import { Upload, FileText, Loader2, AlertCircle, CheckCircle2, ArrowLeft, ArrowRight, BarChart3 } from 'lucide-react';
import { useState } from 'react';
import { jobCategories, getCategoryById } from '@/lib/job-categories';
import Link from 'next/link';

type Step = 'upload' | 'category' | 'field' | 'experience' | 'analyzing' | 'results';

interface AnalysisResult {
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

export default function ReviewPage() {
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
    <div className="h-screen flex flex-col animated-gradient aurora overflow-hidden">
      {/* Header */}
      <header className="glass border-b neon-border backdrop-blur-xl flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-3 group hover:opacity-90 transition-opacity">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-cyan via-brand-purple to-brand-pink flex items-center justify-center shadow-xl glow-purple">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black gradient-text">ResuCraft</span>
            </Link>
            <Link 
              href="/create" 
              className="group px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-brand-purple via-brand-pink to-brand-purple-light hover:scale-105 transition-all duration-300 shadow-xl glow-purple border-2 border-brand-purple/30"
            >
              <span className="flex items-center">
                Create Resume
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-6 relative overflow-hidden">
        {/* Background orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-brand-purple/15 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-brand-cyan/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative glass rounded-4xl shadow-2xl border-2 neon-border backdrop-blur-xl w-full max-w-5xl">
          {/* Decorative gradient overlay */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-pink/10 rounded-full blur-3xl pointer-events-none"></div>
          
          {/* Header */}
          <div className="relative px-6 py-4 border-b border-brand-purple/30 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <h1 className="text-xl font-black">
                  <span className="gradient-text">AI Resume Review</span>
                </h1>
                {step !== 'analyzing' && step !== 'results' && (
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4].map((num) => (
                      <div
                        key={num}
                        className={`h-1.5 w-12 rounded-full transition-all duration-500 ${
                          num <= getStepNumber()
                            ? 'bg-gradient-to-r from-brand-purple via-brand-pink to-brand-cyan shadow-lg'
                            : 'bg-brand-dark-surface border border-brand-purple/20'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold text-brand-purple-light ml-1">
                      Step {getStepNumber()} of 4
                    </span>
                  </div>
                )}
              </div>
              {step === 'results' && (
                <div className="hidden sm:block text-right">
                  <p className="text-xs text-gray-500">Powered by</p>
                  <p className="text-xs text-brand-cyan font-semibold">AI + ATS Best Practices</p>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="w-full max-w-5xl mx-auto">
            {/* Step 1: Upload Resume */}
            {step === 'upload' && (
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-cyan/10 rounded-full mb-4">
                    <Upload className="w-7 h-7 text-brand-cyan" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Upload Your Resume
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Upload your existing resume to get instant AI-powered feedback
                  </p>
                </div>

                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                    file
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-gray-600 hover:border-brand-cyan bg-gray-800/50 hover:bg-gray-800/70'
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
                        <CheckCircle2 className="w-12 h-12 text-green-500 mb-3" />
                        <FileText className="w-10 h-10 text-green-400 mb-2" />
                        <p className="text-green-400 font-medium text-base">{file.name}</p>
                        <p className="text-gray-400 text-xs mt-2">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <button className="mt-3 text-brand-cyan hover:underline font-medium text-sm">
                          Change file
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="text-gray-300 font-semibold text-base mb-2">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-gray-500 text-sm">PDF files only (Max 10MB)</p>
                      </div>
                    )}
                  </label>
                </div>

                {error && (
                  <div className="flex items-start space-x-3 p-4 bg-red-500/10 border border-red-500/50 rounded-lg mt-6">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Select Category */}
            {step === 'category' && (
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-cyan/10 rounded-full mb-4">
                    <span className="text-2xl">💼</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Select Job Category
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Choose the industry you're applying to
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {jobCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`p-4 rounded-xl border-2 transition-all text-left hover:scale-105 ${
                        category === cat.id
                          ? 'border-brand-cyan bg-brand-cyan/10 shadow-xl shadow-brand-cyan/30 scale-105'
                          : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                      }`}
                    >
                      <div className="text-3xl mb-2">{cat.icon}</div>
                      <div className="text-sm font-semibold text-white">{cat.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Select Field/Role */}
            {step === 'field' && selectedCategory && (
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-cyan/10 rounded-full mb-4">
                    <span className="text-2xl">{selectedCategory.icon}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Select Your Role
                  </h2>
                  <p className="text-gray-400 text-sm">
                    What position are you targeting in {selectedCategory.name}?
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedCategory.fields.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setField(f.id)}
                      className={`p-3 rounded-lg border-2 transition-all text-left flex items-center justify-between hover:scale-102 ${
                        field === f.id
                          ? 'border-brand-cyan bg-brand-cyan/10 shadow-lg scale-102'
                          : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                      }`}
                    >
                      <span className="text-white font-medium text-sm">{f.name}</span>
                      {field === f.id && (
                        <CheckCircle2 className="w-5 h-5 text-brand-cyan flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Select Experience Level */}
            {step === 'experience' && selectedField && (
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-cyan/10 rounded-full mb-4">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Experience Level
                  </h2>
                  <p className="text-gray-400 text-sm">
                    How many years of experience do you have as a {selectedField.name}?
                  </p>
                </div>

                <div className="space-y-3">
                  {selectedField.experienceLevels.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => setExperience(level.id)}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center justify-between hover:scale-102 ${
                        experience === level.id
                          ? 'border-brand-cyan bg-brand-cyan/10 shadow-xl shadow-brand-cyan/20 scale-102'
                          : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                      }`}
                    >
                      <div>
                        <div className="text-white font-semibold text-base mb-1">
                          {level.label}
                        </div>
                        <div className="text-gray-400 text-sm">
                          Perfect for candidates with {level.years} years of experience
                        </div>
                      </div>
                      {experience === level.id && (
                        <CheckCircle2 className="w-6 h-6 text-brand-cyan flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>

                {error && (
                  <div className="flex items-start space-x-3 p-4 bg-red-500/10 border border-red-500/50 rounded-lg mt-6">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}
              </div>
            )}

            {/* Analyzing State */}
            {step === 'analyzing' && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-16 h-16 text-brand-cyan animate-spin mb-4" />
                <p className="text-gray-300 text-lg mb-2 font-semibold">Analyzing your resume...</p>
                <p className="text-gray-500 text-sm">
                  Using AI and industry best practices
                </p>
              </div>
            )}

            {/* Results */}
            {step === 'results' && analysis && (
              <div className="space-y-5 max-h-[calc(100vh-350px)] overflow-y-auto custom-scrollbar pr-2">
                {/* Overall Score */}
                <div className="text-center">
                  <div className="inline-block relative">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="10"
                        fill="none"
                        className="text-gray-700"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="url(#gradient)"
                        strokeWidth="10"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - analysis.overallScore / 100)}`}
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
                      <span className={`text-4xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                        {analysis.overallScore}
                      </span>
                      <span className="text-gray-400 text-xs">/ 100</span>
                    </div>
                  </div>
                  <p className="text-gray-300 mt-3 text-sm font-medium">
                    {analysis.overallScore >= 80 && '🎉 Excellent! Your resume is highly competitive.'}
                    {analysis.overallScore >= 60 && analysis.overallScore < 80 && '👍 Good! Some improvements will make it stand out.'}
                    {analysis.overallScore < 60 && '📈 Needs improvement. Follow suggestions below.'}
                  </p>
                </div>

                {/* Category Breakdown */}
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                  <h3 className="text-base font-semibold text-white mb-4">📊 Category Breakdown</h3>
                  <div className="space-y-3">
                    {Object.entries(analysis.categories).map(([key, value]) => (
                      <div key={key}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-gray-300 capitalize font-medium">{key.replace('_', ' ')}</span>
                          <span className={`${getScoreColor(value)} font-bold`}>{value}%</span>
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
                  <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/30">
                    <h3 className="text-base font-semibold text-green-400 mb-3 flex items-center">
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Strengths
                    </h3>
                    <ul className="space-y-2">
                      {analysis.strengths.map((strength, idx) => (
                        <li key={idx} className="text-green-300/90 flex items-start text-sm">
                          <span className="mr-2 mt-0.5">✓</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggestions */}
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                  <h3 className="text-base font-semibold text-white mb-4">💡 Improvement Suggestions</h3>
                  
                  {['high', 'medium', 'low'].map((priority) => {
                    const prioritySuggestions = analysis.suggestions.filter(
                      (s) => s.priority === priority
                    );
                    
                    if (prioritySuggestions.length === 0) return null;

                    return (
                      <div key={priority} className="mb-4 last:mb-0">
                        <h4 className="text-xs font-medium text-gray-400 uppercase mb-2 flex items-center">
                          <span className="mr-1.5">{getPriorityIcon(priority)}</span>
                          {priority} Priority
                        </h4>
                        <div className="space-y-2">
                          {prioritySuggestions.map((suggestion, idx) => (
                            <div
                              key={idx}
                              className={`p-3 rounded-lg border ${getPriorityColor(suggestion.priority)}`}
                            >
                              <p className="mb-2 text-sm">{suggestion.suggestion}</p>
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
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <h3 className="text-base font-semibold text-white mb-3">📝 Detailed Feedback</h3>
                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                      {analysis.detailedFeedback}
                    </p>
                  </div>
                )}
              </div>
            )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-700">
            {step !== 'analyzing' && step !== 'results' && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href={step === 'upload' ? '/' : '#'}
                  onClick={(e) => {
                    if (step !== 'upload') {
                      e.preventDefault();
                      handleBack();
                    }
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center font-medium text-sm"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {step === 'upload' ? 'Back to Home' : 'Back'}
                </Link>
                <button
                  onClick={handleNext}
                  disabled={
                    (step === 'upload' && !file) ||
                    (step === 'category' && !category) ||
                    (step === 'field' && !field) ||
                    (step === 'experience' && !experience)
                  }
                  className="w-full sm:w-auto px-8 py-2.5 bg-gradient-to-r from-brand-purple via-brand-pink to-brand-purple-light hover:scale-105 text-white rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-bold text-sm shadow-xl glow-purple border-2 border-brand-pink/30 disabled:hover:scale-100"
                >
                  {step === 'experience' ? (
                    <>
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Analyze Resume
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              </div>
            )}
            {step === 'results' && (
              <div className="flex flex-col items-center gap-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleReset}
                    className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium text-sm"
                  >
                    Analyze Another
                  </button>
                  <Link
                    href="/create"
                    className="px-5 py-2.5 bg-brand-cyan hover:bg-brand-cyan/90 text-white rounded-lg transition-colors text-center font-medium text-sm"
                  >
                    Create New Resume
                  </Link>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Powered by AI + 91 ATS Best Practices
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

