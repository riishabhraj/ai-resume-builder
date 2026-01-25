'use client';

import { X, Loader2, ZoomIn, ZoomOut, Maximize2, Download, Printer } from 'lucide-react';
import { useEffect, useState, useCallback, useRef } from 'react';

interface ResumeViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeId: string;
}

export default function ResumeViewModal({ isOpen, onClose, resumeId }: ResumeViewModalProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100); // Standardize to 100% to match "Fit to Page" behavior
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadPdfUrl = useCallback(async () => {
    // Cancel previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/resume/${encodeURIComponent(resumeId)}/view`, {
        signal: abortController.signal,
        cache: 'no-store',
      });
      
      // Check response status before parsing JSON
      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = 'Failed to load PDF';
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } else {
            const errorText = await response.text();
            if (errorText) {
              errorMessage = errorText;
            }
          }
        } catch (parseError) {
          // If parsing fails, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Parse JSON only for successful responses
      const data = await response.json();
      
      if (data.pdfUrl) {
        setPdfUrl(data.pdfUrl);
      } else {
        setError('PDF not available');
      }
    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      console.error('Error loading PDF:', err);
      setError(err instanceof Error ? err.message : 'Failed to load PDF');
    } finally {
      if (!abortController.signal.aborted) {
        setLoading(false);
      }
    }
  }, [resumeId]);

  useEffect(() => {
    if (isOpen && resumeId) {
      loadPdfUrl();
    } else {
      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      setPdfUrl(null);
      setError(null);
      setZoom(100); // Reset to canonical zoom value
    }

    return () => {
      // Cleanup: abort any pending requests on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [isOpen, resumeId, loadPdfUrl]);

  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 10, 50));
  };

  const handleFitToPage = () => {
    setZoom(100);
  };

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `resume-${resumeId}.pdf`;
      // Do not set target="_blank" to allow download attribute to work properly
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePrint = () => {
    if (pdfUrl) {
      const printWindow = window.open(pdfUrl, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col bg-gray-900"
      role="dialog"
      aria-modal="true"
      aria-labelledby="resume-viewer-title"
    >
      {/* Toolbar - Matching screenshot style */}
      <div 
        id="resume-viewer-title"
        className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shadow-sm"
      >
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-700 min-w-[3rem] text-center font-medium">
              {zoom}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={handleFitToPage}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
            title="Fit to Page"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <div className="h-6 w-px bg-gray-300" />
          <div className="text-sm text-gray-600 font-medium">
            Page 1 / 1
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownload}
            disabled={!pdfUrl}
            className="px-3 py-1.5 rounded text-sm bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
          <button
            onClick={handlePrint}
            disabled={!pdfUrl}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Print"
            aria-label="Print PDF"
          >
            <Printer className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PDF Viewer with Sidebar */}
      <div className="flex-1 overflow-hidden bg-gray-100 flex">
        {/* Sidebar with Thumbnail */}
        <div className="w-20 bg-gray-50 border-r border-gray-200 p-2 overflow-y-auto">
          <div className="space-y-2">
            <div className="bg-white border-2 border-blue-500 rounded p-1 shadow-sm cursor-pointer">
              <div className="aspect-[8.5/11] bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500">
                1
              </div>
            </div>
          </div>
        </div>

        {/* Main PDF Viewer */}
        <div className="flex-1 overflow-auto bg-gray-200 p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Loading PDF...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center bg-white rounded-lg p-8 shadow-lg max-w-md">
                <p className="text-red-600 mb-4 font-medium">{error}</p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={loadPdfUrl}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          ) : pdfUrl ? (
            <div className="flex justify-center items-start min-h-full py-4">
              <div 
                className="bg-white shadow-2xl"
                style={{
                  width: `${(8.5 * 96 * zoom) / 100}px`,
                  height: `${(11 * 96 * zoom) / 100}px`,
                  minWidth: `${(8.5 * 96 * zoom) / 100}px`,
                  minHeight: `${(11 * 96 * zoom) / 100}px`,
                }}
              >
                <iframe
                  src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&zoom=${zoom}`}
                  className="w-full h-full border-0"
                  title="Resume PDF Viewer"
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
