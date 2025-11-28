import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Use supabaseAdmin (service role) to bypass RLS
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Check if email already exists
    const { data: existing } = await supabaseAdmin
      .from('waitlist')
      .select('email, created_at')
      .eq('email', email.trim().toLowerCase())
      .single();

    if (existing) {
      // Get the position for existing email
      const { count } = await supabaseAdmin
        .from('waitlist')
        .select('*', { count: 'exact', head: true })
        .lt('created_at', existing.created_at || new Date().toISOString());
      
      const position = (count || 0) + 1;
      
      return NextResponse.json(
        { 
          success: true,
          message: 'You are already on the waitlist!',
          alreadyExists: true,
          position: position
        },
        { status: 200 }
      );
    }

    // Insert into waitlist
    const { data, error } = await supabaseAdmin
      .from('waitlist')
      .insert({
        email: email.trim().toLowerCase(),
      })
      .select()
      .single();

    if (error) {
      console.error('Waitlist signup error:', error);
      return NextResponse.json(
        { error: 'Failed to join waitlist. Please try again.' },
        { status: 500 }
      );
    }

    // Get waitlist position (count how many signed up before this user)
    const { count } = await supabaseAdmin
      .from('waitlist')
      .select('*', { count: 'exact', head: true })
      .lt('created_at', data.created_at || new Date().toISOString());

    const position = (count || 0) + 1;

    return NextResponse.json({
      success: true,
      message: 'Successfully joined the waitlist!',
      position: position,
      data
    });
  } catch (error) {
    console.error('Waitlist signup error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

