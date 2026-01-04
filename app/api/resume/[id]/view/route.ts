import { NextRequest, NextResponse } from 'next/server';
import { createClient, supabaseAdmin } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: resumeId } = await params;

    const supabase = await createClient();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Storage not configured' },
        { status: 503 }
      );
    }

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get resume - only check pdf_url and user_id
    const { data: resume, error } = await supabase
      .from('resume_versions')
      .select('pdf_url, user_id, status')
      .eq('id', resumeId)
      .single();

    if (error || !resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    // Ensure user owns this resume
    if (resume.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if PDF exists in storage - if not, return error (NO auto-compile)
    if (!resume.pdf_url || resume.status !== 'compiled') {
      return NextResponse.json({ 
        error: 'PDF not yet compiled. Please compile the resume first.',
        needsCompilation: true 
      }, { status: 404 });
    }

    // PDF exists in storage - create signed URL for viewing (valid for 1 hour)
    const { data: urlData, error: urlError } = await supabaseAdmin.storage
      .from('resumes')
      .createSignedUrl(resume.pdf_url, 3600);

    if (urlError || !urlData) {
      return NextResponse.json({ error: 'Failed to generate PDF URL' }, { status: 500 });
    }

    return NextResponse.json({ pdfUrl: urlData.signedUrl });
  } catch (error) {
    console.error('Error getting PDF view URL:', error);
    return NextResponse.json(
      { error: 'Failed to get PDF URL' },
      { status: 500 }
    );
  }
}
