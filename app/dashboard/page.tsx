'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, Plus, Loader2, Download, Eye, Edit2, Trash2, BarChart3, LogOut, User, Menu, X, TrendingUp, Award, Target, Clock, ArrowRight, Sparkles, Brain } from 'lucide-react';
import type { ResumeVersion } from '@/lib/types';
import { shouldRedirectToWaitlist } from '@/lib/waitlist-check';
import { useAuthStore } from '@/stores/authStore';
import HiringZoneChart from '@/components/HiringZoneChart';
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeleton';
import ResumeViewModal from '@/components/ResumeViewModal';

export default function Dashboard() {
  const router = useRouter();
  const [resumes, setResumes] = useState<ResumeVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [viewModalResumeId, setViewModalResumeId] = useState<string | null>(null);
  const { user, signOut, initialized, initialize } = useAuthStore();

  // Initialize auth and check waitlist
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

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (initialized && !user) {
      router.push('/sign-in?redirect=/dashboard');
    }
  }, [initialized, user, router]);

  useEffect(() => {
    if (initialized && user) {
      loadResumes();
    }
  }, [initialized, user]);

  async function loadResumes() {
    if (!user) return;
    
    try {
      const response = await fetch('/api/resume/list');
      if (!response.ok) throw new Error('Failed to load resumes');

      const data = await response.json();
      if (data.success) {
        setResumes(data.resumes || []);
      }
    } catch (error) {
      console.error('Error loading resumes:', error);
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const validScores = resumes
      .map((r) => r.ats_score)
      .filter((score): score is number => score !== null && score !== undefined);
    
    const totalResumes = resumes.length;
    const averageScore = validScores.length > 0
      ? Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length)
      : 0;
    const highestScore = validScores.length > 0 ? Math.max(...validScores) : 0;
    const inHiringZone = validScores.filter((score) => score >= 90).length;
    const recentResumes = resumes
      .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())
      .slice(0, 5);
    const bestResume = validScores.length > 0 
      ? resumes.find((r) => r.ats_score === highestScore && r.ats_score !== null)
      : undefined;
    const needsAttention = resumes.filter((r) => r.ats_score !== null && r.ats_score < 60);

    return {
      totalResumes,
      averageScore,
      highestScore,
      inHiringZone,
      recentResumes,
      bestResume,
      needsAttention,
    };
  }, [resumes]);

  const handleDelete = async (resumeId: string) => {
    // Prevent duplicate delete requests
    if (deletingId === resumeId) {
      return; // Already deleting this resume
    }

    if (!confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
      return;
    }

    setDeletingId(resumeId);
    try {
      const response = await fetch(`/api/resume/${resumeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        // If 404, the resume might have already been deleted (e.g., by another tab/device)
        // In this case, just remove it from local state
        if (response.status === 404) {
          console.log('Resume not found (may have been already deleted), removing from list');
          setResumes(resumes.filter((r) => r.id !== resumeId));
          return;
        }
        throw new Error('Failed to delete resume');
      }

      // Remove from local state
      setResumes(resumes.filter((r) => r.id !== resumeId));
    } catch (error) {
      console.error('Error deleting resume:', error);
      alert('Failed to delete resume. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showUserMenu && !target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  if (!initialized || loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen animated-gradient aurora" data-theme="atsbuilder">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-brand-dark-bg/75 border-b border-brand-purple/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3 sm:space-x-6">
              <Link href="/" className="flex items-center space-x-2 group hover:opacity-90 transition-opacity">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-cyan via-brand-purple to-brand-pink flex items-center justify-center shadow-xl glow-purple">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg sm:text-xl font-bold gradient-text">ResuCraft</span>
              </Link>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-1">
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-brand-white bg-brand-purple/20 hover:bg-brand-purple/30 transition-all duration-300"
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
                  className="px-4 py-2 rounded-lg text-sm font-medium text-brand-gray-text hover:text-brand-white hover:bg-brand-navy/50 transition-all duration-300"
                >
                  AI Analysis
                </Link>
              </nav>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 rounded-lg text-brand-white hover:bg-brand-navy/50 transition-colors"
                aria-label="Toggle menu"
                aria-expanded={showMobileMenu}
              >
                {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link
                href="/create"
                className="hidden md:flex group px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-brand-purple via-brand-pink to-brand-purple-light hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl glow-purple"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Resume
              </Link>
              
              {/* Mobile Create Button */}
              <Link
                href="/create"
                className="md:hidden p-2 rounded-lg text-brand-white bg-gradient-to-r from-brand-purple via-brand-pink to-brand-purple-light hover:scale-105 transition-all duration-300 shadow-lg glow-purple"
                aria-label="Create Resume"
              >
                <Plus className="w-5 h-5" />
              </Link>

              {/* User Menu */}
              {user && (
                <div className="relative user-menu-container">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-brand-navy/50 hover:bg-brand-navy/70 border border-brand-purple/30 transition-all duration-300"
                  >
                    {user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
                      <img
                        src={user.user_metadata?.avatar_url || user.user_metadata?.picture}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover border-2 border-brand-purple/30"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-cyan to-brand-purple flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <span className="hidden sm:block text-brand-white text-sm font-medium">
                      {user.user_metadata?.full_name || 
                       user.user_metadata?.name || 
                       user.email?.split('@')[0]?.split('.').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 
                       'User'}
                    </span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-gray-800/95 backdrop-blur-xl rounded-xl shadow-xl border border-gray-700/50 z-50">
                      <div className="py-2">
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-gray-700/50">
                          <p className="font-semibold text-white text-sm mb-1">
                            {user.user_metadata?.full_name || 
                             user.user_metadata?.name || 
                             user.email?.split('@')[0]?.split('.').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 
                             'User'}
                          </p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                        
                        {/* Upgrade to Pro */}
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            router.push('/pricing');
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-brand-pink hover:bg-gray-700/50 transition-colors flex items-center space-x-2"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>Upgrade to Pro</span>
                        </button>
                        
                        <div className="border-t border-gray-700/50 my-1"></div>
                        
                        {/* Sign Out */}
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors flex items-center space-x-2"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          {showMobileMenu && (
            <div className="md:hidden mt-4 pb-4 border-t border-brand-purple/30 pt-4">
              <nav className="flex flex-col space-y-2">
                <Link
                  href="/dashboard"
                  onClick={() => setShowMobileMenu(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-brand-white bg-brand-purple/20"
                >
                  Dashboard
                </Link>
                <Link
                  href="/resumes"
                  onClick={() => setShowMobileMenu(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-brand-gray-text hover:text-brand-white hover:bg-brand-navy/50"
                >
                  Resumes
                </Link>
                <Link
                  href="/review"
                  onClick={() => setShowMobileMenu(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-brand-gray-text hover:text-brand-white hover:bg-brand-navy/50"
                >
                  AI Analysis
                </Link>
                <Link
                  href="/create"
                  onClick={() => setShowMobileMenu(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-brand-purple via-brand-pink to-brand-purple-light"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  New Resume
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-brand-white mb-2 gradient-text">Dashboard</h1>
          <p className="text-brand-gray-text text-base sm:text-lg">
            Track your resume performance and optimize for ATS systems.
          </p>
        </div>

        {resumes.length === 0 ? (
          <div className="card bg-brand-navy/80 backdrop-blur-xl shadow-2xl border border-brand-purple/30">
            <div className="card-body items-center text-center py-16">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-cyan via-brand-purple to-brand-pink flex items-center justify-center shadow-xl glow-purple mb-6">
                <FileText className="w-10 h-10 text-white" />
              </div>
              <h2 className="card-title text-brand-white text-3xl mb-3 gradient-text">
                No resumes yet
              </h2>
              <p className="text-brand-gray-text text-lg mb-8 max-w-md">
                Create your first ATS-optimized resume to get started.
              </p>
              <Link 
                href="/create" 
                className="group px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-brand-purple via-brand-pink to-brand-purple-light hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl glow-purple border border-brand-purple-light/20"
              >
                <Plus className="w-5 h-5 inline mr-2" />
                Create Your First Resume
                <span className="ml-2 group-hover:translate-x-1 transition-transform inline-block">→</span>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="card bg-brand-navy/80 backdrop-blur-xl shadow-xl border border-brand-purple/30">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-brand-gray-text text-sm mb-1">Total Resumes</p>
                      <p className="text-3xl font-bold text-brand-white">{stats.totalResumes}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-brand-purple/20 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-brand-purple-light" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="card bg-brand-navy/80 backdrop-blur-xl shadow-xl border border-brand-purple/30">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-brand-gray-text text-sm mb-1">Average ATS Score</p>
                      <p className="text-3xl font-bold text-brand-white">{stats.averageScore}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-brand-cyan/20 flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-brand-cyan" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="card bg-brand-navy/80 backdrop-blur-xl shadow-xl border border-brand-purple/30">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-brand-gray-text text-sm mb-1">Highest Score</p>
                      <p className="text-3xl font-bold text-brand-white">{stats.highestScore || 'N/A'}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-brand-green/20 flex items-center justify-center">
                      <Award className="w-6 h-6 text-brand-green" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="card bg-brand-navy/80 backdrop-blur-xl shadow-xl border border-brand-purple/30">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-brand-gray-text text-sm mb-1">In Hiring Zone</p>
                      <p className="text-3xl font-bold text-brand-white">{stats.inHiringZone}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-brand-green/20 flex items-center justify-center">
                      <Target className="w-6 h-6 text-brand-green" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-3 mb-6 sm:mb-8">
              {/* Hiring Zone Chart */}
              <div className="lg:col-span-1 card bg-brand-navy/80 backdrop-blur-xl shadow-xl border border-brand-purple/30">
                <div className="card-body">
                  <h2 className="card-title text-brand-white text-xl mb-4 gradient-text">
                    Hiring Zone
                  </h2>
                  <div className="flex justify-center">
                    <HiringZoneChart score={stats.averageScore || 0} size={220} />
                  </div>
                  <p className="text-center text-brand-gray-text text-sm mt-4">
                    Your average ATS score across all resumes
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="lg:col-span-1 card bg-brand-navy/80 backdrop-blur-xl shadow-xl border border-brand-purple/30">
                <div className="card-body">
                  <h2 className="card-title text-brand-white text-xl mb-4 gradient-text">
                    Quick Actions
                  </h2>
                  <div className="space-y-3">
                    <Link
                      href="/create"
                      className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-brand-purple via-brand-pink to-brand-purple-light hover:scale-105 transition-all duration-300 shadow-lg border border-brand-purple-light/20 group"
                    >
                      <div className="flex items-center space-x-3">
                        <Plus className="w-5 h-5 text-white" />
                        <span className="font-bold text-white">Create New Resume</span>
                      </div>
                      <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                      href="/review"
                      className="flex items-center justify-between p-4 rounded-xl bg-brand-navy/50 hover:bg-brand-navy/70 border border-brand-purple/30 transition-all duration-300 group"
                    >
                      <div className="flex items-center space-x-3">
                        <Sparkles className="w-5 h-5 text-brand-cyan" />
                        <span className="font-medium text-brand-white">AI Resume Analysis</span>
                      </div>
                      <ArrowRight className="w-5 h-5 text-brand-gray-text group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                      href="/resumes"
                      className="flex items-center justify-between p-4 rounded-xl bg-brand-navy/50 hover:bg-brand-navy/70 border border-brand-purple/30 transition-all duration-300 group"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-brand-cyan" />
                        <span className="font-medium text-brand-white">View All Resumes</span>
                      </div>
                      <ArrowRight className="w-5 h-5 text-brand-gray-text group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Performance Insights */}
              <div className="lg:col-span-1 card bg-brand-navy/80 backdrop-blur-xl shadow-xl border border-brand-purple/30">
                <div className="card-body">
                  <h2 className="card-title text-brand-white text-xl mb-4 gradient-text">
                    Performance Insights
                  </h2>
                  <div className="space-y-4">
                    {stats.bestResume && (
                      <div className="p-3 rounded-lg bg-brand-green/10 border border-brand-green/30">
                        <div className="flex items-center space-x-2 mb-2">
                          <Award className="w-4 h-4 text-brand-green" />
                          <span className="text-sm font-semibold text-brand-green">Best Performing</span>
                        </div>
                        <p className="text-brand-white font-medium text-sm">{stats.bestResume.title}</p>
                        <p className="text-brand-gray-text text-xs mt-1">Score: {stats.bestResume.ats_score}/100</p>
                        <Link
                          href={`/create?id=${stats.bestResume.id}`}
                          className="text-brand-cyan text-xs hover:underline mt-2 inline-block"
                        >
                          View Details →
                        </Link>
                      </div>
                    )}
                    {stats.needsAttention.length > 0 && (
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                        <div className="flex items-center space-x-2 mb-2">
                          <Target className="w-4 h-4 text-red-400" />
                          <span className="text-sm font-semibold text-red-400">Needs Attention</span>
                        </div>
                        <p className="text-brand-white font-medium text-sm">
                          {stats.needsAttention.length} resume{stats.needsAttention.length > 1 ? 's' : ''} below 60
                        </p>
                        <p className="text-brand-gray-text text-xs mt-1">
                          Consider optimizing these resumes
                        </p>
                      </div>
                    )}
                    {stats.inHiringZone > 0 && (
                      <div className="p-3 rounded-lg bg-brand-green/10 border border-brand-green/30">
                        <div className="flex items-center space-x-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-brand-green" />
                          <span className="text-sm font-semibold text-brand-green">Great Progress!</span>
                        </div>
                        <p className="text-brand-white font-medium text-sm">
                          {stats.inHiringZone} resume{stats.inHiringZone > 1 ? 's' : ''} in hiring zone
                        </p>
                        <p className="text-brand-gray-text text-xs mt-1">
                          These resumes are ATS-optimized
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card bg-brand-navy/80 backdrop-blur-xl shadow-xl border border-brand-purple/30 mb-8">
              <div className="card-body">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="card-title text-brand-white text-xl gradient-text">
                    Recent Activity
                  </h2>
                  <Link
                    href="/resumes"
                    className="text-brand-cyan text-sm hover:underline flex items-center space-x-1"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {stats.recentResumes.map((resume) => (
                    <div
                      key={resume.id}
                      className="p-4 rounded-lg bg-brand-black/50 border border-brand-purple/20 hover:border-brand-cyan/50 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-brand-white font-semibold text-sm flex-1">{resume.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          resume.ats_score === null || resume.ats_score === undefined
                            ? 'bg-brand-navy/50 text-brand-gray-text border border-brand-purple/30'
                            : resume.ats_score >= 80
                            ? 'bg-brand-green/20 text-brand-green border border-brand-green/50'
                            : resume.ats_score >= 60
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                            : 'bg-red-500/20 text-red-400 border border-red-500/50'
                        }`}>
                          {resume.ats_score || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-brand-gray-text mb-3">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(resume.updated_at || resume.created_at)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/create?id=${resume.id}`}
                          className="text-xs text-brand-cyan hover:underline flex items-center space-x-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </Link>
                        {resume.status === 'compiled' && resume.pdf_url ? (
                          <button
                            onClick={() => setViewModalResumeId(resume.id)}
                            className="text-xs text-brand-cyan hover:underline flex items-center space-x-1"
                            title="View PDF"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View</span>
                          </button>
                        ) : null}
                        <Link
                          href={`/review?resumeId=${resume.id}`}
                          className="text-xs text-brand-purple hover:underline flex items-center space-x-1"
                        >
                          <Brain className="w-3 h-3" />
                          <span>Review</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        <div className="mt-12 card bg-brand-navy/80 backdrop-blur-xl shadow-2xl border border-brand-purple/30">
          <div className="card-body">
            <h2 className="card-title text-brand-white text-2xl mb-4 gradient-text">Quick Tips</h2>
            <ul className="space-y-3 text-brand-gray-text">
              <li className="flex items-start">
                <span className="text-brand-cyan mr-3 text-lg">•</span>
                <span className="text-base">
                  Higher ATS scores mean better chances of passing automated screening
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-cyan mr-3 text-lg">•</span>
                <span className="text-base">
                  Always tailor your resume by including the job description when creating it
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-cyan mr-3 text-lg">•</span>
                <span className="text-base">
                  Use quantifiable metrics and action verbs to improve your score
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-cyan mr-3 text-lg">•</span>
                <span className="text-base">
                  Create multiple versions to compare different approaches
                </span>
              </li>
            </ul>
          </div>
        </div>
      </main>

      {/* Resume View Modal */}
      {viewModalResumeId && (
        <ResumeViewModal
          isOpen={!!viewModalResumeId}
          onClose={() => setViewModalResumeId(null)}
          resumeId={viewModalResumeId}
        />
      )}
    </div>
  );
}
