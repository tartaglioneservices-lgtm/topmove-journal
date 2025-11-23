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
    // En production, si les variables manquent, on laisse passer (pour éviter le crash)
    return res
  }

  try {
    const supabase = createMiddlewareClient({ req: request, res })
    
    // Refresh session if expired
    const { data: { session } } = await supabase.auth.getSession()

    const { pathname } = request.nextUrl

    // Routes publiques (accessibles sans connexion)
    const publicRoutes = [
      '/',
      '/auth/login',
      '/auth/signup',
      '/auth/callback',
    ]

    const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith('/auth/'))

    // Si l'utilisateur n'est pas connecté et essaie d'accéder à une route protégée
    if (!session && !isPublicRoute) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/auth/login'
      redirectUrl.searchParams.set('redirectedFrom', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Si l'utilisateur est connecté et essaie d'accéder aux pages auth
    if (session && (pathname === '/auth/login' || pathname === '/auth/signup')) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/dashboard'
      return NextResponse.redirect(redirectUrl)
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    // En cas d'erreur, on laisse passer pour ne pas bloquer l'app
    return res
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### Étape 2 : Vérifier les variables d'environnement dans Vercel

1. Va sur **Vercel** → ton projet
2. **Settings** → **Environment Variables**
3. Vérifie que tu as EXACTEMENT ces 3 variables (avec les bons noms) :
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_APP_URL
