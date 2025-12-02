import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { StructuredResumeSection } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json();
    const { sections, templateId, title, resumeId } = body;

    // Validate required fields
    if (!sections || !Array.isArray(sections)) {
      return NextResponse.json(
        { error: 'Sections array is required' },
        { status: 400 }
      );
    }

    // Validate sections structure
    const isValidSection = (section: any): section is StructuredResumeSection => {
      return (
        section &&
        typeof section.id === 'string' &&
        typeof section.type === 'string' &&
        typeof section.title === 'string' &&
        section.content !== undefined
      );
    };

    if (!sections.every(isValidSection)) {
      return NextResponse.json(
        { error: 'Invalid sections structure. Each section must have id, type, title, and content.' },
        { status: 400 }
      );
    }

    // Generate title from personal info if not provided
    let resumeTitle = title;
    if (!resumeTitle) {
      const personalInfo = sections.find((s) => s.type === 'personal-info');
      if (personalInfo?.content?.fullName) {
        resumeTitle = `${personalInfo.content.fullName}'s Resume`;
      } else {
        resumeTitle = 'Untitled Resume';
      }
    }

    // Prepare data for insert/update
    const resumeData: any = {
      user_id: user.id,
      title: resumeTitle,
      template_id: templateId || null,
      sections_data: sections,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (resumeId) {
      // Update existing resume
      const { data, error } = await supabase
        .from('resume_versions')
        .update(resumeData)
        .eq('id', resumeId)
        .eq('user_id', user.id) // Ensure user owns this resume
        .select()
        .single();

      if (error) {
        console.error('Update resume error:', error);
        return NextResponse.json(
          { error: 'Failed to update resume', details: error.message },
          { status: 500 }
        );
      }

      if (!data) {
        return NextResponse.json(
          { error: 'Resume not found or unauthorized' },
          { status: 404 }
        );
      }

      result = data;
    } else {
      // Create new resume
      resumeData.status = 'draft';
      resumeData.created_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('resume_versions')
        .insert(resumeData)
        .select()
        .single();

      if (error) {
        console.error('Create resume error:', error);
        return NextResponse.json(
          { error: 'Failed to create resume', details: error.message },
          { status: 500 }
        );
      }

      result = data;
    }

    return NextResponse.json({
      success: true,
      resumeId: result.id,
      resume: {
        id: result.id,
        title: result.title,
        template_id: result.template_id,
        sections: result.sections_data,
        created_at: result.created_at,
        updated_at: result.updated_at,
      },
    });
  } catch (error) {
    // Ignore connection reset errors (happen when client aborts request)
    if (error instanceof Error && (error.message.includes('aborted') || error.message.includes('ECONNRESET'))) {
      // Request was aborted, return early without logging
      return new NextResponse(null, { status: 499 }); // 499 = Client Closed Request
    }
    
    console.error('Save resume error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
