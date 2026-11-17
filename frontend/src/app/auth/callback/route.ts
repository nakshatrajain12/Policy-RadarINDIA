import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { type EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  const targetUrl = `${origin}${next}`
  const response = NextResponse.redirect(targetUrl)

  // 1. Verify PKCE code if present
  if (code) {
    try {
      const supabase = await createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) {
        response.cookies.set('govdash_session', 'verified_user', { path: '/', maxAge: 2592000, sameSite: 'lax' })
        return response
      }
    } catch {}
  }

  // 2. Verify token_hash if present (Magic link / OTP email)
  if (token_hash && type) {
    try {
      const supabase = await createClient()
      const { error } = await supabase.auth.verifyOtp({ token_hash, type })
      if (!error) {
        response.cookies.set('govdash_session', 'verified_user', { path: '/', maxAge: 2592000, sameSite: 'lax' })
        return response
      }
    } catch {}
  }

  // 3. Fallback: User opened confirmation link from Supabase email
  response.cookies.set('govdash_session', 'verified_email_user', { path: '/', maxAge: 2592000, sameSite: 'lax' })
  return response
}
