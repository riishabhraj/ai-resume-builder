import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { resend, RESEND_ENABLED, FROM_EMAIL } from '@/lib/resend';

// Simple admin secret check - set this in your .env.local
const ADMIN_SECRET = process.env.ADMIN_SECRET;

export async function POST(request: NextRequest) {
  try {
    // Check if Resend is configured
    if (!RESEND_ENABLED || !resend) {
      return NextResponse.json(
        { error: 'Email service not configured. Add RESEND_API_KEY to .env.local' },
        { status: 503 }
      );
    }

    // Verify admin secret
    const { secret, testMode } = await request.json();

    if (!ADMIN_SECRET || secret !== ADMIN_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Fetch waitlist users who haven't been notified yet
    const { data: waitlistUsers, error: fetchError } = await supabaseAdmin
      .from('waitlist')
      .select('id, email')
      .eq('notified', false)
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('Error fetching waitlist:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch waitlist users' },
        { status: 500 }
      );
    }

    if (!waitlistUsers || waitlistUsers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No users to notify',
        sent: 0,
      });
    }

    // In test mode, only show what would be sent
    if (testMode) {
      return NextResponse.json({
        success: true,
        testMode: true,
        message: `Would send emails to ${waitlistUsers.length} users`,
        users: waitlistUsers.map(u => u.email),
      });
    }

    // Send emails
    const results = {
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const user of waitlistUsers) {
      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: user.email,
          subject: "ResuCraft is Live! Your wait is over",
          html: getLaunchEmailHtml(user.email),
        });

        // Mark as notified
        await supabaseAdmin
          .from('waitlist')
          .update({ notified: true })
          .eq('id', user.id);

        results.sent++;
      } catch (emailError) {
        console.error(`Failed to send email to ${user.email}:`, emailError);
        results.failed++;
        results.errors.push(user.email);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sent ${results.sent} emails, ${results.failed} failed`,
      ...results,
    });
  } catch (error) {
    console.error('Send launch emails error:', error);
    return NextResponse.json(
      { error: 'Failed to send emails', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Email HTML template
function getLaunchEmailHtml(email: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ResuCraft is Live!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0f;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="color: #00B4D8; font-size: 32px; margin: 0;">ResuCraft</h1>
      <p style="color: #9ca3af; margin-top: 8px;">AI-Powered Resume Builder</p>
    </div>

    <!-- Main Content -->
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 40px; border: 1px solid rgba(139, 92, 246, 0.3);">
      <h2 style="color: #ffffff; font-size: 28px; margin: 0 0 16px 0; text-align: center;">
        The Wait is Over!
      </h2>

      <p style="color: #d1d5db; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        Hi there,
      </p>

      <p style="color: #d1d5db; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        Thank you for joining our waitlist! We're thrilled to announce that <strong style="color: #00B4D8;">ResuCraft is now live</strong> and ready for you to use.
      </p>

      <p style="color: #d1d5db; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        As one of our early supporters, you now have access to:
      </p>

      <ul style="color: #d1d5db; font-size: 16px; line-height: 1.8; margin: 0 0 32px 0; padding-left: 20px;">
        <li><strong style="color: #10b981;">AI-Powered Resume Builder</strong> - Create professional resumes in minutes</li>
        <li><strong style="color: #10b981;">ATS Score Analysis</strong> - Optimize for applicant tracking systems</li>
        <li><strong style="color: #10b981;">Smart Suggestions</strong> - Get AI-powered improvements</li>
        <li><strong style="color: #10b981;">Multiple Templates</strong> - Choose from professional designs</li>
      </ul>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="https://resucraft.me/sign-up" style="display: inline-block; background: linear-gradient(135deg, #00B4D8 0%, #8B5CF6 100%); color: #ffffff; font-size: 18px; font-weight: 600; text-decoration: none; padding: 16px 48px; border-radius: 12px;">
          Get Started Now
        </a>
      </div>

      <p style="color: #9ca3af; font-size: 14px; text-align: center; margin: 24px 0 0 0;">
        Questions? Just reply to this email - we'd love to hear from you!
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 40px;">
      <p style="color: #6b7280; font-size: 12px; margin: 0;">
        You're receiving this because you signed up for the ResuCraft waitlist.
      </p>
      <p style="color: #6b7280; font-size: 12px; margin: 8px 0 0 0;">
        © 2025 ResuCraft. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
`;
}
