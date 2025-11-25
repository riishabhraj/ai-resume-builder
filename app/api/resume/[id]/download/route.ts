import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resumeId = params.id;

    const { data: resume, error } = await supabaseAdmin
      .from('resume_versions')
      .select('*')
      .eq('id', resumeId)
      .single();

    if (error || !resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    if (!resume.pdf_url) {
      return NextResponse.json({ error: 'PDF not yet compiled' }, { status: 404 });
    }

    const { data: urlData, error: urlError } = await supabaseAdmin.storage
      .from('resumes')
      .createSignedUrl(resume.pdf_url, 3600);

    if (urlError || !urlData) {
      return NextResponse.json({ error: 'Failed to generate download URL' }, { status: 500 });
    }

    return NextResponse.json({ downloadUrl: urlData.signedUrl });
  } catch (error) {
    console.error('Error getting download URL:', error);
    return NextResponse.json(
      { error: 'Failed to get download URL' },
      { status: 500 }
    );
  }
}
