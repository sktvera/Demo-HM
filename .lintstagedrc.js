const path = require('path')

module.exports = {
  '*.{js,jsx,mjs,ts,tsx,md,mdx,json}': files => {
    const targets = files
      .map(file => {
        const relativePath = path.relative(__dirname, file)
        return relativePath
      })
      .join(' ')

    return `pnpm dlx eslint ${targets}`
  },
}
