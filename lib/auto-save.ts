import { useCallback, useRef } from 'react';
import { useResumeStore } from '@/stores/resumeStore';
import { useAuthStore } from '@/stores/authStore';

const DEBOUNCE_DELAY = 2000; // 2 seconds

export function useAutoSave() {
  const { sections, selectedTemplate, resumeId, title, setResumeId, setTitle, setSaveStatus, setLastSavedAt } = useResumeStore();
  const { user } = useAuthStore();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const saveResume = useCallback(async () => {
    // Only allow auto-save when on the create page
    // This prevents unwanted saves when the store has stale data from other pages
    if (typeof window !== 'undefined') {
      const isOnCreatePage = window.location.pathname === '/create';
      if (!isOnCreatePage) {
        // Not on create page, skip auto-save
        return;
      }
    }
    
    if (!user) {
      // Not authenticated, skip auto-save
      return;
    }

    if (sections.length === 0) {
      // No sections to save
      return;
    }

    // CRITICAL: For new resumes (no resumeId), only save if user has explicitly made changes
    // This prevents automatic creation when just visiting /create
    if (!resumeId) {
      const personalInfo = sections.find(s => s.type === 'personal-info');
      const hasExplicitData = personalInfo?.content && (
        personalInfo.content.fullName?.trim() ||
        personalInfo.content.email?.trim() ||
        personalInfo.content.phone?.trim() ||
        personalInfo.content.title?.trim() ||
        sections.length > 1 ||
        (title && title.trim())
      );
      
      if (!hasExplicitData) {
        // No explicit user data - don't create empty resume
        return;
      }
    }
    
    // Additional check: If we're on /create without an ID, make sure we're not creating duplicates
    // by checking if there's already a recent save in progress or if we just navigated here
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlId = urlParams.get('id');
      if (!urlId && resumeId) {
        // URL has no ID but store has resumeId - this is stale data, don't save
        console.log('Skipping auto-save: URL has no ID but store has resumeId (stale data)');
        return;
      }
    }

    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setSaveStatus('saving');

    try {
      // Always include title in the request, even if null
      // This ensures the server knows the user's intent (null = auto-generate, string = use as-is)
      const savePayload: any = {
        sections,
        templateId: selectedTemplate,
        resumeId: resumeId || undefined,
      };
      
      // Include title if it's defined (null, empty string, or non-empty string)
      if (title !== undefined) {
        savePayload.title = title;
      }
      
      const response = await fetch('/api/resume/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(savePayload),
        signal: abortController.signal,
      });

      // Check if request was aborted
      if (abortController.signal.aborted) {
        return; // Silently return, don't update status
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // If resume not found and we have a resumeId, clear it to prevent duplicates
        if (response.status === 404 && resumeId && errorData.clearResumeId) {
          console.log('Resume not found, clearing resumeId from store');
          setResumeId(null);
          return; // Don't throw error, just clear the stale ID
        }
        
        throw new Error('Failed to save resume');
      }

      const data = await response.json();
      
      // Check again if aborted after response
      if (abortController.signal.aborted) {
        return;
      }
      
      // Update resume ID from server response
      // This handles both new resumes and cases where a resume was recreated (e.g., after deletion)
      if (data.resumeId && data.resumeId !== resumeId) {
        setResumeId(data.resumeId);
      }

      // Update title from server response to ensure consistency
      // BUT: For new resumes, always use "Untitled Resume" and don't overwrite with auto-generated titles
      if (data.resume && data.resume.title !== undefined) {
        // For NEW resumes (no resumeId before save), always set to "Untitled Resume"
        // This prevents using stale personal info to generate titles
        if (!resumeId) {
          // New resume - always use "Untitled Resume" regardless of what API returned
          setTitle('Untitled Resume');
        } else {
          // Existing resume - use the title from API
          setTitle(data.resume.title);
        }
      }

      setSaveStatus('saved');
      setLastSavedAt(new Date());

      // Reset to idle after 3 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    } catch (error: any) {
      // Ignore abort errors - they're expected when cancelling previous requests
      if (error.name === 'AbortError' || error.code === 'ECONNRESET' || error.message?.includes('aborted')) {
        return; // Silently return, don't log or show error
      }

      console.error('Auto-save error:', error);
      setSaveStatus('error');
      
      // Reset to idle after 5 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 5000);
    }
  }, [user, sections, selectedTemplate, title, resumeId, setResumeId, setTitle, setSaveStatus, setLastSavedAt]);

  const triggerAutoSave = useCallback(() => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout
    saveTimeoutRef.current = setTimeout(() => {
      saveResume();
    }, DEBOUNCE_DELAY);
  }, [saveResume]);

  return { triggerAutoSave, saveResume };
}

