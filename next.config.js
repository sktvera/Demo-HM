const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/Demo-HM'

module.exports = {
  basePath,
  assetPrefix: `${basePath}/`,
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
