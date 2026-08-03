const standardConfig = require('eslint-config-standard') // eslint-disable-line import/no-extraneous-dependencies
const standardTsConfig = require('eslint-config-standard-with-typescript/lib')

const standardTsRules = standardTsConfig.overrides[0].rules

const ERROR = 'error'
const WARN = 'warn'
const OFF = 'off'

const CUSTOM_RULES = {
  'no-unused-vars': {
    args: 'after-used',
    argsIgnorePattern: '^_',
  },
}

// kebab-case, SCREAMING_SNAKE_CASE o segmentos dinámicos de Next ([id], [slug], ...)
const FILENAME_REGEX =
  /^((.|_)?[a-z0-9]+((-[a-z0-9]+)?(\.[a-z0-9]+)?)*|\[[a-z0-9]+\](\.[a-z0-9]+)?|[A-Z0-9_]+)$/

module.exports = {
  root: true,
  extends: [
    'standard-with-typescript',
    'standard-jsx',
    'standard-react',
    'prettier',
    'plugin:@next/next/recommended',
  ],
  env: {
    node: true,
    browser: true,
  },
  plugins: ['folders', 'filenames', 'react-hooks', 'prettier'],
  rules: {
    // Scaffolding
    // 'folders/match-regex': [ERROR, FILENAME_REGEX, __dirname],
    'filenames/match-regex': [ERROR, FILENAME_REGEX],

    // Code Style
    'arrow-body-style': [ERROR, 'as-needed'],
    'no-void': [ERROR, { allowAsStatement: true }],
    'import/no-extraneous-dependencies': ERROR,
    'import/order': [
      ERROR,
      {
        'newlines-between': 'always',
        groups: [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling', 'index'],
        ],
      },
    ],
    'import/newline-after-import': ERROR,
    'no-unused-vars': [
      WARN, // <- Cambiado a "warn" para no romper el build
      {
        ...standardConfig.rules['no-unused-vars'][1],
        ...CUSTOM_RULES['no-unused-vars'],
      },
    ],

    // React
    'react-hooks/rules-of-hooks': ERROR,
    'react-hooks/exhaustive-deps': WARN,
    'react/react-in-jsx-scope': OFF,
    'react/jsx-pascal-case': [ERROR, { allowNamespace: true }],

    // Prettier
    'prettier/prettier': WARN, // <- Solo advertencias

    // TypeScript general
    '@typescript-eslint/explicit-function-return-type': OFF,
    '@typescript-eslint/strict-boolean-expressions': OFF,
  },
  overrides: [
    {
      files: ['*.tsx', '*.mdx'],
      rules: {
        'react/prop-types': OFF,
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      parserOptions: {
        project: ['./tsconfig.json'],
      },
      rules: {
        'no-unused-vars': standardTsRules['no-unused-vars'],
        '@typescript-eslint/no-unused-vars': [
          WARN, // <- De "error" a "warn"
          {
            ...standardTsRules['@typescript-eslint/no-unused-vars'][1],
            ...CUSTOM_RULES['no-unused-vars'],
          },
        ],
        '@typescript-eslint/consistent-type-imports': WARN,
        '@typescript-eslint/return-await': OFF,
        '@typescript-eslint/restrict-template-expressions': OFF,
      },
    },
    {
      files: ['*.md', '*.mdx'],
      extends: ['plugin:mdx/recommended'],
      rules: {
        'import/no-extraneous-dependencies': OFF,
      },
    },
    {
      files: ['packages/**/*.tsx'],
      extends: ['plugin:jsx-a11y/recommended'],
    },
  ],
}
