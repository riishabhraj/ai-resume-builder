# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for ResuCraft.

## Prerequisites

- Supabase project created
- Google Cloud Console account

## Step-by-Step Setup

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Navigate to **APIs & Services** → **Library**
   - Search for "Google+ API"
   - Click **Enable**

### 2. Create OAuth 2.0 Client ID

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. If prompted, configure the OAuth consent screen:
   - Choose **External** (unless you have a Google Workspace)
   - Fill in the required information:
     - App name: `ResuCraft`
     - User support email: Your email
     - Developer contact: Your email
   - Click **Save and Continue**
   - Add scopes (optional): `email`, `profile`
   - Add test users if needed
   - Click **Save and Continue**

4. Create OAuth Client:
   - **Application type**: Web application
   - **Name**: ResuCraft Web Client
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (for local development)
     - `https://yourdomain.com` (for production)
   - **Authorized redirect URIs**:
     - `https://<your-project-ref>.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback` (for local development)
   - Click **Create**

5. Copy the credentials:
   - **Client ID** (starts with something like `123456789-abc...`)
   - **Client Secret** (starts with `GOCSPX-...`)

### 3. Configure Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Google** in the list and click to expand
4. Enable the Google provider
5. Paste your credentials:
   - **Client ID (for OAuth)**: Paste the Client ID from Google
   - **Client Secret (for OAuth)**: Paste the Client Secret from Google
6. Click **Save**

### 4. Test the Integration

1. Start your development server:
   ```bash
   pnpm dev
   ```

2. Navigate to `/sign-in` or `/sign-up`
3. Click the **Continue with Google** button
4. You should be redirected to Google's sign-in page
5. After signing in, you'll be redirected back to your app

## How It Works

1. User clicks "Continue with Google" button
2. User is redirected to Google's OAuth consent screen
3. After authorization, Google redirects to Supabase's callback URL
4. Supabase exchanges the code for a session
5. User is redirected to `/auth/callback` route
6. The callback route:
   - Exchanges the code for a session
   - Creates/updates the user profile
   - Redirects to the intended destination (or `/dashboard`)

## Troubleshooting

### "redirect_uri_mismatch" Error

- Ensure the redirect URI in Google Cloud Console matches exactly:
  - `https://<your-project-ref>.supabase.co/auth/v1/callback`
- Check for trailing slashes or protocol mismatches

### Profile Not Created

- The callback route automatically creates profiles for OAuth users
- Check the browser console and server logs for errors
- Verify the `profiles` table exists and has proper RLS policies

### OAuth Button Not Working

- Check browser console for errors
- Verify Supabase credentials are set correctly
- Ensure Google provider is enabled in Supabase Dashboard

## Production Deployment

When deploying to production:

1. Update Google OAuth redirect URIs:
   - Add your production domain: `https://yourdomain.com/auth/callback`
   - Keep the Supabase callback: `https://<your-project-ref>.supabase.co/auth/v1/callback`

2. Update Supabase Site URL:
   - Go to **Authentication** → **URL Configuration**
   - Set **Site URL** to your production domain
   - Add your production domain to **Redirect URLs**

3. Test the OAuth flow in production

## Security Notes

- Never commit OAuth credentials to version control
- Use environment variables for sensitive data
- Regularly rotate OAuth client secrets
- Monitor OAuth usage in Google Cloud Console
