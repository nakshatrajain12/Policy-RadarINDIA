import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'placeholder-anon-key',
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
  )

  // Refresh session — DO NOT remove this
  const { data: { user } } = await supabase.auth.getUser()
  
  const pathname = request.nextUrl.pathname;

  // Public paths — always allow 
  const isPublicPath = ['/login', '/signup', '/auth/callback'].some(p => pathname.startsWith(p));
  
  const isDev = process.env.NODE_ENV === 'development'
  
  if (!user && !isPublicPath && !isDev) {
    // Not logged in and trying to access protected route → redirect to login
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && (pathname.startsWith('/login') || pathname.startsWith('/signup'))) {
    // Already logged in, redirect away from auth pages
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
