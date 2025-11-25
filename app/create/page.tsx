'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { FileText, Plus, Upload, Edit2, Trash2, Download, Loader2, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { getAllTemplates, getDefaultTemplateId } from '@/lib/templates';
import MonthYearPicker from '@/components/MonthYearPicker';
import ATSAnalysisModal from '@/components/ATSAnalysisModal';

type SectionType = 
  | 'personal-info'
  | 'professional-summary'
  | 'career-objective'
  | 'education'
  | 'experience'
  | 'leadership'
  | 'projects'
  | 'research'
  | 'certifications'
  | 'awards'
  | 'publications'
  | 'skills';

interface ResumeSection {
  id: string;
  type: SectionType;
  title: string;
  content: any;
}

const SECTION_TEMPLATES = [
  {
    type: 'professional-summary' as SectionType,
    icon: '📄',
    title: 'Professional Summary',
    description: 'Brief overview of your experience and strengths',
  },
  {
    type: 'career-objective' as SectionType,
    icon: '🎯',
    title: 'Career Objective',
    description: 'Your career goals and target role',
  },
  {
    type: 'education' as SectionType,
    icon: '🎓',
    title: 'Education',
    description: 'Add your degrees and institutions',
  },
  {
    type: 'experience' as SectionType,
    icon: '💼',
    title: 'Professional Experience',
    description: 'Highlight your roles, impact and achievements',
  },
  {
    type: 'leadership' as SectionType,
    icon: '👥',
    title: 'Leadership',
    description: 'Leadership roles and team experiences',
  },
  {
    type: 'projects' as SectionType,
    icon: '⚙️',
    title: 'Projects',
    description: 'Showcase notable projects and technologies',
  },
  {
    type: 'research' as SectionType,
    icon: '🧪',
    title: 'Research',
    description: 'Research papers, theses, and academic work',
  },
  {
    type: 'certifications' as SectionType,
    icon: '🏆',
    title: 'Certifications',
    description: 'Professional certifications and licenses',
  },
  {
    type: 'awards' as SectionType,
    icon: '🏅',
    title: 'Awards & Honors',
    description: 'Recognition and achievements',
  },
  {
    type: 'publications' as SectionType,
    icon: '📚',
    title: 'Publications',
    description: 'Published papers, articles, and books',
  },
  {
    type: 'skills' as SectionType,
    icon: '⚡',
    title: 'Skills',
    description: 'List your technical and professional skills',
  },
];

export default function CreateResume() {
  const [step, setStep] = useState<'template' | 'editor'>('editor'); // Skip template selection, go directly to editor
  const [selectedTemplate, setSelectedTemplate] = useState<string>(getDefaultTemplateId());
  const [showAddSection, setShowAddSection] = useState(false);
  const [sections, setSections] = useState<ResumeSection[]>([
    {
      id: 'personal-info',
      type: 'personal-info',
      title: 'Personal Info',
      content: {
    fullName: '',
    title: '',
    email: '',
        phone: '',
    location: '',
        linkedin: '',
        website: '',
      },
    },
  ]);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [showATSAnalysis, setShowATSAnalysis] = useState(false);

  // Force preview re-render when sections change
  useEffect(() => {
    setPreviewKey(prev => prev + 1);
  }, [sections]);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    setStep('editor');
  };

  const handleAddSection = (sectionType: SectionType) => {
    const template = SECTION_TEMPLATES.find((s) => s.type === sectionType);
    if (!template) return;

    const newSection: ResumeSection = {
      id: `${sectionType}-${Date.now()}`,
      type: sectionType,
      title: template.title,
      content: getDefaultContent(sectionType),
    };

    setSections([...sections, newSection]);
    setShowAddSection(false);
    setEditingSection(newSection.id);
  };

  const handleRemoveSection = (sectionId: string) => {
    if (sectionId === 'personal-info') return; // Can't remove personal info
    setSections(sections.filter((s) => s.id !== sectionId));
  };

  const handleUpdateSection = (sectionId: string, content: any) => {
    setSections((prevSections) =>
      prevSections.map((s) =>
        s.id === sectionId ? { ...s, content } : s
      )
    );
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      // Call API to generate PDF
      const response = await fetch('/api/download-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sections,
          templateId: selectedTemplate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate PDF');
      }

      // Get the PDF blob
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resume_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      alert('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error generating resume:', error);
      alert(`Failed to generate resume: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setGenerating(false);
    }
  };

  function getDefaultContent(type: SectionType): any {
    switch (type) {
      case 'professional-summary':
      case 'career-objective':
        return { text: '' };
      case 'education':
        return [{ id: `edu-${Date.now()}`, institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '', location: '' }];
      case 'experience':
      case 'leadership':
        return [{ id: `exp-${Date.now()}`, company: '', role: '', additionalRole: '', location: '', startDate: '', endDate: '', bullets: [{ id: `bullet-${Date.now()}`, text: '' }] }];
      case 'projects':
        return [{ id: `proj-${Date.now()}`, name: '', description: '', technologies: '', link: '' }];
      case 'research':
      case 'publications':
        return [{ id: `pub-${Date.now()}`, title: '', authors: '', venue: '', year: '', link: '' }];
      case 'certifications':
      case 'awards':
        return [{ id: `cert-${Date.now()}`, title: '', issuer: '', date: '', description: '' }];
      case 'skills':
        return { categories: [{ id: `cat-${Date.now()}`, name: '', keywords: [] }] };
      default:
        return {};
    }
  }

  // Template Selection View
  if (step === 'template') {
  return (
    <div className="min-h-screen bg-brand-black" data-theme="atsbuilder">
      <header className="bg-brand-black border-b border-brand-navy sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <FileText className="w-8 h-8 text-brand-cyan" />
              <span className="text-2xl font-bold text-brand-white">ResuCraft</span>
            </Link>
            <Link href="/dashboard" className="btn btn-ghost text-brand-white">
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-brand-white mb-4">
            Get Started with Your Resume
          </h1>
          <p className="text-brand-gray text-lg">
            Professional, ATS-friendly template designed for maximum impact
          </p>
        </div>

        <div className="flex flex-col items-center max-w-3xl mx-auto">
          {getAllTemplates().map((template) => (
            <div key={template.id} className="w-full">
              <div className="group relative bg-brand-navy/90 backdrop-blur-sm rounded-2xl transition-all duration-300 border-2 border-brand-navy/50 hover:border-brand-cyan hover:shadow-2xl hover:shadow-brand-cyan/30 overflow-hidden">
                <figure className="relative h-[700px] bg-gradient-to-br from-brand-black to-brand-navy/80 overflow-hidden p-12">
                  {template.preview ? (
                    <img
                      src={template.preview}
                      alt={`${template.name} template preview`}
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-brand-gray">
                      <FileText className="w-20 h-20 mb-4 text-brand-cyan/50" />
                      <p className="text-base">Preview coming soon</p>
                    </div>
                  )}
                </figure>
                <div className="p-8 border-t border-gray-700 bg-gradient-to-b from-brand-navy/50 to-brand-black/50">
                  <h3 className="font-bold text-brand-white text-2xl mb-3">{template.name}</h3>
                  <p className="text-brand-gray text-lg mb-6">{template.description}</p>
                  <button
                    onClick={() => handleTemplateSelect(template.id)}
                    className="w-full btn bg-brand-cyan hover:bg-brand-cyan/90 text-brand-black border-0 font-bold text-lg py-4 shadow-lg shadow-brand-cyan/30 hover:shadow-brand-cyan/50 hover:scale-[1.02] transition-all"
                  >
                    Start Creating Your Resume
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      </div>
    );
  }

  // Editor View
  return (
    <div className="h-screen flex flex-col bg-[#0a0e27]" data-theme="atsbuilder">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#0f1629] to-[#1a1f3a] border-b border-brand-cyan/20 px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-6">
          <Link
            href="/"
            className="flex items-center space-x-2 text-brand-gray hover:text-brand-cyan transition-all duration-200 group"
          >
            <span className="text-lg group-hover:transform group-hover:-translate-x-1 transition-transform">←</span>
            <span className="font-medium">Back to Home</span>
          </Link>
          <div className="h-6 w-px bg-gray-700"></div>
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-brand-cyan" />
            <h1 className="text-xl font-bold text-brand-white tracking-wide">ResuCraft</h1>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowATSAnalysis(true)}
            className="btn bg-purple-600 hover:bg-purple-700 text-white border-0 font-bold px-6 py-3 rounded-lg shadow-lg hover:shadow-purple-500/50 transition-all duration-200 hover:scale-105"
          >
            <BarChart3 className="w-5 h-5 mr-2" />
            Analyze ATS Score
          </button>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="btn bg-brand-cyan hover:bg-brand-cyan/90 text-brand-black border-0 font-bold px-6 py-3 rounded-lg shadow-lg hover:shadow-brand-cyan/50 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Download PDF
              </>
            )}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Sections */}
        <div className="w-80 bg-[#0f1629] border-r border-gray-800 flex flex-col">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-brand-white mb-1">Resume Sections</h2>
            <p className="text-sm text-brand-gray">Click any section to edit</p>
                </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {sections.map((section) => (
              <div
                key={section.id}
                onClick={() => setEditingSection(section.id)}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                  editingSection === section.id
                    ? 'bg-brand-cyan/10 border border-brand-cyan'
                    : 'bg-gray-800/50 border border-transparent hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    section.id === 'personal-info' ? 'bg-brand-cyan/20' : 'bg-gray-700'
                  }`}>
                    {section.id === 'personal-info' ? '👤' : '📄'}
                </div>
                  <span className="text-brand-white font-medium">{section.title}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {section.id === 'personal-info' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingSection(section.id);
                      }}
                      className="text-brand-cyan hover:text-brand-cyan/80 p-1"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  {section.id !== 'personal-info' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveSection(section.id);
                      }}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-800 space-y-3">
            <button
              onClick={() => setShowAddSection(true)}
              className="w-full flex items-center justify-center space-x-2 p-3 rounded-lg bg-gray-800/50 border border-dashed border-gray-600 hover:border-brand-cyan hover:bg-gray-800 text-brand-white transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Add Section</span>
            </button>
            <button className="w-full flex items-center justify-center space-x-2 p-3 rounded-lg bg-gray-800/50 border border-gray-600 hover:border-brand-cyan hover:bg-gray-800 text-brand-white transition-all">
              <Upload className="w-5 h-5" />
              <span>Import from PDF</span>
            </button>
          </div>
        </div>

        {/* Main Content - Full Preview */}
        <div className="flex-1 flex items-start justify-center overflow-y-auto p-8 bg-[#0a0e27]">
          <div className="w-full max-w-[850px]">
            <div className="mb-4 text-center">
              <p className="text-sm text-brand-gray">Preview is approximate. Download PDF for exact layout.</p>
            </div>
            <div className="bg-white rounded-lg shadow-2xl p-16 min-h-[1100px]" style={{ fontFamily: '"Tinos", "Liberation Serif", "Times New Roman", Georgia, serif' }}>
              <ResumePreview key={previewKey} sections={sections} templateId={selectedTemplate} />
            </div>
          </div>
        </div>
      </div>

      {/* Section Editor Modal */}
      {editingSection && (() => {
        const currentSection = sections.find((s) => s.id === editingSection);
        if (!currentSection) return null;
        
        return (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#0f1629] rounded-2xl max-w-4xl w-full max-h-[90vh] border border-gray-700 flex flex-col">
              {/* Header - Fixed */}
              <div className="p-6 border-b border-gray-700 flex items-center justify-between flex-shrink-0">
                <h2 className="text-2xl font-bold text-brand-white">
                  {currentSection.title}
                </h2>
                <button
                  onClick={() => setEditingSection(null)}
                  className="text-brand-gray hover:text-brand-white p-2 rounded-lg hover:bg-gray-800 transition-all text-xl"
                >
                  ✕
                </button>
          </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-8">
                <SectionEditor
                  section={currentSection}
                  onUpdate={(content) => handleUpdateSection(editingSection, content)}
                />
              </div>
              
              {/* Footer - Fixed */}
              <div className="p-6 border-t border-gray-700 flex justify-end space-x-3 flex-shrink-0 bg-[#0f1629]">
                <button
                  onClick={() => setEditingSection(null)}
                  className="btn bg-gray-700 hover:bg-gray-600 text-brand-white border-0 font-semibold px-8"
                >
                  Close
                </button>
                <button
                  onClick={() => setEditingSection(null)}
                  className="btn bg-brand-cyan hover:bg-brand-cyan/90 text-brand-black border-0 font-semibold px-8"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Add Section Modal */}
      {showAddSection && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f1629] rounded-2xl max-w-4xl w-full max-h-[85vh] border border-gray-700 flex flex-col">
            {/* Header - Fixed */}
            <div className="p-6 border-b border-gray-700 flex items-center justify-between flex-shrink-0">
              <h2 className="text-2xl font-bold text-brand-white">Add Content</h2>
              <button
                onClick={() => setShowAddSection(false)}
                className="text-brand-gray hover:text-brand-white p-2 rounded-lg hover:bg-gray-800 transition-all text-xl"
              >
                ✕
              </button>
          </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {SECTION_TEMPLATES.map((template) => (
                  <button
                    key={template.type}
                    onClick={() => handleAddSection(template.type)}
                    className="p-6 rounded-xl bg-gray-800/50 border border-gray-700 hover:border-brand-cyan hover:bg-gray-800 text-left transition-all group"
                  >
                    <div className="text-3xl mb-3">{template.icon}</div>
                    <h3 className="text-lg font-semibold text-brand-white mb-2 group-hover:text-brand-cyan transition-colors">
                      {template.title}
                    </h3>
                    <p className="text-sm text-brand-gray">{template.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ATS Analysis Modal */}
      <ATSAnalysisModal
        isOpen={showATSAnalysis}
        onClose={() => setShowATSAnalysis(false)}
        sections={sections}
      />
                  </div>
  );
}

// Section Editor Component
function SectionEditor({ section, onUpdate }: { section: ResumeSection; onUpdate: (content: any) => void }) {
  if (section.type === 'personal-info') {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-brand-white mb-2">Full Name *</label>
                  <input
                    type="text"
              value={section.content.fullName || ''}
              onChange={(e) => onUpdate({ ...section.content, fullName: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 text-brand-white border border-gray-600 rounded-lg focus:outline-none focus:border-brand-cyan"
              placeholder="John Doe"
                  />
                </div>
          <div>
            <label className="block text-sm font-medium text-brand-white mb-2">Professional Title *</label>
                  <input
                    type="text"
              value={section.content.title || ''}
              onChange={(e) => onUpdate({ ...section.content, title: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 text-brand-white border border-gray-600 rounded-lg focus:outline-none focus:border-brand-cyan"
              placeholder="Software Engineer"
                  />
                </div>
          <div>
            <label className="block text-sm font-medium text-brand-white mb-2">Email</label>
                  <input
                    type="email"
              value={section.content.email || ''}
              onChange={(e) => onUpdate({ ...section.content, email: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 text-brand-white border border-gray-600 rounded-lg focus:outline-none focus:border-brand-cyan"
              placeholder="john@example.com"
                  />
                </div>
          <div>
            <label className="block text-sm font-medium text-brand-white mb-2">Phone</label>
                      <input
              type="tel"
              value={section.content.phone || ''}
              onChange={(e) => onUpdate({ ...section.content, phone: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 text-brand-white border border-gray-600 rounded-lg focus:outline-none focus:border-brand-cyan"
              placeholder="+1 (555) 123-4567"
                      />
                    </div>
          <div>
            <label className="block text-sm font-medium text-brand-white mb-2">Location</label>
                  <input
                    type="text"
              value={section.content.location || ''}
              onChange={(e) => onUpdate({ ...section.content, location: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 text-brand-white border border-gray-600 rounded-lg focus:outline-none focus:border-brand-cyan"
              placeholder="San Francisco, CA"
                  />
                </div>
          <div>
            <label className="block text-sm font-medium text-brand-white mb-2">LinkedIn</label>
            <input
              type="url"
              value={section.content.linkedin || ''}
              onChange={(e) => onUpdate({ ...section.content, linkedin: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 text-brand-white border border-gray-600 rounded-lg focus:outline-none focus:border-brand-cyan"
              placeholder="linkedin.com/in/johndoe"
                />
              </div>
            </div>
          </div>
    );
  }

  if (section.type === 'professional-summary' || section.type === 'career-objective') {
    return (
      <div className="space-y-6">
        <div>
                <textarea
            value={section.content.text || ''}
            onChange={(e) => onUpdate({ text: e.target.value })}
            rows={8}
            className="w-full px-4 py-3 bg-gray-800 text-brand-white border border-gray-600 rounded-lg focus:outline-none focus:border-brand-cyan resize-none"
            placeholder="Write a brief overview of your professional background and key strengths..."
          />
          <p className="text-gray-400 text-sm mt-2">
            Tip: Keep it concise (2-3 sentences) and highlight your key qualifications and career goals.
          </p>
              </div>
            </div>
    );
  }

  if (section.type === 'experience' || section.type === 'leadership') {
    const experiences = Array.isArray(section.content) ? section.content : [];
    const [enhancingBullet, setEnhancingBullet] = React.useState<string | null>(null);

    const addExperience = () => {
      onUpdate([...experiences, { 
        id: `exp-${Date.now()}`, 
        company: '', 
        role: '', 
        additionalRole: '',
        location: '',
        startDate: '', 
        endDate: '', 
        bullets: [{ id: `bullet-${Date.now()}`, text: '' }] 
      }]);
    };

    const removeExperience = (expId: string) => {
      onUpdate(experiences.filter((exp: any) => exp.id !== expId));
    };

    const updateExperience = (expId: string, field: string, value: any) => {
      const updated = experiences.map((exp: any) => 
        exp.id === expId ? { ...exp, [field]: value } : exp
      );
      onUpdate(updated);
    };

    const addBullet = (expId: string) => {
      const updated = experiences.map((exp: any) =>
        exp.id === expId 
          ? { ...exp, bullets: [...(exp.bullets || []), { id: `bullet-${Date.now()}`, text: '' }] }
          : exp
      );
      onUpdate(updated);
    };

    const removeBullet = (expId: string, bulletId: string) => {
      const updated = experiences.map((exp: any) =>
        exp.id === expId
          ? { ...exp, bullets: exp.bullets.filter((b: any) => b.id !== bulletId) }
          : exp
      );
      onUpdate(updated);
    };

    const updateBullet = (expId: string, bulletId: string, value: string) => {
      const updated = experiences.map((exp: any) =>
        exp.id === expId
          ? {
              ...exp,
              bullets: exp.bullets.map((b: any) => 
                b.id === bulletId ? { ...b, text: value } : b
              )
            }
          : exp
      );
      onUpdate(updated);
    };

    const handleEnhanceBullet = async (expId: string, bulletId: string, text: string) => {
      const exp = experiences.find((e: any) => e.id === expId);
      if (!exp) return;

      setEnhancingBullet(bulletId);

      try {
        const response = await fetch('/api/enhance-bullet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            role: exp.role || '',
            company: exp.company || '',
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to enhance bullet point');
        }

        const data = await response.json();
        updateBullet(expId, bulletId, data.enhanced);
      } catch (error) {
        console.error('Error enhancing bullet:', error);
        alert('Failed to enhance bullet point. Please try again.');
      } finally {
        setEnhancingBullet(null);
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-end mb-6">
          <button
            onClick={addExperience}
            className="flex items-center space-x-2 px-4 py-2 bg-brand-cyan text-brand-black rounded-lg hover:bg-brand-cyan/90 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Add Experience</span>
          </button>
          </div>

        {experiences.length === 0 ? (
          <div className="text-center py-12 text-brand-gray">
            <p>No experiences added yet. Click "Add Experience" to get started.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {experiences.map((exp: any, expIdx: number) => (
              <div key={exp.id} className="p-6 bg-gray-800/50 rounded-xl border border-gray-700 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-brand-cyan">Experience #{expIdx + 1}</h3>
                  <button
                    onClick={() => removeExperience(exp.id)}
                    className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-400/10 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-white mb-2">Company *</label>
                <input
                  type="text"
                      value={exp.company || ''}
                      onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 text-brand-white border border-gray-600 rounded-lg focus:outline-none focus:border-brand-cyan"
                      placeholder="RESUME WORDED CO."
                />
              </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-white mb-2">Location *</label>
                    <input
                      type="text"
                      value={exp.location || ''}
                      onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 text-brand-white border border-gray-600 rounded-lg focus:outline-none focus:border-brand-cyan"
                      placeholder="New York, NY"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-white mb-2">Role/Title *</label>
                    <input
                      type="text"
                      value={exp.role || ''}
                      onChange={(e) => updateExperience(exp.id, 'role', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 text-brand-white border border-gray-600 rounded-lg focus:outline-none focus:border-brand-cyan"
                      placeholder="Product Manager"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-white mb-2">Additional Role (Optional)</label>
                    <input
                      type="text"
                      value={exp.additionalRole || ''}
                      onChange={(e) => updateExperience(exp.id, 'additionalRole', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 text-brand-white border border-gray-600 rounded-lg focus:outline-none focus:border-brand-cyan"
                      placeholder="Lead Business Analyst"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <MonthYearPicker
                          label="Start Date *"
                          value={exp.startDate || ''}
                          onChange={(value) => updateExperience(exp.id, 'startDate', value)}
                          placeholder="Select start date"
                        />
                      </div>
                      <div>
                        <MonthYearPicker
                          label="End Date *"
                          value={exp.endDate || ''}
                          onChange={(value) => updateExperience(exp.id, 'endDate', value)}
                          placeholder="Select end date"
                          allowPresent={true}
                        />
                      </div>
                    </div>
            </div>
          </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-brand-white">Key Achievements & Responsibilities</label>
                    <button
                      onClick={() => addBullet(exp.id)}
                      className="text-brand-cyan hover:text-brand-cyan/80 text-sm flex items-center space-x-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Bullet</span>
                </button>
              </div>

                  {exp.bullets && exp.bullets.length > 0 ? (
                    <div className="space-y-3">
                      {exp.bullets.map((bullet: any) => (
                        <div key={bullet.id} className="space-y-2">
                          <div className="flex items-start space-x-2">
                            <span className="text-brand-cyan mt-4 text-lg leading-none">•</span>
                            <textarea
                              value={bullet.text || ''}
                              onChange={(e) => updateBullet(exp.id, bullet.id, e.target.value)}
                              rows={3}
                              className="flex-1 px-4 py-3 bg-gray-800 text-brand-white border border-gray-600 rounded-lg focus:outline-none focus:border-brand-cyan resize-y"
                              placeholder="Describe your achievement or responsibility..."
                            />
                            {exp.bullets.length > 1 && (
                      <button
                                onClick={() => removeBullet(exp.id, bullet.id)}
                                className="text-red-400 hover:text-red-300 p-2 mt-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                          {bullet.text && bullet.text.trim() && (
                            <div className="ml-6 flex items-center">
                              <button
                                onClick={() => handleEnhanceBullet(exp.id, bullet.id, bullet.text)}
                                disabled={enhancingBullet === bullet.id}
                                className="text-xs px-3 py-1.5 bg-gradient-to-r from-purple-500 to-brand-cyan text-white rounded-md hover:from-purple-600 hover:to-brand-cyan/90 transition-all duration-200 flex items-center space-x-1 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {enhancingBullet === bullet.id ? (
                                  <>
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    <span>Enhancing...</span>
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                                    </svg>
                                    <span>Enhance with AI</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <button
                      onClick={() => addBullet(exp.id)}
                      className="w-full p-4 border-2 border-dashed border-gray-600 rounded-lg text-brand-gray hover:border-brand-cyan hover:text-brand-cyan transition-all"
                    >
                      Add your first bullet point
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (section.type === 'projects') {
    const projects = Array.isArray(section.content) ? section.content : [];

    const addProject = () => {
      onUpdate([...projects, { 
        id: `proj-${Date.now()}`, 
        name: '', 
        description: '', 
        technologies: '', 
        link: ''
      }]);
    };

    const removeProject = (projId: string) => {
      onUpdate(projects.filter((proj: any) => proj.id !== projId));
    };

    const updateProject = (projId: string, field: string, value: any) => {
      const updated = projects.map((proj: any) => 
        proj.id === projId ? { ...proj, [field]: value } : proj
      );
      onUpdate(updated);
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-end mb-6">
          <button
            onClick={addProject}
            className="flex items-center space-x-2 px-4 py-2 bg-brand-cyan text-brand-black rounded-lg hover:bg-brand-cyan/90 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Add Project</span>
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12 text-brand-gray">
            <p>No projects added yet. Click "Add Project" to get started.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {projects.map((proj: any, projIdx: number) => (
              <div key={proj.id} className="p-6 bg-gray-800/50 rounded-xl border border-gray-700 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-brand-cyan">Project #{projIdx + 1}</h3>
                  <button
                    onClick={() => removeProject(proj.id)}
                    className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-400/10 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-white mb-2">Project Name *</label>
                      <input
                        type="text"
                      value={proj.name || ''}
                      onChange={(e) => updateProject(proj.id, 'name', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 text-brand-white border border-gray-600 rounded-lg focus:outline-none focus:border-brand-cyan"
                      placeholder="E-Commerce Platform"
                      />
                    </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-brand-white mb-2">Description</label>
                    <textarea
                      value={proj.description || ''}
                      onChange={(e) => updateProject(proj.id, 'description', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-800 text-brand-white border border-gray-600 rounded-lg focus:outline-none focus:border-brand-cyan resize-none"
                      placeholder="Developed a full-stack e-commerce platform with payment integration..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-brand-white mb-2">Technologies/Tools *</label>
                      <input
                        type="text"
                      value={proj.technologies || ''}
                      onChange={(e) => updateProject(proj.id, 'technologies', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 text-brand-white border border-gray-600 rounded-lg focus:outline-none focus:border-brand-cyan"
                      placeholder="React, Redux, Express.js, MongoDB, OAuth, Nodemailer, Redis, Cloudinary"
                    />
                    <p className="text-gray-400 text-xs mt-1">Separate multiple technologies with commas</p>
                    </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-brand-white mb-2">Project Link (Optional)</label>
                    <input
                      type="url"
                      value={proj.link || ''}
                      onChange={(e) => updateProject(proj.id, 'link', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 text-brand-white border border-gray-600 rounded-lg focus:outline-none focus:border-brand-cyan"
                      placeholder="https://github.com/username/project"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (section.type === 'education') {
    const educations = Array.isArray(section.content) ? section.content : [];

    const addEducation = () => {
      onUpdate([...educations, { 
        id: `edu-${Date.now()}`, 
        institution: '', 
        degree: '', 
        field: '', 
        startDate: '', 
        endDate: '', 
        gpa: '',
        location: ''
      }]);
    };

    const removeEducation = (eduId: string) => {
      onUpdate(educations.filter((edu: any) => edu.id !== eduId));
    };

    const updateEducation = (eduId: string, field: string, value: any) => {
      const updated = educations.map((edu: any) => 
        edu.id === eduId ? { ...edu, [field]: value } : edu
      );
      onUpdate(updated);
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-end mb-6">
          <button
            onClick={addEducation}
            className="flex items-center space-x-2 px-4 py-2 bg-brand-cyan text-brand-black rounded-lg hover:bg-brand-cyan/90 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Add Education</span>
          </button>
        </div>

        {educations.length === 0 ? (
          <div className="text-center py-12 text-brand-gray">
            <p>No education added yet. Click "Add Education" to get started.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {educations.map((edu: any, eduIdx: number) => (
              <div key={edu.id} className="p-6 bg-gray-800/50 rounded-xl border border-gray-700 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-brand-cyan">Education #{eduIdx + 1}</h3>
                  <button
                    onClick={() => removeEducation(edu.id)}
                    className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-400/10 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-brand-white mb-2">Institution/University *</label>
                      <input
                        type="text"
                      value={edu.institution || ''}
                      onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 text-brand-white border border-gray-600 rounded-lg focus:outline-none focus:border-brand-cyan"
                      placeholder="Harvard University"
                      />
                    </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-white mb-2">Degree *</label>
                      <input
                        type="text"
                      value={edu.degree || ''}
                      onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 text-brand-white border border-gray-600 rounded-lg focus:outline-none focus:border-brand-cyan"
                      placeholder="Bachelor of Science"
                      />
                    </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-white mb-2">Field of Study</label>
                      <input
                        type="text"
                      value={edu.field || ''}
                      onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 text-brand-white border border-gray-600 rounded-lg focus:outline-none focus:border-brand-cyan"
                      placeholder="Computer Science"
                      />
                  </div>
                  <div className="md:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <MonthYearPicker
                          label="Start Date"
                          value={edu.startDate || ''}
                          onChange={(value) => updateEducation(edu.id, 'startDate', value)}
                          placeholder="Select start date"
                        />
                      </div>
                      <div>
                        <MonthYearPicker
                          label="End Date"
                          value={edu.endDate || ''}
                          onChange={(value) => updateEducation(edu.id, 'endDate', value)}
                          placeholder="Select end date"
                          allowPresent={true}
                        />
                      </div>
                    </div>
                    </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-white mb-2">GPA (Optional)</label>
                    <input
                      type="text"
                      value={edu.gpa || ''}
                      onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 text-brand-white border border-gray-600 rounded-lg focus:outline-none focus:border-brand-cyan"
                      placeholder="3.8/4.0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-white mb-2">Location (Optional)</label>
                    <input
                      type="text"
                      value={edu.location || ''}
                      onChange={(e) => updateEducation(edu.id, 'location', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 text-brand-white border border-gray-600 rounded-lg focus:outline-none focus:border-brand-cyan"
                      placeholder="Cambridge, MA"
                    />
                  </div>
                  </div>
                </div>
              ))}
            </div>
        )}
          </div>
    );
  }

  if (section.type === 'certifications' || section.type === 'awards') {
    const certifications = Array.isArray(section.content) ? section.content : [];

    const addCertification = () => {
      onUpdate([...certifications, { 
        id: `cert-${Date.now()}`, 
        title: '', 
        issuer: '', 
        date: '', 
        description: '' 
      }]);
    };

    const removeCertification = (certId: string) => {
      onUpdate(certifications.filter((cert: any) => cert.id !== certId));
    };

    const updateCertification = (certId: string, field: string, value: any) => {
      const updated = certifications.map((cert: any) => 
        cert.id === certId ? { ...cert, [field]: value } : cert
      );
      onUpdate(updated);
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-end mb-6">
          <button
            onClick={addCertification}
            className="flex items-center space-x-2 px-4 py-2 bg-brand-cyan text-brand-black rounded-lg hover:bg-brand-cyan/90 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Add {section.type === 'certifications' ? 'Certification' : 'Award'}</span>
          </button>
        </div>

        {certifications.length === 0 ? (
          <div className="text-center py-12 text-brand-gray">
            <p>No {section.type} added yet. Click "Add {section.type === 'certifications' ? 'Certification' : 'Award'}" to get started.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {certifications.map((cert: any, certIdx: number) => (
              <div key={cert.id} className="p-6 bg-gray-800/50 rounded-xl border border-gray-700 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-brand-cyan">
                    {section.type === 'certifications' ? 'Certification' : 'Award'} #{certIdx + 1}
                  </h3>
                  <button
                    onClick={() => removeCertification(cert.id)}
                    className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-400/10 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-brand-white mb-2">
                      {section.type === 'certifications' ? 'Certification' : 'Award'} Title *
                </label>
                    <input
                      type="text"
                      value={cert.title || ''}
                      onChange={(e) => updateCertification(cert.id, 'title', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 text-brand-white border border-gray-600 rounded-lg focus:outline-none focus:border-brand-cyan"
                      placeholder={section.type === 'certifications' ? 'AWS Certified Solutions Architect' : 'Employee of the Year'}
                />
              </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-white mb-2">
                      {section.type === 'certifications' ? 'Issuing Organization' : 'Awarded By'} *
                    </label>
                    <input
                      type="text"
                      value={cert.issuer || ''}
                      onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 text-brand-white border border-gray-600 rounded-lg focus:outline-none focus:border-brand-cyan"
                      placeholder={section.type === 'certifications' ? 'Amazon Web Services' : 'ABC Corporation'}
                    />
            </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-white mb-2">Date *</label>
                    <input
                      type="text"
                      value={cert.date || ''}
                      onChange={(e) => updateCertification(cert.id, 'date', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 text-brand-white border border-gray-600 rounded-lg focus:outline-none focus:border-brand-cyan"
                      placeholder="August 2023"
                    />
          </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-brand-white mb-2">Description (Optional)</label>
                <textarea
                      value={cert.description || ''}
                      onChange={(e) => updateCertification(cert.id, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-4 py-3 bg-gray-800 text-brand-white border border-gray-600 rounded-lg focus:outline-none focus:border-brand-cyan resize-none"
                      placeholder="Brief description or achievement details..."
                />
              </div>
            </div>
          </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (section.type === 'skills') {
    const skillsData = section.content || { categories: [] };
    const categories = Array.isArray(skillsData.categories) ? skillsData.categories : [];
    const [keywordInput, setKeywordInput] = React.useState<{ [key: string]: string }>({});

    const addCategory = () => {
      const newCategory = { id: `cat-${Date.now()}`, name: '', keywords: [] };
      onUpdate({ categories: [...categories, newCategory] });
    };

    const removeCategory = (catId: string) => {
      onUpdate({ categories: categories.filter((cat: any) => cat.id !== catId) });
    };

    const updateCategoryName = (catId: string, name: string) => {
      const updated = categories.map((cat: any) =>
        cat.id === catId ? { ...cat, name } : cat
      );
      onUpdate({ categories: updated });
    };

    const addKeyword = (catId: string) => {
      const input = keywordInput[catId]?.trim();
      if (!input) return;

      const updated = categories.map((cat: any) =>
        cat.id === catId ? { ...cat, keywords: [...(cat.keywords || []), input] } : cat
      );
      onUpdate({ categories: updated });
      setKeywordInput({ ...keywordInput, [catId]: '' });
    };

    const removeKeyword = (catId: string, keywordIdx: number) => {
      const updated = categories.map((cat: any) =>
        cat.id === catId
          ? { ...cat, keywords: cat.keywords.filter((_: string, i: number) => i !== keywordIdx) }
          : cat
      );
      onUpdate({ categories: updated });
    };

    const handleKeywordKeyPress = (e: React.KeyboardEvent, catId: string) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addKeyword(catId);
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-end mb-6">
            <button
            onClick={addCategory}
            className="flex items-center space-x-2 px-4 py-2 bg-brand-cyan text-brand-black rounded-lg hover:bg-brand-cyan/90 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
              </div>

        {categories.length === 0 ? (
          <div className="text-center py-12 text-brand-gray">
            <p>No skill categories added yet. Click "Add Category" to get started.</p>
            </div>
        ) : (
          <div className="space-y-6">
            {categories.map((cat: any, catIdx: number) => (
              <div key={cat.id} className="p-6 bg-gray-800/50 rounded-xl border border-gray-700 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-brand-cyan">Category #{catIdx + 1}</h3>
                  <button
                    onClick={() => removeCategory(cat.id)}
                    className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-400/10 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
          </div>

                <div>
                  <label className="block text-sm font-medium text-brand-white mb-2">Category Name *</label>
                  <input
                    type="text"
                    value={cat.name || ''}
                    onChange={(e) => updateCategoryName(cat.id, e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 text-brand-white border border-gray-600 rounded-lg focus:outline-none focus:border-brand-cyan"
                    placeholder="Technical Skills"
                />
              </div>

                <div>
                  <label className="block text-sm font-medium text-brand-white mb-2">Keywords/Skills *</label>
                  
                  {/* Tag Display */}
                  {cat.keywords && cat.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3 p-3 bg-gray-900 rounded-lg border border-gray-600">
                      {cat.keywords.map((keyword: string, idx: number) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-3 py-1 bg-brand-cyan/20 text-brand-cyan rounded-full text-sm border border-brand-cyan/30"
                        >
                          {keyword}
                          <button
                            onClick={() => removeKeyword(cat.id, idx)}
                            className="ml-2 hover:text-red-400 transition-colors"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
            </div>
                  )}

                  {/* Tag Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={keywordInput[cat.id] || ''}
                      onChange={(e) => setKeywordInput({ ...keywordInput, [cat.id]: e.target.value })}
                      onKeyPress={(e) => handleKeywordKeyPress(e, cat.id)}
                      className="flex-1 px-4 py-3 bg-gray-800 text-brand-white border border-gray-600 rounded-lg focus:outline-none focus:border-brand-cyan"
                      placeholder="Type a skill and press Enter or click Add"
                    />
            <button
                      onClick={() => addKeyword(cat.id)}
                      className="px-4 py-3 bg-brand-cyan text-brand-black rounded-lg hover:bg-brand-cyan/90 transition-colors font-medium"
                    >
                      Add
            </button>
          </div>
                  <p className="text-gray-400 text-xs mt-2">
                    Press Enter or click "Add" to add each skill as a tag. Click the ✕ to remove.
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Add more section types as needed
  return (
    <div className="text-brand-white text-center py-12">
      <p className="text-brand-gray text-lg">Editor for {section.type} coming soon...</p>
    </div>
  );
}

// Resume Preview Component - Matches LaTeX template styling
function ResumePreview({ sections, templateId }: { sections: ResumeSection[]; templateId: string }) {
  // Extract personal info with memoization to ensure proper updates
  const { displayName, displayContact } = useMemo(() => {
    const personalInfoSection = sections.find((s) => s.type === 'personal-info');
    const personalInfo = personalInfoSection?.content || {};

    // Build contact info line
    const contactParts = [];
    if (personalInfo.email) contactParts.push(personalInfo.email);
    if (personalInfo.phone) contactParts.push(personalInfo.phone);
    if (personalInfo.location) contactParts.push(personalInfo.location);
    if (personalInfo.linkedin) contactParts.push(personalInfo.linkedin);
    const contactLine = contactParts.join(' | ');

    return {
      displayName: (personalInfo.fullName && personalInfo.fullName.trim()),
      displayContact: contactLine || ''
    };
  }, [sections]);

  // Template-specific styles - matches LaTeX Liberation Serif output
  const isModern = templateId === 'modern';
  const fontFamily = isModern ? 'Arial, Helvetica, sans-serif' : 'Tinos, Liberation Serif, Times New Roman, Georgia, serif';
  const nameSize = isModern ? '28pt' : '20pt';
  const headerAlign = isModern ? 'left' : 'center';

  return (
    <div style={{ 
      fontFamily: '"Tinos", "Liberation Serif", "Times New Roman", Georgia, serif', 
      fontSize: '11pt', 
      lineHeight: '1.3', 
      color: '#000000',
      width: '100%',
      minHeight: '800px',
      paddingTop: '0px'
    }}>
      {/* Header */}
      <div style={{ 
        textAlign: headerAlign as 'left' | 'center', 
        marginBottom: '20px',
        paddingBottom: '8px',
        marginTop: '0px',
        borderBottom: displayContact ? '1px solid #e0e0e0' : 'none'
      }}>
        {/* Name */}
        <h1 
          style={{ 
            fontFamily: '"Tinos", "Liberation Serif", "Times New Roman", Georgia, serif',
            fontSize: nameSize, 
            color: '#000000',
            fontWeight: 'bold',
            letterSpacing: '0.01em',
            margin: '0',
            marginTop: '0',
            padding: '0',
            lineHeight: '1.2'
          }}
        >
          {displayName}
        </h1>
        
        {/* Contact Info */}
        {displayContact && (
          <div style={{ 
            fontSize: '10pt', 
            color: '#000000',
            marginTop: '6px',
            lineHeight: '1.4'
          }}>
            {displayContact}
          </div>
        )}
              </div>

      {/* Sections - Match LaTeX formatting */}
      {sections.slice(1).map((section) => {
        if (!section.content || (section.content.text === '' && section.content.text !== undefined)) {
          return null; // Don't show empty sections
        }

        return (
          <div key={section.id} style={{ marginTop: '20px', marginBottom: '20px' }}>
            {/* Section Header - ALL BLACK */}
            <div style={{ marginBottom: '10px' }}>
              <h2 
                style={{ 
                  fontSize: isModern ? '14pt' : '13pt', 
                  marginBottom: '5px',
                  margin: '0 0 5px 0',
                  padding: '0',
                  color: '#000000',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                {section.title}
              </h2>
              <div 
                style={{ 
                  borderBottom: `${isModern ? '2pt' : '0.8pt'} solid #000000`,
                  width: '100%',
                  marginTop: '5px'
                }}
              ></div>
          </div>

            {/* Section Content */}
            <div style={{ fontSize: '11pt', marginTop: '10px' }}>
              {section.type === 'professional-summary' || section.type === 'career-objective' ? (
                <p style={{ color: '#000000', lineHeight: '1.5', margin: '0', padding: '0' }}>
                  {section.content.text || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Click section to add content...</span>}
                </p>
              ) : section.type === 'experience' || section.type === 'leadership' ? (
                <div>
                  {section.content.length > 0 ? (
                    section.content.map((exp: any, idx: number) => (
                      <div key={idx} style={{ marginBottom: '1.2em' }}>
                        {/* Company on left, Location on right */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '11pt' }}>
                            {exp.company || 'COMPANY NAME'}
                          </div>
                          <div style={{ color: '#000000', textAlign: 'right', fontSize: '11pt', fontWeight: 'bold' }}>
                            {exp.location || ''}
                          </div>
                        </div>
                        {/* Role on left, Dates on right */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '2px' }}>
                          <div>
                            <div style={{ fontWeight: 'bold' }}>
                              {exp.role || 'Role Title'}
                            </div>
                            {exp.additionalRole && (
                              <div style={{ fontWeight: 'bold', marginTop: '1px' }}>
                                {exp.additionalRole}
                              </div>
                            )}
                          </div>
                          <div style={{ color: '#000000', textAlign: 'right', fontSize: '11pt', fontWeight: 'bold' }}>
                            {exp.startDate && exp.endDate ? `${exp.startDate} - ${exp.endDate}` : exp.endDate || exp.startDate || ''}
                          </div>
                        </div>
                        {/* Bullets */}
                        {exp.bullets && exp.bullets.length > 0 && (
                          <ul style={{ listStyleType: 'disc', marginLeft: '20px', marginTop: '6px', lineHeight: '1.4', padding: '0' }}>
                            {exp.bullets.map((bullet: any, bidx: number) => {
                              const bulletText = typeof bullet === 'string' ? bullet : bullet.text;
                              return bulletText && <li key={bidx} style={{ color: '#000000', marginBottom: '3px' }}>{bulletText}</li>;
                            })}
                          </ul>
                        )}
                      </div>
                    ))
                  ) : (
                    <p style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '0.9em' }}>Click section to add {section.title.toLowerCase()}...</p>
                  )}
          </div>
              ) : section.type === 'education' ? (
                <div>
                  {section.content.length > 0 ? (
                    section.content.map((edu: any, idx: number) => (
                      <div key={idx} style={{ marginBottom: '12px' }}>
                        {/* University on left, Location on right */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '11pt' }}>
                            {edu.institution || 'UNIVERSITY NAME'}
                          </div>
                          <div style={{ color: '#000000', textAlign: 'right', fontSize: '11pt', fontWeight: 'bold' }}>
                            {edu.location || ''}
                          </div>
                        </div>
                        {/* Degree details on left, Year on right */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '2px' }}>
                          <div style={{ fontStyle: 'italic' }}>
                            {edu.degree && <span>{edu.degree}</span>}
                            {edu.field && <span>{edu.degree ? ' in ' : ''}{edu.field}</span>}
                            {edu.gpa && <span> (GPA: {edu.gpa})</span>}
                          </div>
                          <div style={{ color: '#000000', textAlign: 'right', fontSize: '11pt', minWidth: '100px', fontWeight: 'bold' }}>
                            {edu.startDate && edu.endDate ? `${edu.startDate} - ${edu.endDate}` : edu.endDate || edu.startDate || ''}
              </div>
            </div>
          </div>
                    ))
                  ) : (
                    <p style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '0.9em' }}>Click section to add education...</p>
                  )}
                </div>
              ) : section.type === 'skills' ? (
                <div>
                  {section.content.categories && section.content.categories.length > 0 ? (
                    <div style={{ color: '#000000', lineHeight: '1.5' }}>
                      {section.content.categories.map((cat: any, idx: number) => (
                        cat.keywords && cat.keywords.length > 0 && (
                          <div key={idx} style={{ marginBottom: idx < section.content.categories.length - 1 ? '6px' : '0' }}>
                            {cat.name && <span style={{ fontWeight: 'bold' }}>{cat.name}: </span>}
                            {cat.keywords.join(', ')}
                          </div>
                        )
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '0.9em' }}>Click section to add skills...</p>
                  )}
                </div>
              ) : section.type === 'projects' ? (
                <div>
                  {section.content.length > 0 ? (
                    <ul style={{ listStyleType: 'disc', marginLeft: '20px', padding: '0', lineHeight: '1.4' }}>
                      {section.content.map((proj: any, idx: number) => (
                        <li key={idx} style={{ marginBottom: '0.8em', color: '#000000' }}>
                          {/* Project Name with Link and Technologies on same line */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <span style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                                {proj.name || 'PROJECT NAME'}
                              </span>
                              {proj.link && (
                                <span style={{ fontWeight: 'normal' }}>
                                  (<a href={proj.link} style={{ color: '#0066cc', textDecoration: 'none' }}>Link</a>)
                                </span>
                              )}
                            </div>
                            {proj.technologies && (
                              <div style={{ fontStyle: 'italic', fontSize: '11pt', textAlign: 'right', marginLeft: '20px' }}>
                                {proj.technologies}
                              </div>
                            )}
                          </div>
                          {/* Description */}
                          {proj.description && (
                            <div style={{ marginTop: '4px', lineHeight: '1.4' }}>
                              {proj.description}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '0.9em' }}>Click section to add projects...</p>
                  )}
                </div>
              ) : section.type === 'certifications' || section.type === 'awards' ? (
                <div>
                  {section.content.length > 0 ? (
                    section.content.map((cert: any, idx: number) => (
                      <div key={idx} style={{ marginBottom: '0.8em' }}>
                        {/* Title on left, Date on right */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ fontWeight: 'bold', flex: 1 }}>
                            {cert.title || 'Certification Title'}
                          </div>
                          <div style={{ color: '#000000', textAlign: 'right', fontSize: '10.5pt', fontWeight: 'bold', minWidth: '100px' }}>
                            {cert.date || ''}
                          </div>
                        </div>
                        {/* Issuer */}
                        {cert.issuer && (
                          <div style={{ fontStyle: 'italic', marginTop: '2px' }}>
                            {cert.issuer}
                          </div>
                        )}
                        {/* Description */}
                        {cert.description && (
                          <div style={{ marginTop: '4px', lineHeight: '1.4' }}>
                            {cert.description}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '0.9em' }}>Click section to add {section.title.toLowerCase()}...</p>
                  )}
                </div>
              ) : (
                <p style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '0.9em' }}>
                  Click section to add content...
                </p>
              )}
            </div>
          </div>
        );
      })}

      {/* Show message if only personal info exists */}
      {/* {sections.length === 1 && (
        <div style={{ textAlign: 'center', marginTop: '30px', color: '#9ca3af' }}>
          <p style={{ fontSize: '0.9em', fontStyle: 'italic', margin: '0' }}>Click "Add Section" to build your resume</p>
        </div>
      )} */}
    </div>
  );
}
