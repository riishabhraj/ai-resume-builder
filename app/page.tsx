'use client';

import Link from 'next/link';
import { FileText, Zap, Target, CheckCircle, BarChart3 } from 'lucide-react';
import { useState } from 'react';
import AIReviewModal from '@/components/AIReviewModal';

export default function Home() {
  const [showAIReview, setShowAIReview] = useState(false);

  return (
    <>
    <AIReviewModal isOpen={showAIReview} onClose={() => setShowAIReview(false)} />
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e27] via-[#0f1629] to-[#14213D]" data-theme="atsbuilder">
      <header className="bg-gradient-to-r from-[#0f1629]/80 via-[#14213D]/80 to-[#0f1629]/80 backdrop-blur-sm border-b border-brand-cyan/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <FileText className="w-8 h-8 text-brand-cyan" />
              <span className="text-2xl font-bold text-brand-white">ResuCraft</span>
            </div>
            <Link href="/create" className="btn bg-brand-cyan hover:bg-brand-cyan/90 text-brand-black border-0 font-semibold shadow-lg shadow-brand-cyan/30 hover:shadow-brand-cyan/50 transition-all">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden py-20 sm:py-32">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-cyan/5 via-transparent to-purple-500/5"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-cyan/10 via-transparent to-transparent"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <h1 className="text-4xl sm:text-6xl font-bold text-brand-white mb-6">
                Create ATS-Friendly Resumes
                <span className="block text-brand-cyan mt-2">In Minutes</span>
              </h1>
              <p className="text-xl text-brand-gray max-w-2xl mx-auto mb-8">
                Build professional, ATS-optimized resumes tailored to job descriptions
                using AI-powered insights and expert formatting.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/create"
                  className="btn bg-brand-cyan hover:bg-brand-cyan/90 text-brand-black border-0 font-semibold btn-lg text-lg px-8"
                >
                  Start Building Free
                </Link>
                <button
                  onClick={() => setShowAIReview(true)}
                  className="btn btn-outline btn-lg text-lg px-8 text-brand-white border-purple-500 hover:bg-purple-600 hover:border-purple-600 hover:text-white transition-all"
                >
                  <BarChart3 className="w-5 h-5 mr-2" />
                  AI Review Resume
                </button>
              </div>
              <p className="text-sm text-gray-400 mt-4">
                Already have a resume? Get instant AI-powered analysis
              </p>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 bg-gradient-to-b from-[#14213D]/50 to-[#0f1629]/50 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-cyan/5 via-transparent to-transparent"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-brand-white mb-12">
              Why Choose ResuCraft?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="card bg-gradient-to-br from-[#1a1f3a] to-[#0f1629] shadow-2xl border border-brand-cyan/30 hover:border-brand-cyan/60 hover:shadow-brand-cyan/20 transition-all duration-300 hover:scale-105">
                <div className="card-body items-center text-center">
                  <div className="p-3 bg-brand-cyan/10 rounded-full mb-4">
                    <Zap className="w-12 h-12 text-brand-cyan" />
                  </div>
                  <h3 className="card-title text-brand-white">AI-Powered Generation</h3>
                  <p className="text-brand-gray">
                    Leverage advanced AI to create compelling, keyword-optimized resume content
                    that passes ATS filters.
                  </p>
                </div>
              </div>

              <div className="card bg-gradient-to-br from-[#1a1f3a] to-[#0f1629] shadow-2xl border border-brand-cyan/30 hover:border-brand-cyan/60 hover:shadow-brand-cyan/20 transition-all duration-300 hover:scale-105">
                <div className="card-body items-center text-center">
                  <div className="p-3 bg-brand-cyan/10 rounded-full mb-4">
                    <Target className="w-12 h-12 text-brand-cyan" />
                  </div>
                  <h3 className="card-title text-brand-white">Job-Tailored Content</h3>
                  <p className="text-brand-gray">
                    Paste any job description and get a resume specifically optimized for that
                    position.
                  </p>
                </div>
              </div>

              <div className="card bg-gradient-to-br from-[#1a1f3a] to-[#0f1629] shadow-2xl border border-brand-cyan/30 hover:border-brand-cyan/60 hover:shadow-brand-cyan/20 transition-all duration-300 hover:scale-105">
                <div className="card-body items-center text-center">
                  <div className="p-3 bg-brand-cyan/10 rounded-full mb-4">
                    <CheckCircle className="w-12 h-12 text-brand-cyan" />
                  </div>
                  <h3 className="card-title text-brand-white">ATS Score & Tips</h3>
                  <p className="text-brand-gray">
                    Get instant feedback with an ATS compatibility score and actionable
                    recommendations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-br from-[#0f1629] via-[#1a1f3a] to-[#14213D] relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent"></div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="card bg-gradient-to-br from-[#1a1f3a]/80 to-[#0f1629]/80 backdrop-blur-sm shadow-2xl border border-brand-cyan/40">
              <div className="card-body">
                <h2 className="card-title text-3xl text-brand-white mb-4 justify-center">
                  How It Works
                </h2>
                <div className="space-y-6 text-brand-gray">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-brand-cyan to-brand-cyan/70 rounded-full flex items-center justify-center text-brand-black font-bold shadow-lg shadow-brand-cyan/30">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-brand-white text-lg">
                        Enter Your Information
                      </h3>
                      <p>
                        Fill in your work experience, skills, education, and optionally paste a
                        job description.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-brand-cyan to-brand-cyan/70 rounded-full flex items-center justify-center text-brand-black font-bold shadow-lg shadow-brand-cyan/30">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-brand-white text-lg">
                        AI Generates Your Resume
                      </h3>
                      <p>
                        Our AI analyzes your info and the job requirements to create optimized,
                        ATS-friendly content.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-brand-cyan to-brand-cyan/70 rounded-full flex items-center justify-center text-brand-black font-bold shadow-lg shadow-brand-cyan/30">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-brand-white text-lg">
                        Review & Download PDF
                      </h3>
                      <p>
                        Check your ATS score, make any adjustments, and download a
                        professionally formatted PDF.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-b from-[#14213D]/50 via-[#1a1f3a] to-[#0f1629] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-cyan/10 via-transparent to-transparent"></div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-white mb-6">
              Ready to Land Your Dream Job?
            </h2>
            <p className="text-xl text-brand-gray mb-8">
              Join thousands of job seekers who have successfully passed ATS screening with our
              resume builder.
            </p>
            <Link href="/create" className="btn bg-brand-cyan hover:bg-brand-cyan/90 text-brand-black border-0 font-semibold btn-lg text-lg px-8 shadow-lg shadow-brand-cyan/30 hover:shadow-brand-cyan/50 hover:scale-105 transition-all">
              Create Your Resume Now
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-gradient-to-b from-[#0f1629] to-[#0a0e27] border-t border-brand-cyan/20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-brand-gray">
          <p>&copy; 2025 ResuCraft. Built with AI for job seekers.</p>
        </div>
      </footer>
    </div>
    </>
  );
}
