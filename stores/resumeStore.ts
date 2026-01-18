import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StructuredResumeSection, SectionType } from '@/lib/types';

interface ResumeState {
  // Resume data
  resumeId: string | null;
  title: string | null;
  sections: StructuredResumeSection[];
  selectedTemplate: string;
  
  // UI state
  showAddSection: boolean;
  editingSection: string | null;
  showTailorModal: boolean;
  importingPdf: boolean;
  enhancingBullet: string | null;
  keywordInput: { [key: string]: string };
  layoutMode: 'standard' | 'compact';
  
  // Preview/Export
  previewKey: number;
  exportHtml: string;
  pageBreaks: number[];
  
  // Auto-save state
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  lastSavedAt: Date | null;
  
  // Actions
  setResumeId: (id: string | null) => void;
  setTitle: (title: string | null) => void;
  setSections: (sections: StructuredResumeSection[]) => void;
  addSection: (section: StructuredResumeSection) => void;
  updateSection: (id: string, content: any) => void;
  removeSection: (id: string) => void;
  reorderSections: (fromIndex: number, toIndex: number) => void;
  setSelectedTemplate: (templateId: string) => void;
  setShowAddSection: (show: boolean) => void;
  setEditingSection: (id: string | null) => void;
  setShowTailorModal: (show: boolean) => void;
  setImportingPdf: (importing: boolean) => void;
  setEnhancingBullet: (id: string | null) => void;
  setKeywordInput: (key: string, value: string) => void;
  setPreviewKey: (key: number) => void;
  setLayoutMode: (mode: 'standard' | 'compact') => void;
  setExportHtml: (html: string) => void;
  setPageBreaks: (breaks: number[]) => void;
  resetResume: () => void;
  loadResume: (resume: {
    id: string;
    title?: string | null;
    sections: StructuredResumeSection[];
    template_id?: string | null;
  }) => void;
  setSaveStatus: (status: 'idle' | 'saving' | 'saved' | 'error') => void;
  setLastSavedAt: (date: Date | null) => void;
}

const getDefaultPersonalInfo = (): StructuredResumeSection => ({
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
});

const initialState = {
  resumeId: null,
  title: null,
  sections: [getDefaultPersonalInfo()],
  selectedTemplate: 'professional',
  showAddSection: false,
  editingSection: null,
  showTailorModal: false,
  importingPdf: false,
  enhancingBullet: null,
  keywordInput: {},
  previewKey: 0,
  exportHtml: '',
  pageBreaks: [],
  saveStatus: 'idle' as const,
  lastSavedAt: null,
  layoutMode: 'standard' as const,
};

export const useResumeStore = create<ResumeState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setResumeId: (id) => set({ resumeId: id }),
      setTitle: (title) => set({ title }),
      
      setSections: (sections) => set({ sections }),
      
      addSection: (section) => {
        const currentSections = get().sections;
        // Ensure personal-info stays at the top
        if (section.type === 'personal-info') {
          set({ sections: [section, ...currentSections.filter(s => s.type !== 'personal-info')] });
        } else {
          // Find personal-info index
          const personalInfoIndex = currentSections.findIndex(s => s.type === 'personal-info');
          if (personalInfoIndex >= 0) {
            const newSections = [...currentSections];
            newSections.splice(personalInfoIndex + 1, 0, section);
            set({ sections: newSections });
          } else {
            set({ sections: [...currentSections, section] });
          }
        }
      },
      
      updateSection: (id, content) => {
        const sections = get().sections.map(section =>
          section.id === id ? { ...section, content } : section
        );
        set({ sections });
      },
      
      removeSection: (id) => {
        const sections = get().sections.filter(section => section.id !== id);
        set({ sections });
      },
      
      reorderSections: (fromIndex, toIndex) => {
        const sections = [...get().sections];
        const personalInfoIndex = sections.findIndex(s => s.type === 'personal-info');
        
        // Don't allow moving personal-info
        if (sections[fromIndex].type === 'personal-info' || sections[toIndex].type === 'personal-info') {
          return;
        }
        
        // Adjust indices if personal-info is in the way
        let adjustedFrom = fromIndex;
        let adjustedTo = toIndex;
        
        if (personalInfoIndex >= 0) {
          if (fromIndex > personalInfoIndex) adjustedFrom--;
          if (toIndex > personalInfoIndex) adjustedTo--;
        }
        
        const [moved] = sections.splice(fromIndex, 1);
        sections.splice(toIndex, 0, moved);
        
        set({ sections });
      },
      
      setSelectedTemplate: (templateId) => set({ selectedTemplate: templateId }),
      setShowAddSection: (show) => set({ showAddSection: show }),
      setEditingSection: (id) => set({ editingSection: id }),
      setShowTailorModal: (show) => set({ showTailorModal: show }),
      setImportingPdf: (importing) => set({ importingPdf: importing }),
      setEnhancingBullet: (id) => set({ enhancingBullet: id }),
      setKeywordInput: (key, value) => {
        const keywordInput = { ...get().keywordInput, [key]: value };
        set({ keywordInput });
      },
      setPreviewKey: (key) => set({ previewKey: key }),
      setExportHtml: (html) => set({ exportHtml: html }),
      setPageBreaks: (breaks) => set({ pageBreaks: breaks }),
      setLayoutMode: (mode) => set({ layoutMode: mode }),
      
      resetResume: () => set({
        ...initialState,
        sections: [getDefaultPersonalInfo()],
      }),
      
      loadResume: (resume) => {
        // Always overwrite with API data to ensure consistency
        // This prevents stale localStorage data from persisting
        set({
          resumeId: resume.id,
          title: resume.title ?? null, // Use nullish coalescing to preserve empty strings
          sections: resume.sections || [getDefaultPersonalInfo()],
          selectedTemplate: resume.template_id || 'professional',
        });
      },
      
      setSaveStatus: (status) => set({ saveStatus: status }),
      setLastSavedAt: (date) => set({ lastSavedAt: date }),
    }),
    {
      name: 'resume-storage',
      partialize: (state) => ({
        // Only persist essential data, not UI state
        resumeId: state.resumeId,
        title: state.title,
        sections: state.sections,
        selectedTemplate: state.selectedTemplate,
      }),
    }
  )
);

