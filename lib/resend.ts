import { Resend } from 'resend';

// Initialize Resend with API key
export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Check if Resend is configured
export const RESEND_ENABLED = !!process.env.RESEND_API_KEY;

// Email configuration
const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
const fromName = process.env.RESEND_FROM_NAME || 'ResuCraft';

// Formatted from address with name
export const FROM_EMAIL = `${fromName} <${fromEmail}>`;

// Reply-to email (can be different from from email)
export const REPLY_TO_EMAIL = process.env.RESEND_REPLY_TO || fromEmail;

// App URL for email links
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

// Helper to send email with standard configuration
export async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo = REPLY_TO_EMAIL,
}: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}) {
  if (!resend) {
    throw new Error('Resend is not configured');
  }

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html,
    text,
    replyTo,
  });
}
