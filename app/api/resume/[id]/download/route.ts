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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch resume and verify ownership
    const { data: resume, error } = await supabase
      .from('resume_versions')
      .select('pdf_url, user_id')
      .eq('id', resumeId)
      .single();

    if (error || !resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    // Verify user owns this resume
    if (resume.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!resume.pdf_url) {
      return NextResponse.json({ error: 'PDF not yet compiled' }, { status: 404 });
    }

    // Use admin client for storage operations (to bypass RLS on storage)
    const { data: urlData, error: urlError } = await supabaseAdmin.storage
      .from('resumes')
      .createSignedUrl(resume.pdf_url, 3600);

    if (urlError || !urlData) {
      return NextResponse.json({ error: 'Failed to generate download URL' }, { status: 500 });
    }

    return NextResponse.json(
      { downloadUrl: urlData.signedUrl },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      }
    );
  } catch (error) {
    console.error('Error getting download URL:', error);
    return NextResponse.json(
      { error: 'Failed to get download URL' },
      { status: 500 }
    );
  }
}
