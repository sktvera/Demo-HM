import { globalCss } from 'stitches.config'
import { normalize } from 'normalize-stitches'

export const globalStyles = globalCss({
  ...normalize,
  '@font-face': [
    {
      fontFamily: 'Overpass',
      src: 'url(https://fonts.gstatic.com/s/overpass/v12/qFdH35WCmI96Ajtm81GlU9vgwBcI.woff2) format("woff2")',
    },
  ],
  html: {
    webkitFontSmoothing: 'antialiased',
    mozOsxFontSmoothing: 'grayscale',
    boxSizing: 'border-box',
    height: '100%',
  },
  [`*,
   *:after,
   *:before`]: {
    boxSizing: 'inherit',
  },
  body: {
    background: '$shade100',
    color: '$black',
    fontFamily: 'Helvetica Neue, Arial, sans-serif',
    height: '100%',
    lineHeight: '$text',
    margin: '$0',
    fontSize: 16,
    minHeight: '100%',
    '@desktop': {
      fontSize: 18,
    },
  },
  '#__next': {
    minHeight: '100%',
  },
  a: {
    color: '$orange200',
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  'strong, b': {
    fontWeight: 'bold',
  },
  'img, svg': {
    verticalAlign: 'middle',
    display: 'inline-block',
  },
  'h1, h2, h3, h4, h5, h6': {
    margin: '$0',
    fontSize: '$5',
    fontWeight: 'bold',
    fontFamily: 'Overpass',
  },
  'ul, ol': {
    paddingLeft: '1.5em',
    marginLeft: 'none',
    ul: {
      marginTop: 'none',
      marginBottom: 'none',
      listStyle: 'disc',
    },
  },
  'ul, ol, p': {
    marginTop: 'tiny',
    marginBottom: 'small',
    '&:first-child': {
      marginTop: 'none',
    },
    '&:last-child': {
      marginBottom: 'none',
    },
  },
  'input, button, select, textarea': {
    font: 'inherit',
    lineHeight: 'inherit',
    maxWidth: '100%',
  },
  textarea: {
    display: 'block',
  },
  table: {
    borderCollapse: 'collapse',
    borderSpacing: 0,
  },
  hr: {
    backgroundColor: 'shade10',
    height: 1,
    margin: 'none',
    padding: 'none',
    border: 'none',
  },
  '[hidden]': {
    display: 'none !important',
  },
})
