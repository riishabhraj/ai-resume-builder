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

    // Fetch analyses for this resume (RLS ensures user can only see their own)
    const { data: analyses, error } = await supabase
      .from('resume_analyses')
      .select('*')
      .eq('resume_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Load analyses error:', error);
      return NextResponse.json(
        { error: 'Failed to load analyses', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      analyses: analyses || [],
    });
  } catch (error) {
    console.error('Load analyses error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

