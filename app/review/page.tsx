'use client';

import { Upload, FileText, Loader2, AlertCircle, CheckCircle2, ArrowLeft, ArrowRight, BarChart3, X } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jobCategories, getCategoryById } from '@/lib/job-categories';
import Link from 'next/link';
import { shouldRedirectToWaitlist } from '@/lib/waitlist-check';
import type { AnalysisResult } from '@/lib/types/analysis';
import { getScoreColor, getScoreGradient, getBarColor, getScoreGradientColors } from '@/lib/utils/scoring';
import { ReviewPageSkeleton } from '@/components/skeletons/ReviewPageSkeleton';
import { mapSuggestionCategory, mapSectionToCategory } from '@/lib/utils/categoryMapping';
import { useAuthStore } from '@/stores/authStore';

type Step = 'upload' | 'category' | 'field' | 'experience' | 'analyzing' | 'results';

export default function ReviewPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const { user, initialized, initialize } = useAuthStore();
  
  // Initialize auth
  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);
  
  // Ensure component only renders fully on client side
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Check if we should redirect to waitlist (only on client)
  useEffect(() => {
    if (isMounted && shouldRedirectToWaitlist()) {
      router.push('/waitlist');
    }
  }, [router, isMounted]);
  
  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (initialized && !user) {
      router.push('/sign-in?redirect=/review');
    }
  }, [initialized, user, router]);
  
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState('');
  const [field, setField] = useState('');
  const [experience, setExperience] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDetailedFeedback, setShowDetailedFeedback] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [currentStage, setCurrentStage] = useState(0);

  const selectedCategory = getCategoryById(category);
  const selectedField = selectedCategory?.fields.find((f) => f.id === field);

  // Define stages for analyzing state
  const analyzingStages = [
    { label: 'Parsing Document', description: 'Extracting text and structure from your resume', icon: '📄' },
    { label: 'Content Analysis', description: 'Reviewing sections and formatting', icon: '🔍' },
    { label: 'ATS Evaluation', description: 'Checking ATS compatibility and keywords', icon: '📊' },
    { label: 'Quality Assessment', description: 'Evaluating writing quality and impact', icon: '✨' },
    { label: 'Generating Insights', description: 'Creating personalized recommendations', icon: '📝' },
  ];

  // Animate stages progressively when in analyzing step
  useEffect(() => {
    if (step !== 'analyzing') {
      // Reset stage when not analyzing
      setCurrentStage(0);
      return;
    }

    // Reset to first stage when entering analyzing step
    setCurrentStage(0);

    const interval = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev < analyzingStages.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 10000); // Change stage every 10 seconds (50s total / 5 stages)

    return () => clearInterval(interval);
  }, [step]);

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
    setCurrentStage(0);

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

  // Show loading state while checking authentication
  if (!isMounted || !initialized) {
    return <ReviewPageSkeleton />;
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return <ReviewPageSkeleton />;
  }

  return (
    <div className="h-screen flex flex-col animated-gradient aurora overflow-hidden" suppressHydrationWarning>
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b neon-border backdrop-blur-xl flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <Link href="/" className="flex items-center space-x-2 group hover:opacity-90 transition-opacity">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-cyan via-brand-purple to-brand-pink flex items-center justify-center shadow-xl glow-purple">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-black gradient-text">ResuCraft</span>
              </Link>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-1">
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-brand-gray-text hover:text-brand-white hover:bg-brand-navy/50 transition-all duration-300"
                >
                  Dashboard
                </Link>
                <Link
                  href="/resumes"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-brand-gray-text hover:text-brand-white hover:bg-brand-navy/50 transition-all duration-300"
                >
                  Resumes
                </Link>
                <Link
                  href="/review"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-brand-white bg-brand-purple/20 hover:bg-brand-purple/30 transition-all duration-300"
                >
                  AI Analysis
                </Link>
              </nav>
            </div>

            <Link 
              href="/create" 
              className="group px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-brand-purple via-brand-pink to-brand-purple-light hover:scale-105 transition-all duration-300 shadow-xl glow-purple"
            >
              <span className="flex items-center">
                Create Resume
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Background gradient overlay for modal */}
      <div className="fixed inset-0 pointer-events-none z-30">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-brand-purple/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-brand-cyan/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Main Content Modal */}
      <main className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 flex items-center justify-center p-4 pt-16 pb-4 overflow-y-auto">
        <div className="relative glass rounded-3xl shadow-2xl border-2 neon-border backdrop-blur-xl w-full max-w-5xl max-h-[calc(100vh-6rem)] overflow-hidden flex flex-col">
          {/* Decorative gradient overlay */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-pink/10 rounded-full blur-3xl pointer-events-none"></div>
          
          {/* Header */}
          <div className="relative px-6 py-4 border-b border-brand-purple/30 backdrop-blur-xl flex-shrink-0">
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
          <div className="p-6 overflow-y-auto flex-1">
            <div className="w-full mx-auto">
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
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
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
                  <div className="flex items-start space-x-3 p-4 bg-red-500/10 border border-red-500/50 rounded-2xl mt-6">
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
                      className={`p-4 rounded-2xl border-2 transition-all text-left hover:scale-105 ${
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
                      className={`p-3 rounded-2xl border-2 transition-all text-left flex items-center justify-between hover:scale-102 ${
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
                      className={`w-full p-4 rounded-2xl border-2 transition-all text-left flex items-center justify-between hover:scale-102 ${
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
                  <div className="flex items-start space-x-3 p-4 bg-red-500/10 border border-red-500/50 rounded-2xl mt-6">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}
              </div>
            )}

            {/* Analyzing State */}
            {step === 'analyzing' && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-20 h-20 mb-6 relative">
                  <Loader2 className="w-20 h-20 text-brand-cyan animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-brand-cyan/20 rounded-full"></div>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-2 gradient-text">
                  AI Resume Analysis in Progress
                </h3>
                
                {/* Timing Message */}
                <div className="bg-gradient-to-r from-brand-purple/20 via-brand-pink/20 to-brand-purple-light/20 rounded-2xl px-6 py-3 mb-8 border border-brand-purple/30">
                  <p className="text-brand-cyan font-semibold text-sm">
                    ⏱️ Estimated time: 30 seconds to 1 minute
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Our AI is performing a comprehensive analysis of your resume
                  </p>
                </div>

                {/* Progress Stages */}
                <div className="w-full max-w-lg space-y-3">
                  {analyzingStages.map((stage, index) => {
                      const isCompleted = index < currentStage;
                      const isCurrent = index === currentStage;
                      const isUpcoming = index > currentStage;
                      
                      return (
                        <div
                          key={index}
                          className={`flex items-center space-x-4 p-4 rounded-2xl border-2 transition-all duration-700 ${
                            isCurrent
                              ? 'bg-gradient-to-r from-brand-cyan/20 to-brand-purple/20 border-brand-cyan/50 shadow-lg shadow-brand-cyan/20 scale-[1.02]'
                              : isCompleted
                              ? 'bg-gray-800/70 border-green-500/30'
                              : 'bg-gray-800/20 border-gray-700/20 opacity-40'
                          }`}
                        >
                          <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all duration-700 ${
                            isCurrent
                              ? 'bg-brand-cyan/30 scale-110 shadow-lg shadow-brand-cyan/50 animate-pulse'
                              : isCompleted
                              ? 'bg-green-500/30 text-green-400'
                              : 'bg-gray-700/20 grayscale opacity-50'
                          }`}>
                            {isCompleted ? '✓' : stage.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className={`font-semibold text-sm transition-colors duration-700 ${
                                isCurrent ? 'text-white' : isCompleted ? 'text-gray-300' : 'text-gray-600'
                              }`}>
                                {stage.label}
                                {isCurrent && (
                                  <span className="ml-2 text-brand-cyan animate-pulse">●</span>
                                )}
                              </p>
                              {isCompleted && (
                                <span className="text-green-400 text-xs font-semibold flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Done
                                </span>
                              )}
                            </div>
                            <p className={`text-xs mt-0.5 transition-colors duration-700 ${
                              isCurrent ? 'text-gray-300' : isCompleted ? 'text-gray-500' : 'text-gray-700'
                            }`}>
                              {stage.description}
                            </p>
                            {isCurrent && (
                              <div className="mt-2 w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="rounded-full h-1.5 bg-gradient-to-r from-brand-cyan via-brand-purple to-brand-pink animate-pulse"
                                  style={{ 
                                    width: '100%',
                                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Results */}
            {step === 'results' && analysis && (() => {
              const [gradientFrom, gradientTo] = getScoreGradientColors(analysis.overallScore, 100);
              return (
              <div className="space-y-5 mt-2">
                {/* Top Banner */}
                {analysis.scoreGap !== undefined && analysis.scoreGap > 0 && (
                  <div className="bg-gradient-to-r from-brand-purple via-brand-pink to-brand-purple-light rounded-2xl p-3 flex items-center justify-between">
                    <p className="text-white font-medium text-sm">
                      Let's get you job-ready — close the {analysis.scoreGap}-point gap to 95%+
                    </p>
                    <button
                      onClick={() => setShowDetailedFeedback(true)}
                      className="px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl font-medium text-sm transition-colors"
                    >
                      View Detailed Feedback
                    </button>
                  </div>
                )}

                {/* Overall Score */}
                <div className="text-center bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                  <div className="inline-block relative">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor={gradientFrom} />
                          <stop offset="100%" stopColor={gradientTo} />
                        </linearGradient>
                      </defs>
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
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-4xl font-bold ${getScoreColor(analysis.overallScore, 100)}`}>
                        {analysis.overallScore}
                      </span>
                      <span className="text-gray-400 text-xs">/ 100</span>
                    </div>
                  </div>
                  <p className={`mt-3 text-sm font-medium ${
                    analysis.overallScore >= 90 ? 'text-green-400' : 
                    analysis.overallScore >= 70 ? 'text-yellow-400' : 
                    'text-red-400'
                  }`}>
                    {analysis.summaryFeedback || (
                      analysis.overallScore >= 90 ? '🎉 Excellent! Your resume is highly competitive.' :
                      analysis.overallScore >= 70 ? '👍 Good! Some improvements will make it stand out.' :
                      '📈 Needs improvement. Follow suggestions below.'
                    )}
                  </p>
                  {analysis.scoreGap !== undefined && analysis.scoreGap > 0 && (
                    <p className="text-gray-400 text-xs mt-2">
                      See the exact bullets to rewrite, keywords to add, and structure fixes to gain {analysis.scoreGap} points.
                    </p>
                  )}
                </div>

                {/* Category Breakdown - 5 Bars Only */}
                <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700">
                  <h3 className="text-base font-semibold text-white mb-4">📊 Category Breakdown</h3>
                  <div className="space-y-3">
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
                            <div className="flex justify-between text-xs mb-1.5">
                              <span className="text-gray-300 font-medium">{label}</span>
                              <span className={`${getScoreColor(score, max)} font-bold`}>
                                {score}/{max}
                              </span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                              <div
                                className={`h-2 rounded-full ${getBarColor(score, max)} transition-all duration-1000`}
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
              </div>
              );
            })()}

            {/* Detailed Feedback Modal */}
            {showDetailedFeedback && analysis && (
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-gray-900 rounded-3xl border-2 border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                  {/* Modal Header */}
                  <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Detailed Feedback</h2>
                    <button
                      onClick={() => {
                        setShowDetailedFeedback(false);
                        setExpandedCategories(new Set());
                      }}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Modal Content */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {/* Category Breakdown */}
                    <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700">
                      <h3 className="text-base font-semibold text-white mb-4">📊 Category Breakdown</h3>
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

                            // Filter suggestions for this category
                            const categorySuggestions = analysis.suggestions?.filter((s) => {
                              const mappedCategory = mapSuggestionCategory(s.category);
                              return mappedCategory === key;
                            }) || [];

                            // Get strengths from sectionAnalysis that map to this category
                            const sectionStrengths: string[] = [];
                            const sectionWeaknesses: string[] = [];
                            const sectionRecommendations: string[] = [];
                            
                            if (analysis.sectionAnalysis) {
                              Object.entries(analysis.sectionAnalysis).forEach(([sectionName, sectionData]) => {
                                const mappedCategory = mapSectionToCategory(sectionName);
                                // For "ready" category, include ALL sections since it's about overall readiness
                                // For other categories, only include if mapped
                                if (key === 'ready' || mappedCategory === key) {
                                  sectionStrengths.push(...(sectionData.strengths || []));
                                  sectionWeaknesses.push(...(sectionData.weaknesses || []));
                                  sectionRecommendations.push(...(sectionData.recommendations || []));
                                }
                              });
                            }
                            
                            // Check if we have low score - this determines if we need fallback feedback
                            const isLowScore = percentage < 60;

                            // Filter strengths for this category
                            const categoryStrengths = analysis.strengths?.filter((s) => {
                              if (typeof s === 'object' && 'category' in s && (s as any).category) {
                                const mappedCategory = mapSuggestionCategory((s as any).category);
                                return mappedCategory === key;
                              }
                              // If strength doesn't have a category, try to infer from the point text
                              const strengthText = typeof s === 'object' ? s.point?.toLowerCase() || '' : s.toLowerCase();
                              if (key === 'ats' && (strengthText.includes('ats') || strengthText.includes('format') || strengthText.includes('structure') || 
                                  strengthText.includes('keyword') || strengthText.includes('parse') || strengthText.includes('compatible'))) {
                                return true;
                              }
                              if (key === 'content' && (strengthText.includes('content') || strengthText.includes('experience') || 
                                  strengthText.includes('achievement') || strengthText.includes('quantifiable') || strengthText.includes('metric') ||
                                  strengthText.includes('impact') || strengthText.includes('result'))) {
                                return true;
                              }
                              if (key === 'writing' && (strengthText.includes('writing') || strengthText.includes('clarity') || 
                                  strengthText.includes('tone') || strengthText.includes('grammar') || strengthText.includes('professional') ||
                                  strengthText.includes('language') || strengthText.includes('concise'))) {
                                return true;
                              }
                              if (key === 'jobMatch' && (strengthText.includes('job') || strengthText.includes('match') || 
                                  strengthText.includes('role') || strengthText.includes('tailored') || strengthText.includes('alignment') ||
                                  strengthText.includes('target') || strengthText.includes('relevant'))) {
                                return true;
                              }
                              if (key === 'ready' && (strengthText.includes('ready') || strengthText.includes('complete') || 
                                  strengthText.includes('professional') || strengthText.includes('presentation') || strengthText.includes('error'))) {
                                return true;
                              }
                              return false;
                            }) || [];

                            // Combine strengths from both sources
                            let allStrengths = [
                              ...categoryStrengths,
                              ...sectionStrengths.map(s => ({ point: s }))
                            ];

                            // Combine suggestions with section recommendations
                            let allSuggestions = [
                              ...categorySuggestions,
                              ...sectionRecommendations.map(rec => ({
                                priority: 'medium' as const,
                                category: key,
                                suggestion: rec,
                                impact: 'Improves this category score'
                              })),
                              ...sectionWeaknesses.map(weak => ({
                                priority: 'high' as const,
                                category: key,
                                suggestion: `Address: ${weak}`,
                                impact: 'Improves this category score'
                              }))
                            ];
                            
                            // For low scores, add general feedback as fallback if no category-specific feedback
                            if (isLowScore && allSuggestions.length === 0) {
                              const generalSuggestions = analysis.suggestions?.filter((s) => {
                                // Include suggestions that don't map to other categories or map to this one
                                const mappedCategory = mapSuggestionCategory(s.category);
                                return mappedCategory === null || mappedCategory === key;
                              }) || [];
                              allSuggestions.push(...generalSuggestions);
                            }
                            
                            // For "ready" category specifically, also check detailedFeedback for insights
                            if (key === 'ready' && allSuggestions.length === 0 && analysis.detailedFeedback) {
                              if (typeof analysis.detailedFeedback === 'object') {
                                if (analysis.detailedFeedback.improvementRoadmap) {
                                  allSuggestions.push({
                                    priority: 'high' as const,
                                    category: key,
                                    suggestion: analysis.detailedFeedback.improvementRoadmap,
                                    impact: 'Critical for application readiness'
                                  });
                                }
                                if (analysis.detailedFeedback.keyFindings) {
                                  analysis.detailedFeedback.keyFindings.forEach((finding) => {
                                    allSuggestions.push({
                                      priority: 'high' as const,
                                      category: key,
                                      suggestion: finding,
                                      impact: 'Addresses critical readiness gap'
                                    });
                                  });
                                }
                              }
                            }
                            
                            // For low scores, also add general strengths if no category-specific ones
                            if (isLowScore && allStrengths.length === 0) {
                              const generalStrengths = analysis.strengths?.filter((s) => {
                                // For low scores, show general strengths if no category-specific ones
                                const strengthText = typeof s === 'object' ? s.point?.toLowerCase() || '' : s.toLowerCase();
                                // Include if it's relevant to the category or if it's general
                                return key === 'ready' || strengthText.length > 0;
                              }) || [];
                              allStrengths.push(...generalStrengths);
                            }

                            const isExpanded = expandedCategories.has(key);
                            
                            const toggleCategory = () => {
                              setExpandedCategories((prev) => {
                                const newSet = new Set(prev);
                                if (newSet.has(key)) {
                                  newSet.delete(key);
                                } else {
                                  newSet.add(key);
                                }
                                return newSet;
                              });
                            };

                            return (
                              <div key={key} className="bg-gray-900/50 rounded-2xl p-4 border border-gray-700">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                      <h4 className="text-sm font-semibold text-white">{label}</h4>
                                      <span className={`text-base font-bold ${getScoreColor(score, max)}`}>
                                        {score}/{max}
                                      </span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                                      <div
                                        className={`h-2 rounded-full ${getBarColor(score, max)} transition-all duration-1000`}
                                        style={{ width: `${percentage}%` }}
                                      />
                                    </div>
                                    {whyText && (
                                      <p className="text-gray-400 text-xs mb-3">Why this Score: {whyText}</p>
                                    )}
                                  </div>
                                </div>
                                <button
                                  onClick={toggleCategory}
                                  className="w-full px-6 py-2.5 bg-gradient-to-r from-brand-purple via-brand-pink to-brand-purple-light hover:scale-105 text-white rounded-xl transition-all duration-300 text-sm font-bold flex items-center justify-center shadow-xl glow-purple border-2 border-brand-pink/30"
                                >
                                  {isExpanded ? 'Hide Details' : 'View Detailed'}
                                </button>
                                
                                {/* Expanded Category Details */}
                                {isExpanded && (
                                  <div className="mt-4 space-y-4 pt-4 border-t border-gray-700">
                                    {/* Strengths for this category */}
                                    {allStrengths.length > 0 && (
                                      <div>
                                        <h5 className="text-sm font-semibold text-green-400 mb-2 flex items-center">
                                          <CheckCircle2 className="w-4 h-4 mr-2" />
                                          Strengths
                                        </h5>
                                        <ul className="space-y-2">
                                          {allStrengths.map((strength, idx) => {
                                            const strengthObj = typeof strength === 'object' && 'point' in strength 
                                              ? strength as { point: string; evidence?: string; impact?: string }
                                              : { point: typeof strength === 'string' ? strength : '' };
                                            return (
                                              <li key={idx} className="text-green-300/90 text-xs">
                                                <div className="flex items-start">
                                                  <span className="mr-2 mt-0.5">✓</span>
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

                                    {/* Improvements for this category */}
                                    {allSuggestions.length > 0 && (
                                      <div>
                                        <h5 className="text-sm font-semibold text-yellow-400 mb-2">💡 Improvements</h5>
                                        <div className="space-y-2">
                                          {allSuggestions.map((suggestion, idx) => {
                                            const suggestionObj = suggestion as {
                                              priority: 'high' | 'medium' | 'low';
                                              category: string;
                                              suggestion: string;
                                              impact: string;
                                              example?: string;
                                              beforeAfter?: { before: string; after: string };
                                            };
                                            return (
                                            <div
                                              key={idx}
                                              className={`p-3 rounded-2xl border ${getPriorityColor(suggestionObj.priority)}`}
                                            >
                                              <p className="mb-2 text-xs font-medium">{suggestionObj.suggestion}</p>
                                              {suggestionObj.example && (
                                                <div className="bg-gray-900/50 rounded-xl p-2 mb-2 mt-2">
                                                  <p className="text-xs text-gray-400 mb-1">Example:</p>
                                                  <p className="text-xs text-gray-300">{suggestionObj.example}</p>
                                                </div>
                                              )}
                                              {suggestionObj.beforeAfter && (
                                                <div className="bg-gray-900/50 rounded-xl p-2 mb-2 mt-2 space-y-2">
                                                  <div>
                                                    <p className="text-xs text-red-400 mb-1">Before:</p>
                                                    <p className="text-xs text-gray-400 line-through">{suggestionObj.beforeAfter.before}</p>
                                                  </div>
                                                  <div>
                                                    <p className="text-xs text-green-400 mb-1">After:</p>
                                                    <p className="text-xs text-gray-300">{suggestionObj.beforeAfter.after}</p>
                                                  </div>
                                                </div>
                                              )}
                                              <div className="flex items-center justify-between text-xs mt-2">
                                                <span className="text-gray-400 capitalize">
                                                  {getPriorityIcon(suggestionObj.priority)} {suggestionObj.priority} Priority
                                                </span>
                                                <span className="text-gray-400 font-medium">{suggestionObj.impact}</span>
                                              </div>
                                            </div>
                      );
                    })}
                </div>
              </div>
            )}

                                    {allStrengths.length === 0 && allSuggestions.length === 0 && (
                                      <p className="text-gray-400 text-xs text-center py-2">No specific feedback available for this category.</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
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
                  className="w-full sm:w-auto px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors flex items-center justify-center font-medium text-sm"
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
                  className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-brand-purple via-brand-pink to-brand-purple-light hover:scale-105 text-white rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-bold text-sm shadow-xl glow-purple border-2 border-brand-pink/30 disabled:hover:scale-100"
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
                    className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors font-medium text-sm"
                  >
                    Analyze Another
                  </button>
                  <Link
                    href="/create"
                    className="px-6 py-2.5 bg-brand-cyan hover:bg-brand-cyan/90 text-white rounded-xl transition-colors text-center font-medium text-sm"
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

