import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { StructuredResumeSection } from '@/lib/types';
import { FREE_TIER_LIMITS, hasProFeatures } from '@/lib/razorpay';

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

    // Check usage limits for NEW resumes (not updates)
    // Use atomic counter increment to prevent race conditions
    if (!resumeId) {
      // Use database function with row-level locking to atomically check and increment
      const { data: result, error: rpcError } = await supabase.rpc(
        'increment_resume_counter',
        {
          p_user_id: user.id,
          p_limit: FREE_TIER_LIMITS.resumes_per_month,
        }
      );

      if (rpcError) {
        console.error('Error incrementing resume counter:', rpcError);
        return NextResponse.json(
          { error: 'Failed to check usage limits' },
          { status: 500 }
        );
      }

      // If result is -1, limit was exceeded
      if (result === -1) {
        return NextResponse.json(
          { 
            error: 'Resume limit reached',
            message: `You've created ${FREE_TIER_LIMITS.resumes_per_month} resumes this month. Upgrade to Pro for unlimited resumes.`,
            limitReached: true,
            upgradeRequired: true,
          },
          { status: 403 }
        );
      }
      
      // Counter was successfully incremented, continue with resume creation
    }

    // Generate title from personal info if not provided
    // Only auto-generate if title is null/undefined, not if it's an empty string
    // Empty string means user explicitly cleared it, so use default
    let resumeTitle = title;
    if (resumeTitle === null || resumeTitle === undefined) {
      // Title not provided - auto-generate from personal info
      const personalInfo = sections.find((s) => s.type === 'personal-info');
      const fullName = personalInfo?.content?.fullName?.trim();
      
      // For NEW resumes (no resumeId), always default to "Untitled Resume"
      // This prevents using stale personal info data from previous resumes
      // Only use personal info name for EXISTING resumes that are being updated
      if (!resumeId) {
        // New resume - always use "Untitled Resume" to prevent stale data issues
        resumeTitle = 'Untitled Resume';
      } else if (resumeId && fullName && fullName.length > 0) {
        // Existing resume being updated - can use name if available
        resumeTitle = `${fullName}'s Resume`;
      } else {
        // Existing resume but no name - use default
        resumeTitle = 'Untitled Resume';
      }
    } else if (typeof resumeTitle === 'string' && resumeTitle.trim() === '') {
      // If title is empty string (user cleared it), use default
      resumeTitle = 'Untitled Resume';
    }
    // If title is a non-empty string, use it as-is

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
      // First verify the resume exists and belongs to the user
      const { data: existingResume, error: fetchError } = await supabase
        .from('resume_versions')
        .select('id')
        .eq('id', resumeId)
        .eq('user_id', user.id)
        .single();

      if (fetchError || !existingResume) {
        // Resume doesn't exist or doesn't belong to user
        // Don't create a new one - return error to prevent duplicates
        console.log(`Resume ${resumeId} not found or unauthorized, clearing resumeId from client`);
        return NextResponse.json({
          success: false,
          error: 'Resume not found',
          clearResumeId: true, // Signal client to clear resumeId
        }, { status: 404 });
      }

      // Resume exists, proceed with update
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
      } else if (data) {
        // Update successful
        result = data;
      }
    }
    
    // Create new resume if:
    // 1. No resumeId was provided, OR
    // 2. Update failed because resume doesn't exist
    if (!result) {
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
