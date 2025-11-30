# Authentication Setup Guide

This document explains the authentication system implemented in ResuCraft.

## Overview

The authentication system uses:
- **Supabase Auth** for user authentication and session management
- **Zustand** for global state management
- **Next.js App Router** with middleware for route protection
- **@supabase/ssr** for server-side rendering support

## Architecture

### 1. Supabase Configuration

#### Client-Side (`lib/supabase/client.ts`)
- Uses `createBrowserClient` from `@supabase/ssr`
- Handles client-side authentication operations
- Automatically manages cookies and session

#### Server-Side (`lib/supabase/server.ts`)
- Uses `createServerClient` from `@supabase/ssr` for user sessions
- Uses `createClient` from `@supabase/supabase-js` for admin operations
- Properly handles cookies in Server Components and Route Handlers

### 2. Auth Store (`stores/authStore.ts`)

Zustand store that manages:
- User session state
- Loading states
- Auth initialization
- Sign out functionality
- Session refresh

**Usage:**
```typescript
import { useAuthStore } from '@/stores/authStore';

const { user, loading, signOut } = useAuthStore();
```

### 3. Session Management (`lib/auth/session.ts`)

Utility functions for session management:
- `getServerSession()` - Get session on server
- `getClientSession()` - Get session on client
- `isAuthenticated()` - Check if user is authenticated
- `getUserId()` - Get current user ID

### 4. Middleware (`middleware.ts`)

Next.js middleware that:
- Refreshes user sessions automatically
- Protects routes (`/dashboard`, `/create`, `/resume`)
- Redirects unauthenticated users to `/sign-in`
- Redirects authenticated users away from auth pages

### 5. Auth Pages

#### Sign Up (`/sign-up`)
- Email/password registration
- Full name collection
- Profile creation
- Email verification

#### Sign In (`/sign-in`)
- Email/password authentication
- Redirect to original destination after login
- Link to password reset

#### Reset Password (`/reset-password`)
- Request password reset email
- Handle password reset token
- Update password

### 6. Protected Routes

Use the `ProtectedRoute` component to wrap pages that require authentication:

```typescript
import ProtectedRoute from '@/components/ProtectedRoute';

export default function Dashboard() {
  return (
    <ProtectedRoute>
      {/* Your protected content */}
    </ProtectedRoute>
  );
}
```

## Setup Instructions

### 1. Enable Email/Password Auth in Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Enable **Email** provider
4. Configure email templates (optional):
   - **Confirmation Email** - Sent when user signs up
   - **Password Reset Email** - Sent when user requests password reset

### 2. Enable Google OAuth (Recommended)

1. Go to **Authentication** → **Providers** in Supabase Dashboard
2. Enable **Google** provider
3. Configure Google OAuth credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
   - Set **Application type** to **Web application**
   - Add **Authorized redirect URIs**:
     - `https://<your-project-ref>.supabase.co/auth/v1/callback`
     - For local development: `http://localhost:3000/auth/callback`
   - Copy the **Client ID** and **Client Secret**
4. In Supabase Dashboard, paste the credentials:
   - **Client ID (for OAuth)**
   - **Client Secret (for OAuth)**
5. Save the configuration

**Note:** The Google sign-in button is already implemented on both `/sign-in` and `/sign-up` pages. The OAuth callback is handled automatically at `/auth/callback`.

### 3. Environment Variables

Ensure these are set in your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Database Schema

The authentication system expects a `profiles` table:

```sql
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  created_at timestamptz DEFAULT now()
);
```

This is already created in the migration: `supabase/migrations/20251109134151_create_resume_builder_schema.sql`

## Usage Examples

### Check Authentication Status

```typescript
'use client';

import { useAuthStore } from '@/stores/authStore';

export default function MyComponent() {
  const { user, loading } = useAuthStore();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please sign in</div>;

  return <div>Welcome, {user.email}!</div>;
}
```

### Server-Side Authentication Check

```typescript
import { getServerSession } from '@/lib/auth/session';

export default async function ServerComponent() {
  const { user } = await getServerSession();

  if (!user) {
    redirect('/sign-in');
  }

  return <div>Welcome, {user.email}!</div>;
}
```

### Sign Out

```typescript
'use client';

import { useAuthStore } from '@/stores/authStore';

export default function SignOutButton() {
  const { signOut } = useAuthStore();

  const handleSignOut = async () => {
    await signOut();
    router.push('/sign-in');
  };

  return <button onClick={handleSignOut}>Sign Out</button>;
}
```

## Features

✅ Email/Password authentication
✅ Google OAuth authentication
✅ Session persistence
✅ Automatic token refresh
✅ Protected routes
✅ Server-side session management
✅ Client-side state management
✅ Password reset flow
✅ Email verification
✅ Profile creation on signup
✅ Automatic profile creation for OAuth users

## Next Steps

After authentication is set up, you can:
1. Implement resume storage (Phase 2)
2. Add user profile management
3. Implement OAuth providers
4. Add email verification checks
5. Implement role-based access control (if needed)

## Troubleshooting

### Session not persisting
- Check that middleware is properly configured
- Verify `@supabase/ssr` is installed
- Check browser cookies are enabled

### Redirect loops
- Ensure middleware matcher excludes auth routes
- Check that auth pages don't require authentication

### "Supabase not configured" errors
- Verify environment variables are set
- Check that variables start with correct prefixes
- Ensure `.env.local` is loaded in development
