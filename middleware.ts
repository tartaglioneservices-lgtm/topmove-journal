import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  
  // Vérifier que les variables d'environnement sont présentes
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables')
    return res
  }

  try {
    const supabase = createMiddlewareClient({ req: request, res })
    
    // Refresh session if expired
    const { data: { session } } = await supabase.auth.getSession()

    const { pathname } = request.nextUrl

    // Routes publiques
    const publicRoutes = ['/', '/auth/login', '/auth/signup', '/auth/callback']
    const isPublicRoute = publicRoutes.some(route => 
      pathname === route || pathname.startsWith('/auth/')
    )

    // Redirection si pas connecté
    if (!session && !isPublicRoute) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/auth/login'
      redirectUrl.searchParams.set('redirectedFrom', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Redirection si connecté sur pages auth
    if (session && (pathname === '/auth/login' || pathname === '/auth/signup')) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/dashboard'
      return NextResponse.redirect(redirectUrl)
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    return res
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|assets).*)',
  ],
}
