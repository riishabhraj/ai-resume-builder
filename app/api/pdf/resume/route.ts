import { NextRequest, NextResponse } from 'next/server';
import { generatePdfFromHtml } from '@/lib/pdf/generatePdf';
import { getResumeHtmlById } from '@/lib/resume/getResumeHtmlById';

type RequestBody = {
  html?: string;
  resumeId?: string;
  filename?: string;
};

const PRINT_STYLES = `
  <style>
    @page { size: A4; margin: 0; }
    html, body {
      width: 210mm;
      height: 297mm;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      background: #ffffff;
      font-family: "Tinos", "Liberation Serif", "Times New Roman", Georgia, serif !important;
    }
    /* Apply font globally to all elements - this ensures Liberation Serif everywhere */
    *, *::before, *::after {
      font-family: "Tinos", "Liberation Serif", "Times New Roman", Georgia, serif !important;
    }
    /* Preserve all inline styles from preview */
    [data-resume-preview] {
      width: 100% !important;
      margin: 0 !important;
      padding: 0 !important; /* Padding is handled by body wrapper */
      background: white !important;
      box-sizing: border-box !important;
      font-family: "Tinos", "Liberation Serif", "Times New Roman", Georgia, serif !important;
    }
    /* Ensure all text elements use the font */
    h1, h2, h3, h4, h5, h6, p, div, span, li, ul, ol {
      font-family: "Tinos", "Liberation Serif", "Times New Roman", Georgia, serif !important;
    }
    /* Only reset margins on body/html, preserve everything else */
    .avoid-break { page-break-inside: avoid; }
  </style>
`;

function buildHtml(content: string): string {
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
    <body style="margin: 0; padding: 0; background: white;">
      <div style="padding: 13mm; box-sizing: border-box; width: 100%; min-height: 100vh;">
        ${content}
      </div>
    </body>
  </html>`;
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { html, resumeId, filename = 'resume.pdf' } = body;

    if (!html && !resumeId) {
      return NextResponse.json(
        { error: 'Provide html or resumeId' },
        { status: 400 }
      );
    }

    const resumeHtml = html ?? (await getResumeHtmlById(resumeId!));
    const fullHtml = buildHtml(resumeHtml);
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

