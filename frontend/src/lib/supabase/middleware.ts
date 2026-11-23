import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  const pathname = request.nextUrl.pathname;
  const hasSessionCookie = request.cookies.get('govdash_session')?.value;

  // If Supabase is unconfigured, fallback to cookie session check only
  if (!url || !key) {
    if (hasSessionCookie && (pathname === '/login' || pathname === '/signup')) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/';
      return NextResponse.redirect(redirectUrl);
    }
    return supabaseResponse;
  }

  const supabase = createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  );

  // Refresh session
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data?.user;
  } catch {
    // Graceful fallback if auth check fails
  }

  // If already logged in, redirect away from /login or /signup
  if ((user || hasSessionCookie) && (pathname === '/login' || pathname === '/signup')) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/';
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
