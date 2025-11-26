'use client';

import React, { useState } from 'react';
import { X, Target, Zap, Loader2, Sparkles } from 'lucide-react';

interface TailorToJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  sections: any[];
  onTailorComplete: (tailoredSections: any[]) => void;
}

export default function TailorToJobModal({
  isOpen,
  onClose,
  sections,
  onTailorComplete,
}: TailorToJobModalProps) {
  const [activeTab, setActiveTab] = useState<'tailor' | 'optimize'>('tailor');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTailor = async () => {
    if (!jobDescription.trim()) {
      setError('Please paste a job description');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tailor-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sections,
          jobDescription: jobDescription.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to tailor resume');
      }

      const data = await response.json();
      
      // Debug logging
      console.log('=== TAILOR RESPONSE ===');
      console.log('Success:', data.success);
      console.log('Original sections count:', sections.length);
      console.log('Tailored sections count:', data.tailoredSections?.length);
      console.log('Changes:', data.changes?.length || 0);
      
      if (!data.tailoredSections || data.tailoredSections.length === 0) {
        console.error('No tailored sections received!');
        throw new Error('No tailored sections received from API');
      }
      
      // Log each section structure
      data.tailoredSections.forEach((s: any, idx: number) => {
        console.log(`Section ${idx}:`, {
          id: s.id,
          type: s.type,
          title: s.title,
          hasContent: !!s.content,
          contentType: Array.isArray(s.content) ? 'array' : typeof s.content
        });
        if (s.type === 'experience' && Array.isArray(s.content) && s.content.length > 0) {
          console.log(`  First experience:`, {
            company: s.content[0].company,
            role: s.content[0].role,
            bulletsCount: s.content[0].bullets?.length || 0
          });
        }
      });
      
      // Ensure we have personal-info section
      const hasPersonalInfo = data.tailoredSections.some((s: any) => s.id === 'personal-info' || s.type === 'personal-info');
      if (!hasPersonalInfo) {
        console.warn('Personal info section missing, adding it back');
        const personalInfoSection = sections.find(s => s.id === 'personal-info' || s.type === 'personal-info');
        if (personalInfoSection) {
          data.tailoredSections.unshift(personalInfoSection);
        }
      }
      
      console.log('=== CALLING onTailorComplete ===');
      onTailorComplete(data.tailoredSections);
      onClose();
      setJobDescription('');
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneralOptimize = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/optimize-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to optimize resume');
      }

      const data = await response.json();
      
      // Debug logging
      console.log('Optimized sections received:', data.optimizedSections);
      console.log('Original sections count:', sections.length);
      console.log('Optimized sections count:', data.optimizedSections?.length);
      
      if (!data.optimizedSections || data.optimizedSections.length === 0) {
        throw new Error('No optimized sections received from API');
      }
      
      // Ensure we have personal-info section
      const hasPersonalInfo = data.optimizedSections.some((s: any) => s.id === 'personal-info' || s.type === 'personal-info');
      if (!hasPersonalInfo) {
        console.warn('Personal info section missing, adding it back');
        const personalInfoSection = sections.find(s => s.id === 'personal-info' || s.type === 'personal-info');
        if (personalInfoSection) {
          data.optimizedSections.unshift(personalInfoSection);
        }
      }
      
      onTailorComplete(data.optimizedSections);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-brand-dark-bg via-brand-dark-card to-brand-dark-bg rounded-3xl max-w-3xl w-full flex flex-col border-2 border-brand-purple/30 shadow-2xl glow-purple overflow-hidden">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-5 border-b border-brand-purple/20 flex-shrink-0">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-purple via-brand-pink to-brand-purple-light flex items-center justify-center shadow-xl">
              {activeTab === 'tailor' ? (
                <Target className="w-6 h-6 text-white" />
              ) : (
                <Zap className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-black text-brand-white">
                {activeTab === 'tailor' ? 'Tailor Resume to Job' : 'Optimize Resume'}
              </h2>
              <p className="text-sm text-brand-gray-text mt-1">
                {activeTab === 'tailor'
                  ? 'AI-powered optimization for your target role'
                  : 'General optimization with best practices'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-brand-gray-text hover:text-brand-white transition-colors p-2 rounded-lg hover:bg-brand-dark-surface"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs - Fixed */}
        <div className="flex border-b border-brand-purple/20 px-5 flex-shrink-0">
          <button
            onClick={() => setActiveTab('tailor')}
            className={`flex items-center space-x-2 px-4 py-3 font-semibold transition-all ${
              activeTab === 'tailor'
                ? 'text-brand-white border-b-2 border-brand-pink'
                : 'text-brand-gray-text hover:text-brand-white'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Tailor to Job</span>
          </button>
          <button
            onClick={() => setActiveTab('optimize')}
            className={`flex items-center space-x-2 px-4 py-3 font-semibold transition-all ${
              activeTab === 'optimize'
                ? 'text-brand-white border-b-2 border-brand-purple'
                : 'text-brand-gray-text hover:text-brand-white'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>General Optimization</span>
          </button>
        </div>

        {/* Content - No Scroll */}
        <div className="flex-1 p-5">
          {activeTab === 'tailor' ? (
            <div className="space-y-4">
              {/* AI Will Section */}
              <div className="bg-gradient-to-br from-brand-cyan/10 to-brand-purple/10 rounded-2xl p-4 border border-brand-cyan/20">
                <div className="flex items-start space-x-3">
                  <Sparkles className="w-5 h-5 text-brand-cyan flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-base font-bold text-brand-white mb-2">Our AI will:</h3>
                    <ul className="space-y-1.5 text-sm text-brand-gray-text">
                      <li className="flex items-start">
                        <span className="text-brand-cyan mr-2">•</span>
                        <span>Match your experience to job requirements</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-brand-cyan mr-2">•</span>
                        <span>Add metrics and quantified achievements</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-brand-cyan mr-2">•</span>
                        <span>Optimize keywords for ATS systems</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-brand-cyan mr-2">•</span>
                        <span>Improve bullet points with powerful action verbs</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Job Description Input */}
              <div>
                <label className="block text-sm font-semibold text-brand-white mb-2">
                  Paste Job Description
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => {
                    setJobDescription(e.target.value);
                    setError(null);
                  }}
                  placeholder="Paste the full job description here... The more details, the better the results!"
                  className="w-full h-32 px-4 py-3 bg-brand-dark-bg text-brand-white border-2 border-brand-purple/20 rounded-xl focus:outline-none focus:border-brand-purple focus:shadow-lg focus:shadow-brand-purple/20 transition-all resize-none text-sm"
                />
                <div className="flex items-start space-x-2 mt-2 text-xs text-brand-gray-text">
                  <span className="text-brand-cyan mt-0.5">💡</span>
                  <span>
                    <strong>Tip:</strong> Include the full job posting with responsibilities,
                    requirements, and qualifications
                  </span>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 text-red-400 text-xs">
                  {error}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* General Optimization Info */}
              <div className="bg-gradient-to-br from-brand-purple/10 to-brand-pink/10 rounded-2xl p-4 border border-brand-purple/20">
                <div className="flex items-start space-x-3">
                  <Zap className="w-5 h-5 text-brand-purple flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-base font-bold text-brand-white mb-2">
                      General Optimization Mode
                    </h3>
                    <p className="text-sm text-brand-gray-text mb-3">
                      Perfect when you don't have a specific job description yet. Our AI will:
                    </p>
                    <ul className="space-y-1.5 text-sm text-brand-gray-text">
                      <li className="flex items-start">
                        <span className="text-brand-purple mr-2">•</span>
                        <span>Apply XYZ formula to all bullet points</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-brand-purple mr-2">•</span>
                        <span>Replace weak verbs with strong action words</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-brand-purple mr-2">•</span>
                        <span>Add quantifiable metrics and achievements</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-brand-purple mr-2">•</span>
                        <span>Optimize for ATS compatibility</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-brand-purple mr-2">•</span>
                        <span>Improve clarity and professional tone</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* What Will Be Optimized */}
              <div>
                <h3 className="text-base font-bold text-brand-white mb-2">What will be optimized:</h3>
                <ul className="space-y-1.5 text-sm text-brand-gray-text">
                  <li className="flex items-center">
                    <span className="text-brand-green mr-2">✓</span>
                    <span>Experience bullets</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-brand-green mr-2">✓</span>
                    <span>Leadership experience</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-brand-green mr-2">✓</span>
                    <span>Project descriptions</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-brand-green mr-2">✓</span>
                    <span>Professional summary</span>
                  </li>
                </ul>
                <p className="text-xs text-brand-gray-text mt-3 italic">
                  Your personal info, education, and skills sections will remain unchanged.
                </p>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 text-red-400 text-xs">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Button - Fixed */}
        <div className="p-5 border-t border-brand-purple/20 flex-shrink-0">
          <button
            onClick={activeTab === 'tailor' ? handleTailor : handleGeneralOptimize}
            disabled={loading || (activeTab === 'tailor' && !jobDescription.trim())}
            className="w-full group px-6 py-3 rounded-xl font-bold text-base text-white bg-gradient-to-r from-brand-purple via-brand-pink to-brand-purple-light hover:scale-105 transition-all duration-300 shadow-xl glow-pink border-2 border-brand-pink/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                {activeTab === 'tailor' ? (
                  <>
                    <Target className="w-5 h-5" />
                    <span>Tailor My Resume</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    <span>Optimize My Resume</span>
                  </>
                )}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

