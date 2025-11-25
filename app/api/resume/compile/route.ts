import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

const LATEX_COMPILE_URL = process.env.LATEX_COMPILE_URL || 'http://localhost:3001/compile';

export async function POST(request: NextRequest) {
  try {
    const { resumeId } = await request.json();

    if (!resumeId) {
      return NextResponse.json({ error: 'Resume ID required' }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const { data: resume, error: fetchError } = await supabaseAdmin
      .from('resume_versions')
      .select('*')
      .eq('id', resumeId)
      .single();

    if (fetchError || !resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    if (resume.pdf_url) {
      const { data: urlData } = await supabaseAdmin.storage
        .from('resumes')
        .createSignedUrl(`${resume.user_id}/${resumeId}.pdf`, 3600);

      return NextResponse.json({ pdfUrl: urlData?.signedUrl });
    }

    if (!resume.latex_source) {
      return NextResponse.json({ error: 'No LaTeX source available' }, { status: 400 });
    }

    let pdfBuffer: Buffer;
    try {
      const compileResponse = await fetch(LATEX_COMPILE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latex_source: resume.latex_source,
          file_name: `resume_${resumeId}`,
        }),
      });

      if (!compileResponse.ok) {
        const errorText = await compileResponse.text();
        console.error('LaTeX compile error:', errorText);
        throw new Error('LaTeX compilation failed');
      }

      const arrayBuffer = await compileResponse.arrayBuffer();
      pdfBuffer = Buffer.from(arrayBuffer);
    } catch (compileError) {
      console.error('Compile service error:', compileError);

      const plainTextPdf = createPlainTextPDF(resume.plain_text || 'Resume content unavailable');
      pdfBuffer = Buffer.from(plainTextPdf);
    }

    const fileName = `${resume.user_id}/${resumeId}.pdf`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from('resumes')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload PDF' }, { status: 500 });
    }

    const { data: urlData } = await supabaseAdmin.storage
      .from('resumes')
      .createSignedUrl(fileName, 3600);

    await supabaseAdmin
      .from('resume_versions')
      .update({
        pdf_url: fileName,
        status: 'compiled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', resumeId);

    return NextResponse.json({ pdfUrl: urlData?.signedUrl });
  } catch (error) {
    console.error('Error compiling resume:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to compile resume' },
      { status: 500 }
    );
  }
}

function createPlainTextPDF(text: string): string {
  return `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
>>
endobj
4 0 obj
<<
/Length ${text.length + 50}
>>
stream
BT
/F1 12 Tf
50 750 Td
(Resume - LaTeX Compilation Failed) Tj
0 -20 Td
(Plain text version:) Tj
0 -30 Td
(${text.replace(/\n/g, ') Tj 0 -15 Td (')}) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000315 00000 n
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
${450 + text.length}
%%EOF`;
}
