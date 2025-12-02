import { useCallback, useRef } from 'react';
import { useResumeStore } from '@/stores/resumeStore';
import { useAuthStore } from '@/stores/authStore';

const DEBOUNCE_DELAY = 2000; // 2 seconds

export function useAutoSave() {
  const { sections, selectedTemplate, resumeId, title, setResumeId, setSaveStatus, setLastSavedAt } = useResumeStore();
  const { user } = useAuthStore();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const saveResume = useCallback(async () => {
    if (!user) {
      // Not authenticated, skip auto-save
      return;
    }

    if (sections.length === 0) {
      // No sections to save
      return;
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
      const response = await fetch('/api/resume/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sections,
          templateId: selectedTemplate,
          title: title || undefined,
          resumeId: resumeId || undefined,
        }),
        signal: abortController.signal,
      });

      // Check if request was aborted
      if (abortController.signal.aborted) {
        return; // Silently return, don't update status
      }

      if (!response.ok) {
        throw new Error('Failed to save resume');
      }

      const data = await response.json();
      
      // Check again if aborted after response
      if (abortController.signal.aborted) {
        return;
      }
      
      // Update resume ID if it's a new resume
      if (!resumeId && data.resumeId) {
        setResumeId(data.resumeId);
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
  }, [user, sections, selectedTemplate, title, resumeId, setResumeId, setSaveStatus, setLastSavedAt]);

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

