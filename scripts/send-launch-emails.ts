/**
 * Script to send launch emails to waitlist users
 *
 * Usage:
 *   pnpm tsx scripts/send-launch-emails.ts --test    # Test mode (shows who would receive emails)
 *   pnpm tsx scripts/send-launch-emails.ts --send    # Actually send emails
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';
const ADMIN_SECRET = process.env.ADMIN_SECRET;

async function main() {
  const args = process.argv.slice(2);
  const testMode = args.includes('--test');
  const sendMode = args.includes('--send');

  if (!testMode && !sendMode) {
    console.log(`
Usage:
  pnpm tsx scripts/send-launch-emails.ts --test    # Preview who would receive emails
  pnpm tsx scripts/send-launch-emails.ts --send    # Actually send emails

Make sure to set these environment variables:
  - ADMIN_SECRET: Your admin secret from .env.local
  - API_URL: Your API URL (defaults to http://localhost:3000)
`);
    process.exit(1);
  }

  if (!ADMIN_SECRET) {
    console.error('Error: ADMIN_SECRET environment variable is required');
    console.log('Run: ADMIN_SECRET=your-secret pnpm tsx scripts/send-launch-emails.ts --test');
    process.exit(1);
  }

  console.log(`\n🚀 ResuCraft Launch Email Sender`);
  console.log(`================================`);
  console.log(`Mode: ${testMode ? 'TEST (no emails will be sent)' : 'SEND (emails will be sent!)'}`);
  console.log(`API: ${API_URL}\n`);

  try {
    const response = await fetch(`${API_URL}/api/admin/send-launch-emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: ADMIN_SECRET,
        testMode: testMode,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Error:', data.error);
      process.exit(1);
    }

    if (testMode) {
      console.log(`✅ Test successful!`);
      console.log(`📧 Would send to ${data.users?.length || 0} users:\n`);
      data.users?.forEach((email: string, i: number) => {
        console.log(`   ${i + 1}. ${email}`);
      });
      console.log(`\nRun with --send flag to actually send emails.`);
    } else {
      console.log(`✅ ${data.message}`);
      console.log(`📧 Sent: ${data.sent}`);
      if (data.failed > 0) {
        console.log(`❌ Failed: ${data.failed}`);
        console.log(`   Failed emails: ${data.errors?.join(', ')}`);
      }
    }
  } catch (error) {
    console.error('❌ Failed to connect to API:', error);
    console.log('\nMake sure your Next.js dev server is running: pnpm dev');
    process.exit(1);
  }
}

main();
