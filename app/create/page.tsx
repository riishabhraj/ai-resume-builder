'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FileText, Plus, Upload, Edit2, Trash2, Download, Loader2, BarChart3, Linkedin, Github, Target } from 'lucide-react';
import Link from 'next/link';
import { getAllTemplates, getDefaultTemplateId } from '@/lib/templates';
import MonthYearPicker from '@/components/MonthYearPicker';
import { DownloadPdfButton } from '@/components/DownloadPdfButton';
import TailorToJobModal from '@/components/TailorToJobModal';

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
        github: '',
        website: '',
      },
    },
  ]);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [previewKey, setPreviewKey] = useState(0);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [exportHtml, setExportHtml] = useState('');
  const [showTailorModal, setShowTailorModal] = useState(false);

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

  // Helper function to get icon for a section type
  const getSectionIcon = (sectionType: SectionType | string) => {
    if (sectionType === 'personal-info') return '👤';
    const template = SECTION_TEMPLATES.find((s) => s.type === sectionType);
    return template?.icon || '📄';
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const timeout = setTimeout(() => {
      if (previewRef.current) {
        // Extract only the ResumePreview content with data-resume-preview attribute
        // This preserves all inline styles from the preview
        const previewContent = previewRef.current.querySelector('[data-resume-preview]');
        if (previewContent) {
          // Clone the element to preserve all styles
          const cloned = previewContent.cloneNode(true) as HTMLElement;
          // Keep padding/margin as they define the layout spacing
          // Only remove visual wrapper styles that shouldn't be in PDF
          cloned.style.borderRadius = '0';
          cloned.style.boxShadow = 'none';
          cloned.style.border = 'none';
          // Ensure font is explicitly set
          cloned.style.fontFamily = '"Tinos", "Liberation Serif", "Times New Roman", Georgia, serif';
          setExportHtml(cloned.outerHTML);
        } else {
          // Fallback: get innerHTML but log a warning
          console.warn('Could not find [data-resume-preview], using fallback');
          setExportHtml(previewRef.current.innerHTML);
        }
      }
    }, 500); // Longer delay to ensure DOM, fonts, and SVG icons are fully rendered
    return () => clearTimeout(timeout);
  }, [sections, selectedTemplate, previewKey]);

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
    <div className="h-screen flex flex-col animated-gradient aurora" data-theme="atsbuilder">
      {/* Header */}
      <header className="glass border-b neon-border px-6 py-4 flex items-center justify-between shadow-2xl backdrop-blur-xl">
        <div className="flex items-center space-x-6">
          <Link
            href="/"
            className="flex items-center space-x-2 text-brand-gray-text hover:text-brand-purple-light transition-all duration-300 group"
          >
            <span className="text-xl group-hover:transform group-hover:-translate-x-1 transition-transform">←</span>
            <span className="font-semibold">Back to Home</span>
          </Link>
          <div className="h-8 w-px bg-gradient-to-b from-transparent via-brand-purple/50 to-transparent"></div>
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-cyan via-brand-purple to-brand-pink flex items-center justify-center shadow-xl glow-purple">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-black gradient-text tracking-wide">ResuCraft</h1>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowTailorModal(true)}
            className="group px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center bg-gradient-to-r from-brand-green via-brand-cyan to-brand-green-light hover:scale-105 text-white border-2 border-brand-green/30 glow-green"
          >
            <Target className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
            Tailor to Job
          </button>
          <DownloadPdfButton
            html={exportHtml}
            filename="resume.pdf"
            className="group px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center bg-gradient-to-r from-brand-purple via-brand-pink to-brand-purple-light hover:scale-105 text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 border-2 border-brand-pink/30 glow-pink"
            label="Download PDF"
          />
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Sections */}
        <div className="w-80 glass border-r neon-border flex flex-col custom-scrollbar backdrop-blur-xl">
          <div className="p-6 border-b border-brand-purple/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple/10 rounded-full blur-2xl"></div>
            <div className="relative">
              <h2 className="text-xl font-black mb-2 flex items-center">
                <span className="w-1 h-6 bg-gradient-to-b from-brand-cyan via-brand-purple to-brand-pink rounded-full mr-3 shadow-lg"></span>
                <span className="gradient-text-purple">Resume Sections</span>
              </h2>
              <p className="text-sm text-brand-gray-text font-medium">Click any section to edit</p>
            </div>
                </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {sections.map((section) => (
              <div
                key={section.id}
                onClick={() => setEditingSection(section.id)}
                className={`group flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all duration-300 ${
                  editingSection === section.id
                    ? 'bg-gradient-to-r from-brand-purple/20 via-brand-pink/20 to-brand-cyan/20 border-2 neon-border shadow-2xl scale-[1.03]'
                    : 'bg-brand-dark-card/50 border-2 border-brand-purple/10 hover:border-brand-purple/30 hover:bg-brand-dark-card/70 hover:scale-[1.02] backdrop-blur-sm'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 text-2xl ${
                    section.id === 'personal-info' 
                      ? 'bg-gradient-to-br from-brand-pink via-brand-purple to-brand-pink-dark shadow-xl glow-pink' 
                      : editingSection === section.id
                        ? 'bg-gradient-to-br from-brand-cyan via-brand-green to-brand-cyan-dark shadow-xl glow-cyan'
                        : 'bg-gradient-to-br from-brand-dark-surface to-brand-dark-bg border-2 border-brand-purple/20'
                  }`}>
                    {getSectionIcon(section.type)}
                </div>
                  <span className="text-brand-white font-semibold group-hover:text-brand-cyan transition-colors">{section.title}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {section.id === 'personal-info' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingSection(section.id);
                      }}
                      className="text-brand-cyan hover:text-brand-cyan-light p-2 rounded-lg hover:bg-brand-cyan/10 transition-all hover:scale-110"
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
                      className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/20 transition-all hover:scale-110"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-brand-purple/20 space-y-3 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark-bg/80 to-transparent"></div>
            <button
              onClick={() => setShowAddSection(true)}
              className="relative group w-full flex items-center justify-center space-x-2 p-4 rounded-2xl bg-gradient-to-r from-brand-purple/20 via-brand-pink/20 to-brand-purple/20 border-2 border-dashed border-brand-purple/50 hover:border-brand-pink hover:shadow-xl glow-purple text-brand-white transition-all duration-300 hover:scale-[1.03] font-bold backdrop-blur-sm"
            >
              <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300 text-brand-pink-light" />
              <span className="gradient-text-purple">Add Section</span>
            </button>
            <button className="relative group w-full flex items-center justify-center space-x-2 p-4 rounded-2xl bg-gradient-to-r from-brand-cyan/10 to-brand-green/10 border-2 border-brand-cyan/30 hover:border-brand-cyan hover:shadow-xl glow-cyan text-brand-white transition-all duration-300 hover:scale-[1.03] font-bold backdrop-blur-sm">
              <Upload className="w-6 h-6 group-hover:translate-y-0.5 transition-transform duration-300 text-brand-cyan-light" />
              <span className="gradient-text-green">Import from PDF</span>
            </button>
          </div>
        </div>

        {/* Main Content - Full Preview */}
        <div className="flex-1 flex items-start justify-center overflow-y-auto p-8 relative custom-scrollbar">
          {/* Background effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-purple/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-cyan/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>
          
          <div className="w-full max-w-[850px] relative z-10">
            <div className="mb-8 text-center">
              <div className="inline-flex items-center space-x-3 px-6 py-3 rounded-2xl glass border neon-border backdrop-blur-xl">
                <span className="w-3 h-3 bg-gradient-to-r from-brand-green to-brand-cyan rounded-full animate-pulse shadow-lg glow-green"></span>
                <p className="text-sm font-bold gradient-text-green">Preview Mode • PDF will have exact layout</p>
              </div>
            </div>
            <div
              ref={previewRef}
              className="bg-white rounded-3xl shadow-2xl glow-purple p-16 min-h-[1100px] border-4 neon-border"
              style={{ fontFamily: '"Tinos", "Liberation Serif", "Times New Roman", Georgia, serif' }}
            >
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
          <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 p-4">
            <div className="relative glass rounded-4xl max-w-4xl w-full max-h-[90vh] border-2 neon-border shadow-2xl flex flex-col overflow-hidden">
              {/* Decorative orbs */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-purple/20 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-cyan/20 rounded-full blur-3xl pointer-events-none"></div>
              
              {/* Header - Fixed */}
              <div className="relative p-6 border-b border-brand-purple/30 flex items-center justify-between flex-shrink-0 backdrop-blur-xl">
                <h2 className="text-3xl font-black flex items-center">
                  <span className="w-1.5 h-10 bg-gradient-to-b from-brand-cyan via-brand-purple via-brand-pink to-brand-green rounded-full mr-4 shadow-lg animate-pulse"></span>
                  <span className="gradient-text">{currentSection.title}</span>
                </h2>
                <button
                  onClick={() => setEditingSection(null)}
                  className="text-brand-gray-text hover:text-brand-white p-3 rounded-xl hover:bg-brand-dark-surface border border-transparent hover:border-brand-cyan/30 transition-all text-2xl hover:rotate-90 duration-300"
                >
                  ✕
                </button>
          </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <SectionEditor
                  section={currentSection}
                  onUpdate={(content) => handleUpdateSection(editingSection, content)}
                />
              </div>
              
              {/* Footer - Fixed */}
              <div className="relative p-6 border-t border-brand-purple/30 flex justify-end space-x-4 flex-shrink-0 backdrop-blur-xl">
                <button
                  onClick={() => setEditingSection(null)}
                  className="px-8 py-3 rounded-2xl font-bold bg-gradient-to-r from-brand-dark-surface to-brand-dark-bg border-2 border-brand-purple/30 hover:border-brand-purple/60 text-brand-white transition-all hover:scale-105 backdrop-blur-sm"
                >
                  Close
                </button>
                <button
                  onClick={() => setEditingSection(null)}
                  className="px-8 py-3 rounded-2xl font-bold bg-gradient-to-r from-brand-purple via-brand-pink to-brand-purple-light hover:shadow-2xl glow-pink text-white transition-all hover:scale-105 border-2 border-brand-pink/30"
                >
                  ✓ Save Changes
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Add Section Modal */}
      {showAddSection && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 p-4">
          <div className="relative glass rounded-4xl max-w-5xl w-full max-h-[85vh] border-2 neon-border shadow-2xl flex flex-col overflow-hidden">
            {/* Decorative orbs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-brand-green/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-pink/20 rounded-full blur-3xl pointer-events-none"></div>
            
            {/* Header - Fixed */}
            <div className="relative p-6 border-b border-brand-purple/30 flex items-center justify-between flex-shrink-0 backdrop-blur-xl">
              <h2 className="text-3xl font-black flex items-center">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-purple via-brand-pink to-brand-cyan flex items-center justify-center mr-4 shadow-xl glow-pink">
                  <Plus className="w-7 h-7 text-white" />
                </div>
                <span className="gradient-text">Add Content</span>
              </h2>
              <button
                onClick={() => setShowAddSection(false)}
                className="text-brand-gray-text hover:text-brand-white p-3 rounded-xl hover:bg-brand-dark-surface border border-transparent hover:border-brand-cyan/30 transition-all text-2xl hover:rotate-90 duration-300"
              >
                ✕
              </button>
          </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {SECTION_TEMPLATES.map((template, index) => {
                  const colors = [
                    { from: 'brand-purple', to: 'brand-pink', glow: 'glow-purple' },
                    { from: 'brand-cyan', to: 'brand-green', glow: 'glow-cyan' },
                    { from: 'brand-pink', to: 'brand-purple', glow: 'glow-pink' },
                    { from: 'brand-green', to: 'brand-cyan', glow: 'glow-green' },
                  ];
                  const colorSet = colors[index % colors.length];
                  
                  return (
                    <button
                      key={template.type}
                      onClick={() => handleAddSection(template.type)}
                      className={`group relative p-7 rounded-3xl glass border-2 border-${colorSet.from}/20 hover:border-${colorSet.from}/60 hover:shadow-2xl ${colorSet.glow} text-left transition-all duration-300 hover:scale-[1.05] backdrop-blur-sm overflow-hidden`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br from-${colorSet.from}/5 to-${colorSet.to}/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl`}></div>
                      <div className="relative">
                        <div className="text-5xl mb-5 group-hover:scale-125 group-hover:rotate-6 transition-all duration-300">{template.icon}</div>
                        <h3 className={`text-xl font-black text-brand-white mb-3 group-hover:bg-gradient-to-r group-hover:from-${colorSet.from} group-hover:to-${colorSet.to} group-hover:bg-clip-text group-hover:text-transparent transition-all`}>
                          {template.title}
                        </h3>
                        <p className="text-sm text-brand-gray-text leading-relaxed">{template.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tailor to Job Modal */}
      <TailorToJobModal
        isOpen={showTailorModal}
        onClose={() => setShowTailorModal(false)}
        sections={sections}
        onTailorComplete={(tailoredSections) => {
          console.log('=== onTailorComplete CALLED ===');
          console.log('Received sections:', tailoredSections.length);
          console.log('Sections structure:', tailoredSections.map(s => ({ id: s.id, type: s.type, title: s.title })));
          
          // Validate sections before setting
          if (!tailoredSections || !Array.isArray(tailoredSections) || tailoredSections.length === 0) {
            console.error('Invalid sections received in onTailorComplete');
            return;
          }
          
          setSections(tailoredSections);
          setPreviewKey(prev => prev + 1);
          
          console.log('Sections updated, preview key incremented');
        }}
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
            <label className="block text-sm font-semibold text-brand-white mb-3 flex items-center">
              <span className="w-1 h-4 bg-gradient-to-b from-brand-cyan to-brand-purple rounded-full mr-2"></span>
              Full Name *
            </label>
                  <input
                    type="text"
              value={section.content.fullName || ''}
              onChange={(e) => onUpdate({ ...section.content, fullName: e.target.value })}
              className="w-full px-4 py-3 bg-brand-dark-bg text-brand-white border-2 border-brand-cyan/20 rounded-xl focus:outline-none focus:border-brand-cyan focus:shadow-lg focus:shadow-brand-cyan/20 transition-all"
              placeholder="John Doe"
                  />
                </div>
          <div>
            <label className="block text-sm font-semibold text-brand-white mb-3 flex items-center">
              <span className="w-1 h-4 bg-gradient-to-b from-brand-cyan to-brand-purple rounded-full mr-2"></span>
              Professional Title *
            </label>
                  <input
                    type="text"
              value={section.content.title || ''}
              onChange={(e) => onUpdate({ ...section.content, title: e.target.value })}
              className="w-full px-4 py-3 bg-brand-dark-bg text-brand-white border-2 border-brand-cyan/20 rounded-xl focus:outline-none focus:border-brand-cyan focus:shadow-lg focus:shadow-brand-cyan/20 transition-all"
              placeholder="Software Engineer"
                  />
                </div>
          <div>
            <label className="block text-sm font-semibold text-brand-white mb-3 flex items-center">Email</label>
                  <input
                    type="email"
              value={section.content.email || ''}
              onChange={(e) => onUpdate({ ...section.content, email: e.target.value })}
              className="w-full px-4 py-3 bg-brand-dark-bg text-brand-white border-2 border-brand-cyan/20 rounded-xl focus:outline-none focus:border-brand-cyan focus:shadow-lg focus:shadow-brand-cyan/20 transition-all"
              placeholder="john@example.com"
                  />
                </div>
          <div>
            <label className="block text-sm font-semibold text-brand-white mb-3 flex items-center">Phone</label>
                      <input
              type="tel"
              value={section.content.phone || ''}
              onChange={(e) => onUpdate({ ...section.content, phone: e.target.value })}
              className="w-full px-4 py-3 bg-brand-dark-bg text-brand-white border-2 border-brand-cyan/20 rounded-xl focus:outline-none focus:border-brand-cyan focus:shadow-lg focus:shadow-brand-cyan/20 transition-all"
              placeholder="+1 (555) 123-4567"
                      />
                    </div>
          <div>
            <label className="block text-sm font-semibold text-brand-white mb-3 flex items-center">Location</label>
                  <input
                    type="text"
              value={section.content.location || ''}
              onChange={(e) => onUpdate({ ...section.content, location: e.target.value })}
              className="w-full px-4 py-3 bg-brand-dark-bg text-brand-white border-2 border-brand-cyan/20 rounded-xl focus:outline-none focus:border-brand-cyan focus:shadow-lg focus:shadow-brand-cyan/20 transition-all"
              placeholder="San Francisco, CA"
                  />
                </div>
          <div>
            <label className="block text-sm font-semibold text-brand-white mb-3 flex items-center">
              <Linkedin className="w-4 h-4 mr-2 text-brand-cyan" />
              LinkedIn Username
            </label>
            <input
              type="text"
              value={section.content.linkedin || ''}
              onChange={(e) => {
                // Remove any URL parts and keep only username
                const username = e.target.value.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, '').replace(/\/$/, '').trim();
                onUpdate({ ...section.content, linkedin: username });
              }}
              className="w-full px-4 py-3 bg-brand-dark-bg text-brand-white border-2 border-brand-cyan/20 rounded-xl focus:outline-none focus:border-brand-cyan focus:shadow-lg focus:shadow-brand-cyan/20 transition-all"
              placeholder="johndoe"
                />
              </div>
          <div>
            <label className="block text-sm font-semibold text-brand-white mb-3 flex items-center">
              <Github className="w-4 h-4 mr-2 text-brand-purple" />
              GitHub Username
            </label>
            <input
              type="text"
              value={section.content.github || ''}
              onChange={(e) => {
                // Remove any URL parts and keep only username
                const username = e.target.value.replace(/^https?:\/\/(www\.)?github\.com\//i, '').replace(/\/$/, '').trim();
                onUpdate({ ...section.content, github: username });
              }}
              className="w-full px-4 py-3 bg-brand-dark-bg text-brand-white border-2 border-brand-purple/20 rounded-xl focus:outline-none focus:border-brand-purple focus:shadow-lg focus:shadow-brand-purple/20 transition-all"
              placeholder="johndoe"
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
            className="w-full px-4 py-3 bg-brand-dark-bg text-brand-white border-2 border-brand-cyan/20 rounded-xl focus:outline-none focus:border-brand-cyan focus:shadow-lg focus:shadow-brand-cyan/20 transition-all resize-none"
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
                    <label className="block text-sm font-semibold text-brand-white mb-3 flex items-center">Company *</label>
                <input
                  type="text"
                      value={exp.company || ''}
                      onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                      className="w-full px-4 py-3 bg-brand-dark-bg text-brand-white border-2 border-brand-cyan/20 rounded-xl focus:outline-none focus:border-brand-cyan focus:shadow-lg focus:shadow-brand-cyan/20 transition-all"
                      placeholder="RESUME WORDED CO."
                />
              </div>
                  <div>
                    <label className="block text-sm font-semibold text-brand-white mb-3 flex items-center">Location *</label>
                    <input
                      type="text"
                      value={exp.location || ''}
                      onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                      className="w-full px-4 py-3 bg-brand-dark-bg text-brand-white border-2 border-brand-cyan/20 rounded-xl focus:outline-none focus:border-brand-cyan focus:shadow-lg focus:shadow-brand-cyan/20 transition-all"
                      placeholder="New York, NY"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-brand-white mb-3 flex items-center">Role/Title *</label>
                    <input
                      type="text"
                      value={exp.role || ''}
                      onChange={(e) => updateExperience(exp.id, 'role', e.target.value)}
                      className="w-full px-4 py-3 bg-brand-dark-bg text-brand-white border-2 border-brand-cyan/20 rounded-xl focus:outline-none focus:border-brand-cyan focus:shadow-lg focus:shadow-brand-cyan/20 transition-all"
                      placeholder="Product Manager"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-brand-white mb-3 flex items-center">Additional Role (Optional)</label>
                    <input
                      type="text"
                      value={exp.additionalRole || ''}
                      onChange={(e) => updateExperience(exp.id, 'additionalRole', e.target.value)}
                      className="w-full px-4 py-3 bg-brand-dark-bg text-brand-white border-2 border-brand-cyan/20 rounded-xl focus:outline-none focus:border-brand-cyan focus:shadow-lg focus:shadow-brand-cyan/20 transition-all"
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
                              className="flex-1 px-4 py-3 bg-brand-dark-bg text-brand-white border-2 border-brand-cyan/20 rounded-xl focus:outline-none focus:border-brand-cyan focus:shadow-lg focus:shadow-brand-cyan/20 transition-all resize-y"
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
                    <label className="block text-sm font-semibold text-brand-white mb-3 flex items-center">Project Name *</label>
                      <input
                        type="text"
                      value={proj.name || ''}
                      onChange={(e) => updateProject(proj.id, 'name', e.target.value)}
                      className="w-full px-4 py-3 bg-brand-dark-bg text-brand-white border-2 border-brand-cyan/20 rounded-xl focus:outline-none focus:border-brand-cyan focus:shadow-lg focus:shadow-brand-cyan/20 transition-all"
                      placeholder="E-Commerce Platform"
                      />
                    </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-brand-white mb-3 flex items-center">Description</label>
                    <textarea
                      value={proj.description || ''}
                      onChange={(e) => updateProject(proj.id, 'description', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-brand-dark-bg text-brand-white border-2 border-brand-cyan/20 rounded-xl focus:outline-none focus:border-brand-cyan focus:shadow-lg focus:shadow-brand-cyan/20 transition-all resize-none"
                      placeholder="Developed a full-stack e-commerce platform with payment integration..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-brand-white mb-3 flex items-center">Technologies/Tools *</label>
                      <input
                        type="text"
                      value={proj.technologies || ''}
                      onChange={(e) => updateProject(proj.id, 'technologies', e.target.value)}
                      className="w-full px-4 py-3 bg-brand-dark-bg text-brand-white border-2 border-brand-cyan/20 rounded-xl focus:outline-none focus:border-brand-cyan focus:shadow-lg focus:shadow-brand-cyan/20 transition-all"
                      placeholder="React, Redux, Express.js, MongoDB, OAuth, Nodemailer, Redis, Cloudinary"
                    />
                    <p className="text-gray-400 text-xs mt-1">Separate multiple technologies with commas</p>
                    </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-brand-white mb-3 flex items-center">Project Link (Optional)</label>
                    <input
                      type="url"
                      value={proj.link || ''}
                      onChange={(e) => updateProject(proj.id, 'link', e.target.value)}
                      className="w-full px-4 py-3 bg-brand-dark-bg text-brand-white border-2 border-brand-cyan/20 rounded-xl focus:outline-none focus:border-brand-cyan focus:shadow-lg focus:shadow-brand-cyan/20 transition-all"
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
                    <label className="block text-sm font-semibold text-brand-white mb-3 flex items-center">Institution/University *</label>
                      <input
                        type="text"
                      value={edu.institution || ''}
                      onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                      className="w-full px-4 py-3 bg-brand-dark-bg text-brand-white border-2 border-brand-cyan/20 rounded-xl focus:outline-none focus:border-brand-cyan focus:shadow-lg focus:shadow-brand-cyan/20 transition-all"
                      placeholder="Harvard University"
                      />
                    </div>
                  <div>
                    <label className="block text-sm font-semibold text-brand-white mb-3 flex items-center">Degree *</label>
                      <input
                        type="text"
                      value={edu.degree || ''}
                      onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                      className="w-full px-4 py-3 bg-brand-dark-bg text-brand-white border-2 border-brand-cyan/20 rounded-xl focus:outline-none focus:border-brand-cyan focus:shadow-lg focus:shadow-brand-cyan/20 transition-all"
                      placeholder="Bachelor of Science"
                      />
                    </div>
                  <div>
                    <label className="block text-sm font-semibold text-brand-white mb-3 flex items-center">Field of Study</label>
                      <input
                        type="text"
                      value={edu.field || ''}
                      onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                      className="w-full px-4 py-3 bg-brand-dark-bg text-brand-white border-2 border-brand-cyan/20 rounded-xl focus:outline-none focus:border-brand-cyan focus:shadow-lg focus:shadow-brand-cyan/20 transition-all"
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
                    <label className="block text-sm font-semibold text-brand-white mb-3 flex items-center">GPA (Optional)</label>
                    <input
                      type="text"
                      value={edu.gpa || ''}
                      onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                      className="w-full px-4 py-3 bg-brand-dark-bg text-brand-white border-2 border-brand-cyan/20 rounded-xl focus:outline-none focus:border-brand-cyan focus:shadow-lg focus:shadow-brand-cyan/20 transition-all"
                      placeholder="3.8/4.0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-brand-white mb-3 flex items-center">Location (Optional)</label>
                    <input
                      type="text"
                      value={edu.location || ''}
                      onChange={(e) => updateEducation(edu.id, 'location', e.target.value)}
                      className="w-full px-4 py-3 bg-brand-dark-bg text-brand-white border-2 border-brand-cyan/20 rounded-xl focus:outline-none focus:border-brand-cyan focus:shadow-lg focus:shadow-brand-cyan/20 transition-all"
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
                    <label className="block text-sm font-semibold text-brand-white mb-3 flex items-center">
                      {section.type === 'certifications' ? 'Certification' : 'Award'} Title *
                </label>
                    <input
                      type="text"
                      value={cert.title || ''}
                      onChange={(e) => updateCertification(cert.id, 'title', e.target.value)}
                      className="w-full px-4 py-3 bg-brand-dark-bg text-brand-white border-2 border-brand-cyan/20 rounded-xl focus:outline-none focus:border-brand-cyan focus:shadow-lg focus:shadow-brand-cyan/20 transition-all"
                      placeholder={section.type === 'certifications' ? 'AWS Certified Solutions Architect' : 'Employee of the Year'}
                />
              </div>
                  <div>
                    <label className="block text-sm font-semibold text-brand-white mb-3 flex items-center">
                      {section.type === 'certifications' ? 'Issuing Organization' : 'Awarded By'} *
                    </label>
                    <input
                      type="text"
                      value={cert.issuer || ''}
                      onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)}
                      className="w-full px-4 py-3 bg-brand-dark-bg text-brand-white border-2 border-brand-cyan/20 rounded-xl focus:outline-none focus:border-brand-cyan focus:shadow-lg focus:shadow-brand-cyan/20 transition-all"
                      placeholder={section.type === 'certifications' ? 'Amazon Web Services' : 'ABC Corporation'}
                    />
            </div>
                  <div>
                    <label className="block text-sm font-semibold text-brand-white mb-3 flex items-center">Date *</label>
                    <input
                      type="text"
                      value={cert.date || ''}
                      onChange={(e) => updateCertification(cert.id, 'date', e.target.value)}
                      className="w-full px-4 py-3 bg-brand-dark-bg text-brand-white border-2 border-brand-cyan/20 rounded-xl focus:outline-none focus:border-brand-cyan focus:shadow-lg focus:shadow-brand-cyan/20 transition-all"
                      placeholder="August 2023"
                    />
          </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-brand-white mb-3 flex items-center">Description (Optional)</label>
                <textarea
                      value={cert.description || ''}
                      onChange={(e) => updateCertification(cert.id, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-4 py-3 bg-brand-dark-bg text-brand-white border-2 border-brand-cyan/20 rounded-xl focus:outline-none focus:border-brand-cyan focus:shadow-lg focus:shadow-brand-cyan/20 transition-all resize-none"
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
                  <label className="block text-sm font-semibold text-brand-white mb-3 flex items-center">Category Name *</label>
                  <input
                    type="text"
                    value={cat.name || ''}
                    onChange={(e) => updateCategoryName(cat.id, e.target.value)}
                    className="w-full px-4 py-3 bg-brand-dark-bg text-brand-white border-2 border-brand-cyan/20 rounded-xl focus:outline-none focus:border-brand-cyan focus:shadow-lg focus:shadow-brand-cyan/20 transition-all"
                    placeholder="Technical Skills"
                />
              </div>

                <div>
                  <label className="block text-sm font-semibold text-brand-white mb-3 flex items-center">Keywords/Skills *</label>
                  
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
                      className="flex-1 px-4 py-3 bg-brand-dark-bg text-brand-white border-2 border-brand-cyan/20 rounded-xl focus:outline-none focus:border-brand-cyan focus:shadow-lg focus:shadow-brand-cyan/20 transition-all"
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
  const { displayName, displayContact, socialLinks } = useMemo(() => {
    const personalInfoSection = sections.find((s) => s.type === 'personal-info');
    const personalInfo = personalInfoSection?.content || {};

    // Build contact info line
    const contactParts = [];
    if (personalInfo.email) contactParts.push(personalInfo.email);
    if (personalInfo.phone) contactParts.push(personalInfo.phone);
    if (personalInfo.location) contactParts.push(personalInfo.location);
    const contactLine = contactParts.join(' | ');
    
    // Build social links with inline SVG icons (for PDF compatibility)
    const socialLinks = [];
    if (personalInfo.linkedin) {
      const linkedinUrl = `https://www.linkedin.com/in/${personalInfo.linkedin}`;
      socialLinks.push(
        <a 
          key="linkedin"
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#000000', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="12" 
            height="12" 
            viewBox="0 0 24 24" 
            fill="#000000" 
            style={{ display: 'inline-block', verticalAlign: 'middle', width: '12px', height: '12px' }}
          >
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          <span>{personalInfo.linkedin}</span>
        </a>
      );
    }
    if (personalInfo.github) {
      const githubUrl = `https://github.com/${personalInfo.github}`;
      socialLinks.push(
        <a 
          key="github"
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#000000', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="12" 
            height="12" 
            viewBox="0 0 24 24" 
            fill="#000000" 
            style={{ display: 'inline-block', verticalAlign: 'middle', width: '12px', height: '12px' }}
          >
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          <span>{personalInfo.github}</span>
        </a>
      );
    }

    return {
      displayName: (personalInfo.fullName && personalInfo.fullName.trim()),
      displayContact: contactLine || '',
      socialLinks: socialLinks
    };
  }, [sections]);

  // Template-specific styles - matches LaTeX Liberation Serif output
  const isModern = templateId === 'modern';
  const fontFamily = isModern ? 'Arial, Helvetica, sans-serif' : 'Tinos, Liberation Serif, Times New Roman, Georgia, serif';
  const nameSize = isModern ? '28pt' : '20pt';
  const headerAlign = isModern ? 'left' : 'center';

  return (
    <div 
      data-resume-preview
      style={{ 
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
        borderBottom: (displayContact || socialLinks.length > 0) ? '1px solid #e0e0e0' : 'none'
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
        {(displayContact || socialLinks.length > 0) && (
          <div style={{ 
            fontSize: '10pt', 
            color: '#000000',
            marginTop: '6px',
            lineHeight: '1.4',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            {displayContact && <span>{displayContact}</span>}
            {socialLinks.length > 0 && displayContact && <span>|</span>}
            {socialLinks.map((link, idx) => (
              <React.Fragment key={idx}>
                {link}
                {idx < socialLinks.length - 1 && <span>|</span>}
              </React.Fragment>
            ))}
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
