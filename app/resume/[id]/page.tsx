'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileText, Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { getATSRecommendations } from '@/lib/ats-scorer';
import type { ResumeVersion } from '@/lib/types';
import { shouldRedirectToWaitlist } from '@/lib/waitlist-check';

export default function ResumePage() {
  const params = useParams();
  const router = useRouter();
  const resumeId = (params?.id as string) || '';

  const [resume, setResume] = useState<ResumeVersion | null>(null);
  const [loading, setLoading] = useState(true);
  const [compiling, setCompiling] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  // Check if we should redirect to waitlist
  useEffect(() => {
    if (shouldRedirectToWaitlist()) {
      router.push('/waitlist');
    }
  }, [router]);

  useEffect(() => {
    loadResume();
  }, [resumeId]);

  async function loadResume() {
    try {
      if (!supabase) {
        console.error('Supabase not configured');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('resume_versions')
        .select('*')
        .eq('id', resumeId)
        .single();

      if (error) throw error;

      setResume(data);
      if (data.plain_text) {
        const recs = getATSRecommendations(data.ats_score || 0, data.plain_text);
        setRecommendations(recs);
      }
    } catch (error) {
      console.error('Error loading resume:', error);
      alert('Failed to load resume');
    } finally {
      setLoading(false);
    }
  }

  async function handleCompile() {
    setCompiling(true);
    try {
      const response = await fetch('/api/resume/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeId }),
      });

      if (!response.ok) throw new Error('Compilation failed');

      const data = await response.json();
      if (data.pdfUrl) {
        window.open(data.pdfUrl, '_blank');
        await loadResume();
      }
    } catch (error) {
      console.error('Error compiling:', error);
      alert('Failed to compile PDF. Please try again.');
    } finally {
      setCompiling(false);
    }
  }

  async function handleDownload() {
    try {
      const response = await fetch(`/api/resume/${resumeId}/download`);
      if (!response.ok) throw new Error('Download failed');

      const data = await response.json();
      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
      }
    } catch (error) {
      console.error('Error downloading:', error);
      alert('Failed to download PDF.');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-cyan animate-spin" />
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-brand-white text-xl mb-4">Resume not found</p>
          <Link href="/create" className="btn btn-primary">
            Create New Resume
          </Link>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-error';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  };

  return (
    <div className="min-h-screen bg-brand-black" data-theme="atsbuilder">
      <header className="bg-brand-black border-b border-brand-navy sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <FileText className="w-8 h-8 text-brand-cyan" />
              <span className="text-2xl font-bold text-brand-white">ResuCraft</span>
            </Link>
            <div className="flex gap-2">
              <Link href="/dashboard" className="btn btn-ghost text-brand-white">
                Dashboard
              </Link>
              <Link href="/create" className="btn btn-outline text-brand-white border-brand-cyan">
                New Resume
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="card bg-brand-navy shadow-xl">
              <div className="card-body">
                <h1 className="card-title text-3xl text-brand-white mb-4">{resume.title}</h1>
                <div className="prose prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-brand-gray font-mono text-sm bg-brand-black p-4 rounded-lg">
                    {resume.plain_text}
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-brand-navy shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-brand-white">LaTeX Source</h2>
                <div className="collapse collapse-arrow bg-brand-black">
                  <input type="checkbox" />
                  <div className="collapse-title text-brand-cyan font-medium">
                    View LaTeX Source Code
                  </div>
                  <div className="collapse-content">
                    <pre className="text-brand-gray text-xs overflow-x-auto">
                      {resume.latex_source}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card bg-brand-navy shadow-xl border-2 border-brand-cyan">
              <div className="card-body">
                <h2 className="card-title text-brand-white">ATS Score</h2>
                <div className="text-center py-6">
                  <div
                    className={`text-6xl font-bold ${getScoreColor(resume.ats_score || 0)}`}
                  >
                    {resume.ats_score || 0}
                  </div>
                  <div className="text-brand-gray text-lg mt-2">
                    {getScoreLabel(resume.ats_score || 0)}
                  </div>
                  <div className="mt-6">
                    <progress
                      className="progress progress-primary w-full"
                      value={resume.ats_score || 0}
                      max="100"
                    ></progress>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-brand-navy shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-brand-white mb-4">Actions</h2>
                <div className="space-y-3">
                  {resume.status === 'draft' ? (
                    <button
                      onClick={handleCompile}
                      disabled={compiling}
                      className="btn btn-primary w-full"
                    >
                      {compiling ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Compiling...
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4 mr-2" />
                          Compile to PDF
                        </>
                      )}
                    </button>
                  ) : (
                    <button onClick={handleDownload} className="btn btn-primary w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </button>
                  )}
                  <Link href="/create" className="btn btn-outline w-full text-brand-white border-brand-cyan">
                    Create New Version
                  </Link>
                </div>
                {resume.status === 'compiled' && (
                  <div className="alert alert-success mt-4">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm">PDF compiled successfully!</span>
                  </div>
                )}
              </div>
            </div>

            <div className="card bg-brand-navy shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-brand-white mb-4">
                  <AlertCircle className="w-5 h-5 text-brand-cyan" />
                  Recommendations
                </h2>
                <ul className="space-y-3">
                  {recommendations.map((rec, idx) => (
                    <li key={idx} className="text-brand-gray text-sm flex items-start">
                      <span className="text-brand-cyan mr-2">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
