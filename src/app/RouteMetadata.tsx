import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { PRODUCT_NAME } from './brand.ts'
import { getRouteMetadata } from './route-metadata.ts'

function updateMeta(
  attribute: 'name' | 'property',
  name: string,
  content: string | null,
) {
  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${name}"]`,
  )
  if (content === null) {
    element?.remove()
    return
  }
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, name)
    document.head.append(element)
  }
  element.content = content
}

export function RouteMetadata() {
  const { pathname } = useLocation()

  useEffect(() => {
    const metadata = getRouteMetadata(pathname)
    document.title = metadata.title
    updateMeta('name', 'description', metadata.description)
    updateMeta('name', 'robots', metadata.robots)
    updateMeta('property', 'og:site_name', PRODUCT_NAME)
    updateMeta('property', 'og:title', metadata.title)
    updateMeta('property', 'og:description', metadata.description)
    updateMeta('property', 'og:url', metadata.canonical)

    let canonical = document.head.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    )
    if (metadata.canonical === null) {
      canonical?.remove()
    } else {
      if (!canonical) {
        canonical = document.createElement('link')
        canonical.rel = 'canonical'
        document.head.append(canonical)
      }
      canonical.href = metadata.canonical
    }
  }, [pathname])

  return null
}
