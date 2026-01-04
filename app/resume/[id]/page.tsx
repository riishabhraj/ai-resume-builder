'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileText, Download, Loader2, CheckCircle, AlertCircle, Edit2, BarChart3, Plus } from 'lucide-react';
import { getATSRecommendations } from '@/lib/ats-scorer';
import type { ResumeVersion, ResumeAnalysis, StructuredResumeSection } from '@/lib/types';
import { shouldRedirectToWaitlist } from '@/lib/waitlist-check';
import { ResumeDetailSkeleton } from '@/components/skeletons/ResumeDetailSkeleton';

export default function ResumePage() {
  const params = useParams();
  const router = useRouter();
  const resumeId = (params?.id as string) || '';

  const [resume, setResume] = useState<ResumeVersion | null>(null);
  const [loading, setLoading] = useState(true);
  const [compiling, setCompiling] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [analyses, setAnalyses] = useState<ResumeAnalysis[]>([]);
  const [loadingAnalyses, setLoadingAnalyses] = useState(false);

  // Check if we should redirect to waitlist
  useEffect(() => {
    if (shouldRedirectToWaitlist()) {
      router.push('/waitlist');
    }
  }, [router]);

  useEffect(() => {
    loadResume();
    loadAnalyses();
  }, [resumeId]);

  async function loadResume() {
    try {
      const response = await fetch(`/api/resume/${resumeId}`);
      if (!response.ok) throw new Error('Failed to load resume');

      const data = await response.json();
      if (data.success && data.resume) {
        setResume(data.resume);
        // Generate recommendations if we have plain_text or sections
        if (data.resume.plain_text) {
          const recs = getATSRecommendations(data.resume.ats_score || 0, data.resume.plain_text);
          setRecommendations(recs);
        }
      }
    } catch (error) {
      console.error('Error loading resume:', error);
      alert('Failed to load resume');
    } finally {
      setLoading(false);
    }
  }

  async function loadAnalyses() {
    setLoadingAnalyses(true);
    try {
      const response = await fetch(`/api/resume/${resumeId}/analyses`);
      if (!response.ok) throw new Error('Failed to load analyses');

      const data = await response.json();
      if (data.success) {
        setAnalyses(data.analyses || []);
      }
    } catch (error) {
      console.error('Error loading analyses:', error);
    } finally {
      setLoadingAnalyses(false);
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
    return <ResumeDetailSkeleton />;
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
                <div className="flex justify-between items-center mb-4">
                  <h1 className="card-title text-3xl text-brand-white">{resume.title}</h1>
                  <div className="flex items-center space-x-2">
                    {/* Show Review button if resume hasn't been analyzed */}
                    {(resume.ats_score === null || resume.ats_score === undefined) && (
                      <Link 
                        href={`/review?resumeId=${resume.id}`}
                        className="btn btn-primary btn-sm"
                      >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Review
                      </Link>
                    )}
                    {resume.sections_data && resume.sections_data.length > 0 && (
                      <Link 
                        href={`/create?id=${resume.id}`}
                        className="btn btn-sm btn-outline border-brand-cyan text-brand-white"
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </Link>
                    )}
                  </div>
                </div>
                <div className="max-h-[calc(100vh - 12rem)] overflow-y-auto custom-scrollbar pr-2">
                  {resume.sections_data && resume.sections_data.length > 0 ? (
                    <ResumeSectionsDisplay sections={resume.sections_data} />
                  ) : resume.plain_text ? (
                    <div className="prose prose-invert max-w-none">
                      <div className="bg-brand-black/50 p-6 rounded-lg border border-brand-cyan/20">
                        <div className="mb-4">
                          <div className="badge badge-info">Analyzed Resume</div>
                          <p className="text-brand-gray text-sm mt-2">
                            This resume was analyzed directly from upload. To edit it, create a new resume version.
                          </p>
                        </div>
                        <div className="whitespace-pre-wrap text-brand-gray leading-relaxed text-sm">
                          {resume.plain_text}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-brand-black/50 p-6 rounded-lg border border-red-500/20">
                      <div className="flex items-center space-x-3 text-red-400">
                        <AlertCircle className="w-6 h-6" />
                        <div>
                          <p className="font-semibold">No content available</p>
                          <p className="text-sm text-brand-gray mt-1">
                            This resume doesn't have any viewable content. 
                            Try creating a new resume or analyzing another file.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {resume.latex_source && (
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
            )}
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
                  {/* Show Review button prominently if resume hasn't been analyzed */}
                  {(resume.ats_score === null || resume.ats_score === undefined) ? (
                    <Link 
                      href={`/review?resumeId=${resume.id}`}
                      className="btn btn-primary w-full"
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Review This Resume
                    </Link>
                  ) : null}
                  
                  {resume.sections_data && resume.sections_data.length > 0 ? (
                    <>
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
                      <Link 
                        href={`/create?id=${resume.id}`}
                        className="btn btn-outline w-full text-brand-white border-brand-cyan"
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Resume
                      </Link>
                    </>
                  ) : (
                    <div className="bg-brand-black/50 p-4 rounded-lg border border-brand-cyan/20 mb-3">
                      <p className="text-brand-gray text-sm mb-2">
                        <strong className="text-brand-white">Analyzed Resume</strong>
                      </p>
                      <p className="text-brand-gray text-xs">
                        This resume was analyzed from an uploaded file. 
                        To generate a PDF or edit it, create a new resume.
                      </p>
                    </div>
                  )}
                  <Link href="/create" className="btn btn-outline w-full text-brand-white border-brand-cyan">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Resume
                  </Link>
                  <Link href="/review" className="btn btn-outline w-full text-brand-white border-brand-cyan">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analyze Another
                  </Link>
                </div>
                {resume.status === 'compiled' && resume.sections_data && resume.sections_data.length > 0 && (
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
                  <BarChart3 className="w-5 h-5 text-brand-cyan" />
                  Analysis History
                </h2>
                {loadingAnalyses ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-brand-cyan" />
                  </div>
                ) : analyses.length === 0 ? (
                  <p className="text-brand-gray text-sm">No analyses yet</p>
                ) : (
                  <div className="space-y-3">
                    {analyses.map((analysis) => (
                      <div key={analysis.id} className="bg-brand-black p-4 rounded-lg border border-brand-cyan/20">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="badge badge-primary badge-sm mr-2">
                              {analysis.analysis_type}
                            </span>
                            {analysis.ats_score !== null && (
                              <span className="text-brand-cyan font-bold">
                                Score: {analysis.ats_score}
                              </span>
                            )}
                          </div>
                          <span className="text-brand-gray text-xs">
                            {new Date(analysis.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {analysis.job_description && (
                          <p className="text-brand-gray text-xs mt-2 line-clamp-2">
                            Job: {analysis.job_description.substring(0, 100)}...
                          </p>
                        )}
                      </div>
                    ))}
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
                  {recommendations.length === 0 ? (
                    <li className="text-brand-gray text-sm">No recommendations available</li>
                  ) : (
                    recommendations.map((rec, idx) => (
                      <li key={idx} className="text-brand-gray text-sm flex items-start">
                        <span className="text-brand-cyan mr-2">•</span>
                        <span>{rec}</span>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Component to display structured resume sections
function ResumeSectionsDisplay({ sections }: { sections: StructuredResumeSection[] }) {
  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <div key={section.id} className="border-b border-brand-cyan/20 pb-4 last:border-0">
          <h3 className="text-xl font-bold text-brand-white mb-3">{section.title}</h3>
          {section.type === 'personal-info' && (
            <div className="text-brand-gray space-y-1">
              {section.content.fullName && <p className="font-semibold text-brand-white">{section.content.fullName}</p>}
              {section.content.title && <p>{section.content.title}</p>}
              {section.content.email && <p>{section.content.email}</p>}
              {section.content.phone && <p>{section.content.phone}</p>}
              {section.content.location && <p>{section.content.location}</p>}
            </div>
          )}
          {section.type === 'professional-summary' || section.type === 'career-objective' ? (
            <p className="text-brand-gray">{section.content.text}</p>
          ) : section.type === 'experience' || section.type === 'leadership' ? (
            <div className="space-y-4">
              {Array.isArray(section.content) && section.content.map((exp: any) => (
                <div key={exp.id} className="bg-brand-black/50 p-3 rounded">
                  <div className="font-semibold text-brand-white">{exp.role} {exp.additionalRole && `- ${exp.additionalRole}`}</div>
                  <div className="text-brand-cyan">{exp.company}</div>
                  <div className="text-brand-gray text-sm">{exp.location} • {exp.startDate} - {exp.endDate || 'Present'}</div>
                  {exp.bullets && exp.bullets.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {exp.bullets.map((bullet: any) => (
                        <li key={bullet.id} className="text-brand-gray text-sm">• {bullet.text}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          ) : section.type === 'education' ? (
            <div className="space-y-3">
              {Array.isArray(section.content) && section.content.map((edu: any) => (
                <div key={edu.id} className="bg-brand-black/50 p-3 rounded">
                  <div className="font-semibold text-brand-white">{edu.degree} in {edu.field}</div>
                  <div className="text-brand-cyan">{edu.institution}</div>
                  <div className="text-brand-gray text-sm">{edu.startDate} - {edu.endDate || 'Present'}</div>
                  {edu.gpa && <div className="text-brand-gray text-sm">GPA: {edu.gpa}</div>}
                </div>
              ))}
            </div>
          ) : section.type === 'skills' ? (
            <div className="space-y-3">
              {section.content.categories && Array.isArray(section.content.categories) && section.content.categories.map((cat: any) => (
                <div key={cat.id}>
                  <div className="font-semibold text-brand-white mb-2">{cat.name}</div>
                  <div className="flex flex-wrap gap-2">
                    {cat.keywords && cat.keywords.map((keyword: string, idx: number) => (
                      <span key={idx} className="px-2 py-1 bg-brand-cyan/20 text-brand-cyan rounded text-sm">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-brand-gray text-sm">
              {JSON.stringify(section.content, null, 2)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
