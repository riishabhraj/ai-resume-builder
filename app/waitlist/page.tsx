'use client';

import { FileText } from 'lucide-react';
import WaitlistForm from '@/components/WaitlistForm';

export default function WaitlistPage() {
  return (
    <div className="min-h-screen animated-gradient aurora" data-theme="atsbuilder">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-brand-dark-bg/75 border-b border-brand-purple/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-cyan via-brand-purple to-brand-pink flex items-center justify-center shadow-xl glow-purple">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold gradient-text">ResuCraft</span>
            </div>
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
          </div>
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-brand-purple/20 via-brand-pink/20 to-brand-cyan/20 border border-brand-purple/30 mb-8 backdrop-blur-sm">
                <span className="w-2 h-2 bg-brand-green rounded-full animate-pulse"></span>
                <span className="text-sm font-semibold text-brand-green-light">Join the Waitlist</span>
              </div>
              
              <h1 className="text-5xl sm:text-7xl font-black text-brand-white mb-6 leading-tight">
                Ready to Land Your<br />
                <span className="gradient-text">Dream Job?</span>
              </h1>
              
              <p className="text-xl text-brand-gray-text max-w-2xl mx-auto mb-10 leading-relaxed">
                Be among the first to experience ResuCraft - the AI-powered resume builder that helps you create ATS-friendly resumes tailored to your dream job.
              </p>
              
              {/* Waitlist Form */}
              <div className="mb-8">
                <WaitlistForm />
              </div>
              
              <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-brand-gray-text">
                <div className="flex items-center space-x-2">
                  <span className="text-brand-green text-xl">✓</span>
                  <span>Early Access</span>
                </div>
                <span className="text-brand-gray-dark">•</span>
                <div className="flex items-center space-x-2">
                  <span className="text-brand-green text-xl">✓</span>
                  <span>100% Free</span>
                </div>
                <span className="text-brand-gray-dark">•</span>
                <div className="flex items-center space-x-2">
                  <span className="text-brand-green text-xl">✓</span>
                  <span>AI-Powered</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-24 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-black text-brand-white mb-4">
                Why Join the <span className="gradient-text">Waitlist</span>?
              </h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="group relative p-8 rounded-3xl bg-gradient-to-br from-brand-dark-card/50 to-brand-dark-bg border-2 border-brand-purple/30 hover:border-brand-purple/60 shadow-xl hover:shadow-2xl glow-purple transition-all duration-500 hover:scale-105 backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-4xl mb-4">🎯</div>
                  <h3 className="text-2xl font-bold text-brand-white mb-3">
                    Early Access
                  </h3>
                  <p className="text-brand-gray-text leading-relaxed">
                    Be among the first to use ResuCraft and get priority support
                  </p>
                </div>
              </div>

              <div className="group relative p-8 rounded-3xl bg-gradient-to-br from-brand-dark-card/50 to-brand-dark-bg border-2 border-brand-cyan/30 hover:border-brand-cyan/60 shadow-xl hover:shadow-2xl glow-cyan transition-all duration-500 hover:scale-105 backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-4xl mb-4">🚀</div>
                  <h3 className="text-2xl font-bold text-brand-white mb-3">
                    Launch Notification
                  </h3>
                  <p className="text-brand-gray-text leading-relaxed">
                    Get notified the moment we launch so you can start building your resume
                  </p>
                </div>
              </div>

              <div className="group relative p-8 rounded-3xl bg-gradient-to-br from-brand-dark-card/50 to-brand-dark-bg border-2 border-brand-green/30 hover:border-brand-green/60 shadow-xl hover:shadow-2xl glow-green transition-all duration-500 hover:scale-105 backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-4xl mb-4">✨</div>
                  <h3 className="text-2xl font-bold text-brand-white mb-3">
                    Exclusive Benefits
                  </h3>
                  <p className="text-brand-gray-text leading-relaxed">
                    Special perks and features reserved for early waitlist members
                  </p>
                </div>
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
        </div>
      </footer>
    </div>
  );
}

