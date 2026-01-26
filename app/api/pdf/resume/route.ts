import { NextRequest, NextResponse } from 'next/server';
import { generatePdfFromHtml } from '@/lib/pdf/generatePdf';
import { getResumeHtmlById } from '@/lib/resume/getResumeHtmlById';

type RequestBody = {
  html?: string;
  resumeId?: string;
  filename?: string;
  layoutMode?: 'standard' | 'compact';
};

const PRINT_STYLES = `
  <style>
    @page {
      size: 225mm 304mm; /* Match preview: 850px × 1150px */
      margin: 0;
    }
    html, body {
      width: 225mm; /* 850px */
      height: 304mm; /* 1150px */
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      background: #ffffff;
      font-family: "Tinos", "Liberation Serif", "Times New Roman", Georgia, serif;
    }
    /* Apply font globally but don't override inline styles */
    *, *::before, *::after {
      font-family: "Tinos", "Liberation Serif", "Times New Roman", Georgia, serif;
    }
    /* Ensure italic font-style is preserved */
    [style*="font-style: italic"] {
      font-style: italic;
    }
    /* Ensure bold font-weight is preserved */
    [style*="font-weight: bold"] {
      font-weight: bold;
    }
    /* Preserve all inline styles from preview */
    [data-resume-preview] {
      width: 100%;
      margin: 0;
      padding: 0; /* Padding is handled by body wrapper */
      background: white;
      box-sizing: border-box;
      font-family: "Tinos", "Liberation Serif", "Times New Roman", Georgia, serif;
      max-height: 100%;
      overflow: hidden; /* Match preview behavior - clip content at page boundary */
    }
    /* Page break rules for multi-page support */
    .resume-section {
      page-break-inside: avoid; /* Prevent sections from breaking across pages */
      break-inside: avoid;
      /* Allow page breaks before sections if needed */
      page-break-before: auto;
      break-before: auto;
    }
    /* Prevent header from breaking */
    .resume-header {
      page-break-after: avoid;
      break-after: avoid;
    }
    /* Prevent orphaned lines but allow natural page breaks */
    p, li {
      orphans: 2;
      widows: 2;
    }
    /* Ensure content flows naturally and breaks at page boundaries */
    [data-resume-preview] {
      page-break-inside: auto;
    }
    /* Only reset margins on body/html, preserve everything else */
    .avoid-break { page-break-inside: avoid; }
  </style>
`;

function buildHtml(content: string, layoutMode: 'standard' | 'compact' = 'standard'): string {
  // Match preview padding:
  // Compact: p-8 = 32px = 8.5mm
  // Standard: p-16 = 64px = 17mm
  const padding = layoutMode === 'compact' ? '8.5mm' : '17mm';
  
  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <!-- Load Tinos font (Liberation Serif replacement) -->
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Tinos:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">
      ${PRINT_STYLES}
    </head>
    <body style="margin: 0; padding: 0; background: white; overflow: hidden;">
      <div style="padding: ${padding}; box-sizing: border-box; width: 100%; height: 304mm; overflow: hidden;">
        ${content}
      </div>
    </body>
  </html>`;
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { html, resumeId, filename = 'resume.pdf', layoutMode = 'standard' } = body;

    if (!html && !resumeId) {
      return NextResponse.json(
        { error: 'Provide html or resumeId' },
        { status: 400 }
      );
    }

    const resumeHtml = html ?? (await getResumeHtmlById(resumeId!));
    const fullHtml = buildHtml(resumeHtml, layoutMode);
    const pdfBuffer = await generatePdfFromHtml({ html: fullHtml });

    // Convert Buffer to Uint8Array for NextResponse compatibility
    const pdfArray = new Uint8Array(pdfBuffer);

    return new NextResponse(pdfArray, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Failed to generate resume PDF', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}

