'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Plus, Loader2, Download, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import type { ResumeVersion } from '@/lib/types';

export default function Dashboard() {
  const [resumes, setResumes] = useState<ResumeVersion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResumes();
  }, []);

  async function loadResumes() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('resume_versions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setResumes(data || []);
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

  const getScoreBadge = (score: number | null) => {
    if (!score) return 'badge-ghost';
    if (score >= 80) return 'badge-success';
    if (score >= 60) return 'badge-warning';
    return 'badge-error';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-cyan animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-black" data-theme="atsbuilder">
      <header className="bg-brand-black border-b border-brand-navy sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <FileText className="w-8 h-8 text-brand-cyan" />
              <span className="text-2xl font-bold text-brand-white">ResuCraft</span>
            </Link>
            <Link href="/create" className="btn btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              New Resume
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-brand-white mb-2">My Resumes</h1>
          <p className="text-brand-gray">
            Manage all your resume versions and track their ATS scores.
          </p>
        </div>

        {resumes.length === 0 ? (
          <div className="card bg-brand-navy shadow-xl">
            <div className="card-body items-center text-center py-16">
              <FileText className="w-16 h-16 text-brand-cyan mb-4" />
              <h2 className="card-title text-brand-white text-2xl mb-2">
                No resumes yet
              </h2>
              <p className="text-brand-gray mb-6">
                Create your first ATS-optimized resume to get started.
              </p>
              <Link href="/create" className="btn btn-primary btn-lg">
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Resume
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {resumes.map((resume) => (
              <div key={resume.id} className="card bg-brand-navy shadow-xl hover:shadow-2xl transition-shadow border border-brand-cyan/20">
                <div className="card-body">
                  <h2 className="card-title text-brand-white text-lg">
                    {resume.title}
                  </h2>
                  <div className="space-y-2 text-sm text-brand-gray">
                    <div className="flex justify-between items-center">
                      <span>Status:</span>
                      <span
                        className={`badge ${
                          resume.status === 'compiled'
                            ? 'badge-success'
                            : 'badge-ghost'
                        }`}
                      >
                        {resume.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>ATS Score:</span>
                      <span className={`badge ${getScoreBadge(resume.ats_score)}`}>
                        {resume.ats_score || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Created:</span>
                      <span>{formatDate(resume.created_at)}</span>
                    </div>
                  </div>
                  <div className="card-actions justify-end mt-4">
                    <Link
                      href={`/resume/${resume.id}`}
                      className="btn btn-sm btn-primary"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Link>
                    {resume.status === 'compiled' && (
                      <a
                        href={`/api/resume/${resume.id}/download`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline text-brand-white border-brand-cyan"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 card bg-brand-navy shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-brand-white">Quick Tips</h2>
            <ul className="space-y-2 text-brand-gray">
              <li className="flex items-start">
                <span className="text-brand-cyan mr-2">•</span>
                <span>
                  Higher ATS scores mean better chances of passing automated screening
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-cyan mr-2">•</span>
                <span>
                  Always tailor your resume by including the job description when creating it
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-cyan mr-2">•</span>
                <span>
                  Use quantifiable metrics and action verbs to improve your score
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-brand-cyan mr-2">•</span>
                <span>
                  Create multiple versions to compare different approaches
                </span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
