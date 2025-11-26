'use client';

import Link from 'next/link';
import { FileText, Zap, Target, CheckCircle, BarChart3 } from 'lucide-react';

export default function Home() {
  return (
    <>
    <div className="min-h-screen animated-gradient aurora" data-theme="atsbuilder">
      <header className="glass sticky top-0 z-50 backdrop-blur-xl" style={{ border: 'none', borderBottom: '1px solid rgba(168, 85, 247, 0.3)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-cyan via-brand-purple to-brand-pink flex items-center justify-center shadow-xl glow-purple">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold gradient-text">ResuCraft</span>
            </div>
            <Link href="/create" className="group px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-brand-purple via-brand-pink to-brand-purple-light hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl glow-purple border border-brand-purple-light/20">
              <span className="flex items-center">
                Get Started
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden py-20 sm:py-32">
          {/* Vibrant gradient orbs */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-purple/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-cyan/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-brand-pink/20 rounded-full blur-3xl animate-pulse delay-500"></div>
            <div className="absolute bottom-1/3 left-1/3 w-64 h-64 bg-brand-green/20 rounded-full blur-3xl animate-pulse delay-700"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-brand-purple/20 via-brand-pink/20 to-brand-cyan/20 border border-brand-purple/30 mb-8 backdrop-blur-sm">
                <span className="w-2 h-2 bg-brand-green rounded-full animate-pulse"></span>
                <span className="text-sm font-semibold text-brand-green-light">AI-Powered Resume Builder</span>
              </div>
              
              <h1 className="text-5xl sm:text-7xl font-black text-brand-white mb-6 leading-tight">
                Create <span className="gradient-text">ATS-Friendly</span>
                <br />
                <span className="text-brand-white">Resumes In</span> <span className="gradient-text-purple">Minutes</span>
              </h1>
              
              <p className="text-xl text-brand-gray-text max-w-3xl mx-auto mb-10 leading-relaxed">
                Build professional, ATS-optimized resumes tailored to job descriptions
                using <span className="text-brand-purple-light font-semibold">AI-powered insights</span> and <span className="text-brand-cyan-light font-semibold">expert formatting</span>.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-5 justify-center">
                <Link
                  href="/create"
                  className="group px-10 py-5 rounded-2xl font-bold text-lg text-white bg-gradient-to-r from-brand-cyan via-brand-purple to-brand-pink hover:scale-105 transition-all duration-300 shadow-2xl glow-purple border border-brand-purple/20"
                >
                  <span className="flex items-center justify-center">
                    <span className="mr-3 text-2xl">🚀</span>
                    Start Building Free
                    <span className="ml-3 group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                </Link>
                <Link
                  href="/review"
                  className="group px-10 py-5 rounded-2xl font-bold text-lg text-white border-2 border-brand-green/50 hover:border-brand-green hover:bg-brand-green/10 transition-all duration-300 flex items-center justify-center backdrop-blur-sm hover:scale-105 glow-green"
                >
                  <BarChart3 className="w-6 h-6 mr-3 text-brand-green-light" />
                  AI Review Resume
                </Link>
              </div>
              
              <div className="mt-8 flex items-center justify-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">✓</span>
                  <span className="text-brand-gray-text">100% Free</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">✓</span>
                  <span className="text-brand-gray-text">No Sign-up Required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">✓</span>
                  <span className="text-brand-gray-text">AI-Powered</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-24 relative">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-purple to-transparent"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-black text-brand-white mb-4">
                Why Choose <span className="gradient-text">ResuCraft</span>?
              </h2>
              <p className="text-lg text-brand-gray-text max-w-2xl mx-auto">
                Powered by cutting-edge AI and industry-proven ATS optimization techniques
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="group relative p-8 rounded-3xl bg-gradient-to-br from-brand-dark-card/50 to-brand-dark-bg border-2 border-brand-purple/30 hover:border-brand-purple/60 shadow-xl hover:shadow-2xl glow-purple transition-all duration-500 hover:scale-105 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-brand-purple to-brand-pink rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-brand-white mb-3 group-hover:text-brand-purple-light transition-colors">
                    AI-Powered Generation
                  </h3>
                  <p className="text-brand-gray-text leading-relaxed">
                    Leverage advanced AI to create compelling, keyword-optimized resume content
                    that passes ATS filters.
                  </p>
                </div>
              </div>

              <div className="group relative p-8 rounded-3xl bg-gradient-to-br from-brand-dark-card/50 to-brand-dark-bg border-2 border-brand-cyan/30 hover:border-brand-cyan/60 shadow-xl hover:shadow-2xl glow-cyan transition-all duration-500 hover:scale-105 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-cyan/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-brand-cyan to-brand-cyan-dark rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-brand-white mb-3 group-hover:text-brand-cyan-light transition-colors">
                    Job-Tailored Content
                  </h3>
                  <p className="text-brand-gray-text leading-relaxed">
                    Paste any job description and get a resume specifically optimized for that
                    position.
                  </p>
                </div>
              </div>

              <div className="group relative p-8 rounded-3xl bg-gradient-to-br from-brand-dark-card/50 to-brand-dark-bg border-2 border-brand-green/30 hover:border-brand-green/60 shadow-xl hover:shadow-2xl glow-green transition-all duration-500 hover:scale-105 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-green/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-brand-green to-brand-green-dark rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-brand-white mb-3 group-hover:text-brand-green-light transition-colors">
                    ATS Score & Tips
                  </h3>
                  <p className="text-brand-gray-text leading-relaxed">
                    Get instant feedback with an ATS compatibility score and actionable
                    recommendations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 relative">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="relative p-12 rounded-4xl glass border-2 neon-border shadow-2xl backdrop-blur-xl overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-pink/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-cyan/10 rounded-full blur-3xl"></div>
              
              <div className="relative">
                <h2 className="text-4xl sm:text-5xl font-black text-center mb-12">
                  <span className="gradient-text">How It Works</span>
                </h2>
                
                <div className="space-y-8">
                  <div className="flex items-start space-x-6 group">
                    <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-brand-purple to-brand-pink rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-xl group-hover:scale-110 transition-transform glow-purple">
                      1
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-brand-white text-xl mb-2 group-hover:text-brand-purple-light transition-colors">
                        ⚡ Enter Your Information
                      </h3>
                      <p className="text-brand-gray-text text-lg leading-relaxed">
                        Fill in your work experience, skills, education, and optionally paste a
                        job description for AI-powered tailoring.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-6 group">
                    <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-brand-cyan to-brand-cyan-dark rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-xl group-hover:scale-110 transition-transform glow-cyan">
                      2
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-brand-white text-xl mb-2 group-hover:text-brand-cyan-light transition-colors">
                        🤖 AI Generates Your Resume
                      </h3>
                      <p className="text-brand-gray-text text-lg leading-relaxed">
                        Our advanced AI analyzes your information and job requirements to create
                        perfectly optimized, ATS-friendly content.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-6 group">
                    <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-brand-green to-brand-green-dark rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-xl group-hover:scale-110 transition-transform glow-green">
                      3
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-brand-white text-xl mb-2 group-hover:text-brand-green-light transition-colors">
                        📥 Review & Download PDF
                      </h3>
                      <p className="text-brand-gray-text text-lg leading-relaxed">
                        Check your ATS score, make any adjustments, and download a
                        professionally formatted PDF ready to submit.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 relative">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-purple/15 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-pink/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-4xl sm:text-6xl font-black text-brand-white mb-6 leading-tight">
              Ready to Land Your<br />
              <span className="gradient-text">Dream Job?</span>
            </h2>
            <p className="text-xl text-brand-gray-text mb-10 max-w-2xl mx-auto leading-relaxed">
              Join thousands of job seekers who have successfully passed ATS screening with our
              AI-powered resume builder.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              <Link href="/create" className="group px-12 py-6 rounded-2xl font-black text-xl text-white bg-gradient-to-r from-brand-purple via-brand-pink to-brand-purple-light hover:scale-110 transition-all duration-300 shadow-2xl glow-pink border border-brand-pink/20">
                <span className="flex items-center">
                  Create Your Resume Now
                  <span className="ml-3 text-2xl group-hover:translate-x-2 transition-transform">🚀</span>
                </span>
              </Link>
              
              <div className="text-brand-gray-text text-sm">
                <span className="block font-semibold">✨ 100% Free • No Credit Card</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative border-t border-brand-purple/20 py-12 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark-bg to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-cyan via-brand-purple to-brand-pink flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">ResuCraft</span>
          </div>
          <p className="text-brand-gray-text mb-2">
            &copy; 2025 ResuCraft. Built with <span className="text-brand-pink">❤️</span> and <span className="gradient-text-purple font-semibold">AI</span> for job seekers.
          </p>
          <p className="text-sm text-brand-gray-dark">
            Empowering careers, one resume at a time.
          </p>
        </div>
      </footer>
    </div>
    </>
  );
}
