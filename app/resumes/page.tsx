'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, Plus, Loader2, Download, Eye, Edit2, Trash2, LogOut, User, Menu, X, Sparkles } from 'lucide-react';
import type { ResumeVersion } from '@/lib/types';
import { shouldRedirectToWaitlist } from '@/lib/waitlist-check';
import { useAuthStore } from '@/stores/authStore';
import { ResumesPageSkeleton } from '@/components/skeletons/ResumesPageSkeleton';

export default function ResumesPage() {
  const router = useRouter();
  const [resumes, setResumes] = useState<ResumeVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
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
      router.push('/sign-in?redirect=/resumes');
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

  const handleDelete = async (resumeId: string) => {
    if (deletingId === resumeId) {
      return;
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
        if (response.status === 404) {
          console.log('Resume not found (may have been already deleted), removing from list');
          setResumes(prev => prev.filter((r) => r.id !== resumeId));
          return;
        }
        throw new Error('Failed to delete resume');
      }

      setResumes(prev => prev.filter((r) => r.id !== resumeId));
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
    return <ResumesPageSkeleton />;
  }

  return (
    <div className="min-h-screen animated-gradient aurora" data-theme="atsbuilder">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-brand-dark-bg/75 border-b border-brand-purple/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <Link href="/" className="flex items-center space-x-2 group hover:opacity-90 transition-opacity">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-cyan via-brand-purple to-brand-pink flex items-center justify-center shadow-xl glow-purple">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text">ResuCraft</span>
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
                  className="px-4 py-2 rounded-lg text-sm font-medium text-brand-white bg-brand-purple/20 hover:bg-brand-purple/30 transition-all duration-300"
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
            </div>

            <div className="flex items-center space-x-4">
              <Link
                href="/create"
                className="hidden md:flex group px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-brand-purple via-brand-pink to-brand-purple-light hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl glow-purple"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Resume
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
                    <span className="hidden md:block text-brand-white text-sm font-medium">
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
                            // TODO: Enable upgrade functionality later
                            setShowUserMenu(false);
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

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 rounded-lg bg-brand-navy/50 hover:bg-brand-navy/70 border border-brand-purple/30"
              >
                {showMobileMenu ? (
                  <X className="w-5 h-5 text-brand-white" />
                ) : (
                  <Menu className="w-5 h-5 text-brand-white" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {showMobileMenu && (
            <div className="md:hidden mt-4 pb-4 border-t border-brand-purple/30 pt-4">
              <nav className="flex flex-col space-y-2">
                <Link
                  href="/dashboard"
                  onClick={() => setShowMobileMenu(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-brand-gray-text hover:text-brand-white hover:bg-brand-navy/50"
                >
                  Dashboard
                </Link>
                <Link
                  href="/resumes"
                  onClick={() => setShowMobileMenu(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-brand-white bg-brand-purple/20"
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
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl sm:text-5xl font-black text-brand-white gradient-text">My Resumes</h1>
            <Link
              href="/create"
              className="px-6 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-brand-purple via-brand-pink to-brand-purple-light hover:scale-105 transition-all duration-300 shadow-xl glow-purple border-2 border-brand-pink/30 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Resume</span>
            </Link>
          </div>
          <p className="text-brand-gray-text text-lg">
            Manage all your resume versions and track their ATS scores.
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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {resumes.map((resume) => (
              <div key={resume.id} className="card bg-brand-navy/80 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-brand-purple/30 hover:border-brand-cyan/50 hover:scale-[1.02]">
                <div className="card-body">
                  <h2 className="card-title text-brand-white text-lg font-bold">
                    {resume.title}
                  </h2>
                  <div className="space-y-2 text-sm text-brand-gray-text">
                    <div className="flex justify-between items-center">
                      <span>Status:</span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          resume.status === 'compiled'
                            ? 'bg-brand-green/20 text-brand-green border border-brand-green/50'
                            : 'bg-brand-purple/20 text-brand-purple-light border border-brand-purple/50'
                        }`}
                      >
                        {resume.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>ATS Score:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
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
                    <div className="flex justify-between items-center">
                      <span>Created:</span>
                      <span>{formatDate(resume.created_at)}</span>
                    </div>
                  </div>
                  <div className="card-actions justify-end mt-4 gap-2 flex-wrap">
                    <Link
                      href={`/create?id=${resume.id}`}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-brand-purple to-brand-pink hover:from-brand-purple-light hover:to-brand-pink-light transition-all duration-300 border border-brand-purple/30 flex items-center"
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                      Edit
                    </Link>
                    <Link
                      href={`/resume/${resume.id}`}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium text-brand-cyan border border-brand-cyan/50 hover:bg-brand-cyan/10 transition-all duration-300 flex items-center"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1.5" />
                      View
                    </Link>
                    {resume.status === 'compiled' && (
                      <a
                        href={`/api/resume/${resume.id}/download`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg text-sm font-medium text-brand-cyan border border-brand-cyan/50 hover:bg-brand-cyan/10 transition-all duration-300 flex items-center"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(resume.id)}
                      disabled={deletingId === resume.id}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium text-red-400 border border-red-400/50 hover:bg-red-400/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {deletingId === resume.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

