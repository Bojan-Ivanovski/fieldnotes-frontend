import {
  PRODUCT_DESCRIPTION,
  PRODUCT_NAME,
  PRODUCT_TAGLINE,
  PUBLIC_ORIGIN,
} from '../../config/brand.ts'

export interface RouteMetadata {
  title: string
  description: string
  canonical: string | null
  robots: 'index, follow' | 'noindex, follow' | 'noindex, nofollow'
}

/** Search URLs omit query/cursor state; private and preview routes get no public URL. */
export function getRouteMetadata(pathname: string): RouteMetadata {
  const route = pathname.replace(/\/+$/, '') || '/'
  if (route === '/') {
    return {
      title: `${PRODUCT_NAME} — ${PRODUCT_TAGLINE}`,
      description: PRODUCT_DESCRIPTION,
      canonical: `${PUBLIC_ORIGIN}/`,
      robots: 'index, follow',
    }
  }
  if (route === '/search') {
    return {
      title: `Search Books and Folios — ${PRODUCT_NAME}`,
      description: `Discover public Books and Folios across User and Organization Libraries on ${PRODUCT_NAME}.`,
      canonical: `${PUBLIC_ORIGIN}/search`,
      robots: 'noindex, follow',
    }
  }

  const titles: Record<string, string> = {
    '/notes': 'All notes',
    '/notes/new': 'New note',
    '/favorites': 'Favorites',
    '/settings': 'Account settings',
    '/sign-in': 'Sign in',
    '/sign-up': 'Create account',
    '/verify-email': 'Verify email',
    '/forgot-password': 'Reset your password',
    '/reset-password': 'Choose a new password',
    '/mfa': 'Verify your sign-in',
    '/preview/account': 'Account preview',
  }
  const title =
    titles[route] ??
    (route.startsWith('/preview/') ? 'Content preview' : 'Page not found')
  return {
    title: `${title} — ${PRODUCT_NAME}`,
    description: PRODUCT_DESCRIPTION,
    canonical: null,
    robots: 'noindex, nofollow',
  }
}
