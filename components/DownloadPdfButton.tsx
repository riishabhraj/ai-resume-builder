'use client';

import { useState } from 'react';

type DownloadPdfButtonProps = {
  html?: string;
  resumeId?: string;
  filename?: string;
  label?: string;
  className?: string;
};

export function DownloadPdfButton({
  html,
  resumeId,
  filename = 'resume.pdf',
  label = 'Download PDF',
  className,
}: DownloadPdfButtonProps) {
  const [loading, setLoading] = useState(false);

  const disabled = loading || (!html && !resumeId);

  const handleClick = async () => {
    if (disabled) return;

    try {
      setLoading(true);
      const response = await fetch('/api/pdf/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html, resumeId, filename }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF download failed', error);
      alert('Unable to download PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={
        className ??
        'px-4 py-2 rounded-lg bg-brand-purple text-white font-semibold disabled:opacity-50'
      }
    >
      {loading ? 'Preparing…' : label}
    </button>
  );
}

