import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
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

    // Fetch resume (RLS will ensure user can only access their own resumes)
    const { data: resume, error } = await supabase
      .from('resume_versions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return NextResponse.json(
          { error: 'Resume not found' },
          { status: 404 }
        );
      }
      console.error('Load resume error:', error);
      return NextResponse.json(
        { error: 'Failed to load resume', details: error.message },
        { status: 500 }
      );
    }

    if (!resume) {
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      );
    }

    // RLS ensures user can only access their own resumes, but double-check
    if (resume.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      resume: {
        id: resume.id,
        title: resume.title,
        template_id: resume.template_id,
        sections_data: resume.sections_data,
        plain_text: resume.plain_text,
        latex_source: resume.latex_source,
        status: resume.status,
        ats_score: resume.ats_score,
        created_at: resume.created_at,
        updated_at: resume.updated_at,
      },
    });
  } catch (error) {
    console.error('Load resume error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
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

    // First, check if resume exists and belongs to user
    const { data: resume, error: fetchError } = await supabase
      .from('resume_versions')
      .select('id, pdf_url')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      // PGRST116 means no rows found
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Resume not found or unauthorized' },
          { status: 404 }
        );
      }
      // Other errors
      console.error('Error fetching resume for deletion:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch resume', details: fetchError.message },
        { status: 500 }
      );
    }

    if (!resume) {
      return NextResponse.json(
        { error: 'Resume not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete associated PDF from storage if it exists
    if (resume.pdf_url) {
      try {
        // Extract file path from URL or construct it
        const filePath = `${user.id}/${id}.pdf`;
        const { error: storageError } = await supabase.storage
          .from('resumes')
          .remove([filePath]);

        if (storageError) {
          console.warn('Failed to delete PDF from storage:', storageError);
          // Continue with database deletion even if storage deletion fails
        }
      } catch (storageErr) {
        console.warn('Error deleting PDF from storage:', storageErr);
        // Continue with database deletion
      }
    }

    // Delete resume from database (RLS ensures user can only delete their own)
    const { error: deleteError } = await supabase
      .from('resume_versions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Delete resume error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete resume', details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Resume deleted successfully',
    });
  } catch (error) {
    console.error('Delete resume error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
