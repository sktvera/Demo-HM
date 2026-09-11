const normalizeBasePath = value => {
  if (!value || value === '/') return ''
  return `/${value.replace(/^\/+|\/+$/g, '')}`
}

const basePath = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH)

module.exports = {
  basePath,
  assetPrefix: basePath || undefined,
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })

    return config
  },
}
