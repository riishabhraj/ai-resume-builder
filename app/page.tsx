'use client';

import Link from 'next/link';
import Image from 'next/image';
import Marquee from 'react-fast-marquee';
import { FileText, Zap, Target, CheckCircle, BarChart3, Check, X, Sparkles, Crown, Rocket, Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import WaitlistForm from '@/components/WaitlistForm';
import { shouldRedirectToWaitlist } from '@/lib/waitlist-check';
import { useAuthStore } from '@/stores/authStore';

export default function Home() {
  const router = useRouter();
  const { user, initialized, initialize } = useAuthStore();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // Initialize auth
  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);
  
  // Check if we should redirect to waitlist
  useEffect(() => {
    if (shouldRedirectToWaitlist()) {
      router.push('/waitlist');
    }
  }, [router]);
  
  return (
    <>
    <div className="min-h-screen animated-gradient aurora" data-theme="atsbuilder" suppressHydrationWarning>
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-brand-dark-bg/75 border-b border-brand-purple/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4 sm:space-x-8">
              <div className="flex items-center space-x-2 group cursor-pointer">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-cyan via-brand-purple to-brand-pink flex items-center justify-center shadow-xl glow-purple">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg sm:text-xl font-bold gradient-text">ResuCraft</span>
              </div>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-6">
                <a href="#features" className="text-sm font-medium text-brand-gray-text hover:text-brand-white transition-colors">
                  Features
                </a>
                <a href="#pricing" className="text-sm font-medium text-brand-gray-text hover:text-brand-white transition-colors">
                  Pricing
                </a>
              </nav>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 rounded-lg text-brand-white hover:bg-brand-navy/50 transition-colors"
                aria-label="Toggle menu"
                aria-expanded={showMobileMenu}
              >
                {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              
              <Link
                href={user ? "/dashboard" : "/sign-in?redirect=/dashboard"}
                className="group px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-brand-purple via-brand-pink to-brand-purple-light hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl glow-purple"
              >
                <span className="flex items-center">
                  <span className="hidden sm:inline">{user ? "Dashboard" : "Get Started"}</span>
                  <span className="sm:hidden">{user ? "Dashboard" : "Start"}</span>
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </Link>
            </div>
          </div>
          
          {/* Mobile Navigation Menu */}
          {showMobileMenu && (
            <div className="md:hidden mt-4 pb-4 border-t border-brand-purple/30 pt-4">
              <nav className="flex flex-col space-y-3">
                <a 
                  href="#features" 
                  onClick={() => setShowMobileMenu(false)}
                  className="text-sm font-medium text-brand-gray-text hover:text-brand-white transition-colors py-2"
                >
                  Features
                </a>
                <a 
                  href="#pricing" 
                  onClick={() => setShowMobileMenu(false)}
                  className="text-sm font-medium text-brand-gray-text hover:text-brand-white transition-colors py-2"
                >
                  Pricing
                </a>
              </nav>
            </div>
          )}
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden py-12 sm:py-20 md:py-32">
          {/* Vibrant gradient orbs */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-purple/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-cyan/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-brand-pink/20 rounded-full blur-3xl animate-pulse delay-500"></div>
            <div className="absolute bottom-1/3 left-1/3 w-64 h-64 bg-brand-green/20 rounded-full blur-3xl animate-pulse delay-700"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-brand-purple/20 via-brand-pink/20 to-brand-cyan/20 border border-brand-purple/30 mb-6 sm:mb-8 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-brand-green rounded-full animate-pulse"></span>
                <span className="text-xs sm:text-sm font-semibold text-brand-green-light">AI-Powered Resume Builder</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-brand-white mb-4 sm:mb-6 leading-tight px-4">
                Create <span className="gradient-text">ATS-Friendly</span>
                <br />
                <span className="text-brand-white">Resumes In</span> <span className="gradient-text-purple">Minutes</span>
              </h1>
              
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-brand-gray-text max-w-3xl mx-auto mb-8 sm:mb-10 leading-relaxed px-4">
                Build professional, ATS-optimized resumes tailored to job descriptions
                using <span className="text-brand-purple-light font-semibold">AI-powered insights</span> and <span className="text-brand-cyan-light font-semibold">expert formatting</span>.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center px-4">
              <Link
                href={user ? "/create" : "/sign-in?redirect=/create"}
                className="group px-6 sm:px-10 py-4 sm:py-5 rounded-2xl font-bold text-base sm:text-lg text-white bg-gradient-to-r from-brand-cyan via-brand-purple to-brand-pink hover:scale-105 transition-all duration-300 shadow-2xl glow-purple border border-brand-purple/20"
              >
                  <span className="flex items-center justify-center">
                    <span className="mr-2 sm:mr-3 text-xl sm:text-2xl">🚀</span>
                    <span className="hidden sm:inline">{user ? "Create New Resume" : "Start Building Free"}</span>
                    <span className="sm:hidden">{user ? "Create" : "Start Free"}</span>
                    <span className="ml-2 sm:ml-3 group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                </Link>
                <Link
                  href="/review"
                  className="group px-6 sm:px-10 py-4 sm:py-5 rounded-2xl font-bold text-base sm:text-lg text-white border-2 border-brand-green/50 hover:border-brand-green hover:bg-brand-green/10 transition-all duration-300 flex items-center justify-center backdrop-blur-sm hover:scale-105 glow-green"
                >
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-brand-green-light" />
                  <span className="hidden sm:inline">AI Review Resume</span>
                  <span className="sm:hidden">Review</span>
                </Link>
              </div>
              
              <div className="mt-4 sm:mt-6 md:mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm px-4">
                <div className="flex items-center space-x-1.5 sm:space-x-2">
                  <span className="text-lg sm:text-xl md:text-2xl">✓</span>
                  <span className="text-brand-gray-text">100% Free</span>
                </div>
                <div className="flex items-center space-x-1.5 sm:space-x-2">
                  <span className="text-lg sm:text-xl md:text-2xl">✓</span>
                  <span className="text-brand-gray-text">No Sign-up Required</span>
                </div>
                <div className="flex items-center space-x-1.5 sm:space-x-2">
                  <span className="text-lg sm:text-xl md:text-2xl">✓</span>
                  <span className="text-brand-gray-text">AI-Powered</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-12 sm:py-16 md:py-24 relative">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-purple to-transparent"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-8 sm:mb-12 md:mb-16 px-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-brand-white mb-3 sm:mb-4">
                Why Choose <span className="gradient-text">ResuCraft</span>?
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-brand-gray-text max-w-2xl mx-auto">
                Powered by cutting-edge AI and industry-proven ATS optimization techniques
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 px-4">
              <div className="group relative p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-brand-dark-card/50 to-brand-dark-bg border-2 border-brand-purple/30 hover:border-brand-purple/60 shadow-xl hover:shadow-2xl glow-purple transition-all duration-500 hover:scale-105 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/5 to-transparent rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-brand-purple to-brand-pink rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform shadow-lg">
                    <Zap className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-brand-white mb-2 sm:mb-3 group-hover:text-brand-purple-light transition-colors">
                    AI-Powered Generation
                  </h3>
                  <p className="text-sm sm:text-base text-brand-gray-text leading-relaxed">
                    Leverage advanced AI to create compelling, keyword-optimized resume content
                    that passes ATS filters.
                  </p>
                </div>
              </div>

              <div className="group relative p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-brand-dark-card/50 to-brand-dark-bg border-2 border-brand-cyan/30 hover:border-brand-cyan/60 shadow-xl hover:shadow-2xl glow-cyan transition-all duration-500 hover:scale-105 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-cyan/5 to-transparent rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-brand-cyan to-brand-cyan-dark rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform shadow-lg">
                    <Target className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-brand-white mb-2 sm:mb-3 group-hover:text-brand-cyan-light transition-colors">
                    Job-Tailored Content
                  </h3>
                  <p className="text-sm sm:text-base text-brand-gray-text leading-relaxed">
                    Paste any job description and get a resume specifically optimized for that
                    position.
                  </p>
                </div>
              </div>

              <div className="group relative p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-brand-dark-card/50 to-brand-dark-bg border-2 border-brand-green/30 hover:border-brand-green/60 shadow-xl hover:shadow-2xl glow-green transition-all duration-500 hover:scale-105 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-green/5 to-transparent rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-brand-green to-brand-green-dark rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform shadow-lg">
                    <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-brand-white mb-2 sm:mb-3 group-hover:text-brand-green-light transition-colors">
                    ATS Score & Tips
                  </h3>
                  <p className="text-sm sm:text-base text-brand-gray-text leading-relaxed">
                    Get instant feedback with an ATS compatibility score and actionable
                    recommendations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Companies Section with Scrolling Logos */}
        <section className="py-20 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12 px-4">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-brand-white mb-4 leading-tight">
                Get Hired at <span className="gradient-text">Top Companies</span>
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-brand-gray-text max-w-2xl mx-auto mt-4">
                Create resumes optimized for roles at leading organizations
              </p>
            </div>

            {/* Scrolling Company Logos */}
            <div className="relative py-8">
              <div className="marquee-fade-container">
                <Marquee
                  speed={50}
                  gradient={false}
                  pauseOnHover={true}
                >
                {[
                  { name: 'Adobe', file: 'adobe.png' },
                  { name: 'Amazon', file: 'amazon.png' },
                  { name: 'Apple', file: 'apple.png' },
                  { name: 'Datadog', file: 'datadog.png' },
                  { name: 'Google', file: 'google.webp' },
                  { name: 'Intuit', file: 'intuit.png' },
                  { name: 'LinkedIn', file: 'linkedin.png' },
                  { name: 'Meta', file: 'meta.png' },
                  { name: 'Microsoft', file: 'microsoft.png' },
                  { name: 'Netflix', file: 'netflix.png' },
                  { name: 'NVIDIA', file: 'nvidia.png' },
                  { name: 'Oracle', file: 'oracle.png' },
                  { name: 'PayPal', file: 'paypal.png' },
                  { name: 'Spotify', file: 'spotify.png' },
                  { name: 'Stripe', file: 'stripe.png' },
                  { name: 'Tesla', file: 'tesla.png' },
                  { name: 'Uber', file: 'uber.png' }
                ].map((company, idx) => (
                  <div
                    key={idx}
                    className="flex-shrink-0 flex items-center justify-center group mx-10"
                  >
                    <Image
                      src={`/logos/${company.file}`}
                      alt={company.name}
                      width={120}
                      height={120}
                      className="w-24 h-24 sm:w-32 sm:h-32 object-contain opacity-70 group-hover:opacity-100 transition-opacity"
                      unoptimized
                    />
                  </div>
                ))}
                </Marquee>
              </div>
            </div>

            {/* Features Footer */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm sm:text-base text-brand-gray-text">
              <div className="flex items-center space-x-2">
                <span className="text-brand-green text-xl">✓</span>
                <span>ATS-optimized formats</span>
              </div>
              <span className="text-brand-gray-dark hidden sm:inline">•</span>
              <div className="flex items-center space-x-2">
                <span className="text-brand-green text-xl">✓</span>
                <span>Industry-specific templates</span>
              </div>
              <span className="text-brand-gray-dark hidden sm:inline">•</span>
              <div className="flex items-center space-x-2">
                <span className="text-brand-green text-xl">✓</span>
                <span>AI-powered optimization</span>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16 md:py-24 relative">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="relative p-5 sm:p-8 md:p-12 rounded-3xl sm:rounded-4xl glass border-2 neon-border shadow-2xl backdrop-blur-xl overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-pink/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-cyan/10 rounded-full blur-3xl"></div>
              
              <div className="relative">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-center mb-6 sm:mb-8 md:mb-12">
                  <span className="gradient-text">How It Works</span>
                </h2>
                
                <div className="space-y-5 sm:space-y-6 md:space-y-8">
                  <div className="flex items-start space-x-3 sm:space-x-4 md:space-x-6 group">
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-brand-purple to-brand-pink rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-black text-base sm:text-lg md:text-xl shadow-xl group-hover:scale-110 transition-transform glow-purple">
                      1
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-brand-white text-base sm:text-lg md:text-xl mb-1 sm:mb-2 group-hover:text-brand-purple-light transition-colors">
                        ⚡ Enter Your Information
                      </h3>
                      <p className="text-sm sm:text-base md:text-lg text-brand-gray-text leading-relaxed">
                        Fill in your work experience, skills, education, and optionally paste a
                        job description for AI-powered tailoring.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 sm:space-x-4 md:space-x-6 group">
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-brand-cyan to-brand-cyan-dark rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-black text-base sm:text-lg md:text-xl shadow-xl group-hover:scale-110 transition-transform glow-cyan">
                      2
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-brand-white text-base sm:text-lg md:text-xl mb-1 sm:mb-2 group-hover:text-brand-cyan-light transition-colors">
                        🤖 AI Generates Your Resume
                      </h3>
                      <p className="text-sm sm:text-base md:text-lg text-brand-gray-text leading-relaxed">
                        Our advanced AI analyzes your information and job requirements to create
                        perfectly optimized, ATS-friendly content.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 sm:space-x-4 md:space-x-6 group">
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-brand-green to-brand-green-dark rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-black text-base sm:text-lg md:text-xl shadow-xl group-hover:scale-110 transition-transform glow-green">
                      3
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-brand-white text-base sm:text-lg md:text-xl mb-1 sm:mb-2 group-hover:text-brand-green-light transition-colors">
                        📥 Review & Download PDF
                      </h3>
                      <p className="text-sm sm:text-base md:text-lg text-brand-gray-text leading-relaxed">
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

        {/* Pricing Section */}
        <section id="pricing" className="py-12 sm:py-16 md:py-24 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-brand-purple/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-brand-cyan/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-8 sm:mb-12 md:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-brand-white mb-3 sm:mb-4">
                Choose Your <span className="gradient-text">Plan</span>
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-brand-gray-text max-w-2xl mx-auto">
                Start free, upgrade when you need unlimited power
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
              {/* Free Plan */}
              <div className="relative p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-brand-dark-card/50 to-brand-dark-bg border-2 border-brand-purple/30 hover:border-brand-purple/50 shadow-xl hover:shadow-2xl transition-all duration-500 backdrop-blur-sm">
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <Rocket className="w-5 h-5 sm:w-6 sm:h-6 text-brand-purple-light" />
                    <h3 className="text-xl sm:text-2xl font-black text-brand-white">Free</h3>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl sm:text-4xl md:text-5xl font-black text-brand-white">$0</span>
                    <span className="text-sm sm:text-base text-brand-gray-text">/month</span>
                  </div>
                  <p className="text-xs sm:text-sm text-brand-gray-text mt-2">Perfect for trying out</p>
                </div>
                
                <Link
                  href={user ? "/create" : "/sign-in?redirect=/create"}
                  className="block w-full py-3 px-6 rounded-xl text-center font-bold text-white bg-gradient-to-r from-brand-purple to-brand-pink hover:scale-105 transition-all duration-300 shadow-lg mb-6"
                >
                  {user ? "Create Resume" : "Get Started Free"}
                </Link>
                
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-brand-green mt-0.5 flex-shrink-0" />
                    <span className="text-brand-gray-text text-sm">3 resumes per month</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-brand-green mt-0.5 flex-shrink-0" />
                    <span className="text-brand-gray-text text-sm">2 AI reviews per month</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-brand-green mt-0.5 flex-shrink-0" />
                    <span className="text-brand-gray-text text-sm">1 professional template</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-brand-green mt-0.5 flex-shrink-0" />
                    <span className="text-brand-gray-text text-sm">Basic ATS score</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-brand-green mt-0.5 flex-shrink-0" />
                    <span className="text-brand-gray-text text-sm">PDF download</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <X className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-brand-gray-text text-sm line-through opacity-50">AI tailoring</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <X className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-brand-gray-text text-sm line-through opacity-50">Cover letter AI</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <X className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-brand-gray-text text-sm line-through opacity-50">Version history</span>
                  </div>
                </div>
              </div>

              {/* Pro Plan - Most Popular */}
              <div className="relative p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-brand-purple/20 to-brand-pink/20 border-2 border-brand-cyan shadow-2xl hover:shadow-3xl transition-all duration-500 backdrop-blur-sm md:transform md:scale-105 lg:scale-110">
                <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-gradient-to-r from-brand-cyan to-brand-purple text-white text-xs sm:text-sm font-bold shadow-lg">
                  Most Popular
                </div>
                
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-brand-cyan" />
                    <h3 className="text-xl sm:text-2xl font-black text-brand-white">Pro</h3>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl sm:text-4xl md:text-5xl font-black gradient-text">$12</span>
                    <span className="text-sm sm:text-base text-brand-gray-text">/month</span>
                  </div>
                  <p className="text-xs sm:text-sm text-brand-cyan-light mt-2 font-semibold">For active job seekers</p>
                </div>
                
                <Link
                  href="/pricing"
                  className="block w-full py-3 px-6 rounded-xl text-center font-bold text-white bg-gradient-to-r from-brand-cyan via-brand-purple to-brand-pink hover:scale-105 transition-all duration-300 shadow-xl glow-cyan mb-6"
                >
                  Upgrade to Pro
                </Link>
                
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-brand-cyan mt-0.5 flex-shrink-0" />
                    <span className="text-brand-white text-sm font-semibold">Unlimited resumes</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-brand-cyan mt-0.5 flex-shrink-0" />
                    <span className="text-brand-white text-sm font-semibold">Unlimited AI reviews</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-brand-cyan mt-0.5 flex-shrink-0" />
                    <span className="text-brand-white text-sm font-semibold">Complete ATS breakdown</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-brand-cyan mt-0.5 flex-shrink-0" />
                    <span className="text-brand-white text-sm font-semibold">AI resume tailoring</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-brand-cyan mt-0.5 flex-shrink-0" />
                    <span className="text-brand-white text-sm font-semibold">AI bullet enhancement</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-brand-cyan mt-0.5 flex-shrink-0" />
                    <span className="text-brand-white text-sm font-semibold">Cover letter generator</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-brand-cyan mt-0.5 flex-shrink-0" />
                    <span className="text-brand-white text-sm font-semibold">Version history</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-brand-cyan mt-0.5 flex-shrink-0" />
                    <span className="text-brand-white text-sm font-semibold">DOCX & TXT export</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-brand-cyan mt-0.5 flex-shrink-0" />
                    <span className="text-brand-white text-sm font-semibold">Priority support</span>
                  </div>
                </div>
              </div>

              {/* Pro Plus Plan */}
              <div className="relative p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-brand-dark-card/50 to-brand-dark-bg border-2 border-brand-pink/30 hover:border-brand-pink/50 shadow-xl hover:shadow-2xl transition-all duration-500 backdrop-blur-sm">
                <div className="absolute -top-3 sm:-top-4 right-3 sm:right-4 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-gradient-to-r from-brand-purple to-brand-pink text-white text-xs font-bold shadow-lg">
                  Save 33%
                </div>
                
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-brand-pink" />
                    <h3 className="text-xl sm:text-2xl font-black text-brand-white">Pro Plus</h3>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl sm:text-4xl md:text-5xl font-black text-brand-white">$48</span>
                    <span className="text-sm sm:text-base text-brand-gray-text">/6 months</span>
                  </div>
                  <p className="text-xs sm:text-sm text-brand-pink-light mt-2 font-semibold">$8/month • Best value</p>
                </div>
                
                <Link
                  href="/pricing"
                  className="block w-full py-3 px-6 rounded-xl text-center font-bold text-white bg-gradient-to-r from-brand-purple to-brand-pink hover:scale-105 transition-all duration-300 shadow-lg mb-6"
                >
                  Get Pro Plus
                </Link>
                
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-brand-pink mt-0.5 flex-shrink-0" />
                    <span className="text-brand-white text-sm font-semibold">Everything in Pro</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-brand-pink mt-0.5 flex-shrink-0" />
                    <span className="text-brand-gray-text text-sm">Save 33% vs monthly</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-brand-pink mt-0.5 flex-shrink-0" />
                    <span className="text-brand-gray-text text-sm">1 free human review</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-brand-pink mt-0.5 flex-shrink-0" />
                    <span className="text-brand-gray-text text-sm">Priority processing</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-brand-pink mt-0.5 flex-shrink-0" />
                    <span className="text-brand-gray-text text-sm">Early access features</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-brand-pink mt-0.5 flex-shrink-0" />
                    <span className="text-brand-gray-text text-sm">Job tracker (coming soon)</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-brand-pink mt-0.5 flex-shrink-0" />
                    <span className="text-brand-gray-text text-sm">Locked-in pricing</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-brand-pink mt-0.5 flex-shrink-0" />
                    <span className="text-brand-gray-text text-sm">Career resources</span>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ or Trust Badges */}
            <div className="mt-16 text-center">
              <p className="text-brand-gray-text text-sm mb-4">
                All plans include secure payment processing and can be cancelled anytime
              </p>
              <div className="flex items-center justify-center space-x-8 text-xs text-brand-gray-dark">
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-brand-green" />
                  <span>Secure checkout</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-brand-green" />
                  <span>Cancel anytime</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-brand-green" />
                  <span>Instant access</span>
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
              <Link
                href={user ? "/create" : "/sign-in?redirect=/create"}
                className="group px-12 py-6 rounded-2xl font-black text-xl text-white bg-gradient-to-r from-brand-purple via-brand-pink to-brand-purple-light hover:scale-110 transition-all duration-300 shadow-2xl glow-pink border border-brand-pink/20"
              >
                <span className="flex items-center">
                  {user ? "Create New Resume" : "Create Your Resume Now"}
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
