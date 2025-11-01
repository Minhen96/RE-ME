import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Force dynamic rendering and Node.js runtime for this server-side operation
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Handles the Supabase OAuth callback by exchanging the authorization 'code' for a user session.
 * It also checks if the user has a profile and redirects accordingly (to home or onboarding).
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  console.log('🔍 Auth callback triggered. Code is:', code ? 'present' : 'missing');

  // --- 1. Code Validation Check ---
  if (!code) {
    console.error('❌ Missing "code" parameter in callback URL.');
    return NextResponse.redirect(new URL('/auth/login?error=no_code', origin));
  }

  try {
    const cookieStore = cookies();

    // --- 2. Initialize Supabase Server Client ---
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name: string) => cookieStore.get(name)?.value,
          set: (name: string, value: string, options: CookieOptions) => {
            try {
              cookieStore.set({ name, value, ...options });
            } catch (e) {
              console.error('Cookie set error:', e);
            }
          },
          remove: (name: string, options: CookieOptions) => {
            try {
              // Set value to empty string and rely on options to delete/expire
              cookieStore.set({ name, value: '', ...options }); 
            } catch (e) {
              console.error('Cookie remove error:', e);
            }
          },
        },
      }
    );

    console.log('🔐 Exchanging authorization code for user session...');

    // --- 3. Exchange Code for Session ---
    const { data: { session, user }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

    if (sessionError || !session) {
      console.error('❌ Session exchange failed:', sessionError?.message || 'No session returned.');
      return NextResponse.redirect(new URL('/auth/login?error=session_failed', origin));
    }

    console.log('✅ Session created for user ID:', user.id);

    // --- 4. Check for User Profile (Onboarding Check) ---
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id') // Only select the ID for efficiency
      .eq('id', user.id)
      .single();

    // PGRST116 indicates 'no rows found,' which is expected if the profile doesn't exist yet.
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('⚠️ Profile check query error (not a not-found error):', profileError.message);
    }

    if (!profile) {
      console.log('📝 New user: Profile not found. Redirecting to onboarding.');
      return NextResponse.redirect(new URL('/onboarding', origin));
    }

    console.log('✅ Existing user: Profile found. Redirecting to home page.');
    return NextResponse.redirect(new URL('/', origin));

  } catch (error) {
    // General unexpected error handler
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Callback unexpected error:', errorMessage);
    return NextResponse.redirect(new URL('/auth/login?error=unexpected', origin));
  }
}