const normalizeBasePath = (value?: string): string => {
  if (!value || value === '/') return ''
  return `/${value.replace(/^\/+|\/+$/g, '')}`
}

export const BASE_PATH = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH)

export const asset = (url: string | undefined): string => {
  if (!url) return ''
  if (
    url.startsWith('http') ||
    url.startsWith('data:') ||
    url.startsWith('#') ||
    url.startsWith(BASE_PATH)
  )
    return url
  return `${BASE_PATH}/${url.replace(/^\/+/, '')}`
}
