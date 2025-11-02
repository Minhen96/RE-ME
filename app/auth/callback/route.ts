import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data } = await supabase.auth.exchangeCodeForSession(code);

    // Check if user has completed onboarding
    if (data?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      // Redirect to dashboard if profile exists, otherwise to onboarding
      if (profile) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  // Redirect to onboarding for new users or if no code
  return NextResponse.redirect(new URL('/', request.url));
}