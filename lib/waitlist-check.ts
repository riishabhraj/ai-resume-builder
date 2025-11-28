/**
 * Determines if the application should redirect users to the waitlist page.
 * 
 * Checks NEXT_PUBLIC_WAITLIST_MODE environment variable.
 * - If set to 'true', redirects to waitlist (works in both dev and production)
 * - If not set or 'false', allows normal access
 * 
 * This allows you to test waitlist functionality locally by setting
 * NEXT_PUBLIC_WAITLIST_MODE=true in your .env.local file.
 * 
 * @returns true if users should be redirected to waitlist, false otherwise
 */
export function shouldRedirectToWaitlist(): boolean {
  // Check environment variable (works in both dev and production)
  return process.env.NEXT_PUBLIC_WAITLIST_MODE === 'true';
}

