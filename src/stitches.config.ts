import type * as Stitches from '@stitches/react'
import { createStitches } from '@stitches/react'

export const breakpoints = {
  mobile: '768px',
  desktop: '992px',
  hd: '1200px',
} as const

export type Breakpoints = keyof typeof breakpoints

const media = Object.entries(breakpoints).reduce(
  (result, [key, value]) => ({
    ...result,
    [key]: `(min-width: ${value})`,
  }),
  { print: 'print' }
) as {
  [key in Breakpoints]: `(min-width: ${typeof breakpoints[key]})`
} & {
  print: 'print'
}

export type Medias = keyof typeof media

export const {
  config,
  createTheme,
  css,
  getCssText,
  globalCss,
  styled,
  theme,
  keyframes,
} = createStitches({
  theme: {
    colors: {
      black: '#000000',
      white: '#ffffff',
      shade100: '#EEEEEE',
      shade200: '#BBBBBB',
      shade300: '#777777',
      shade400: '#333333',
      orange100: '#FF8833',
      orange200: '#FF6600',
      orange300: '#DD5500',
    },
    space: {
      0: 0,
      1: '0.25rem', // 4px
      2: '0.5rem', // 8px
      3: '0.75rem', // 12px
      4: '1rem', // 16px
      5: '1.5rem', // 24px
      6: '2rem', // 32px
      7: '3rem', // 48px
      8: '4rem', // 64px
      9: '5rem', // 80px
      10: '6rem', // 96px
    },
    sizes: {},
    fontSizes: {
      1: '0.75rem', // 12px
      2: '0.875rem', // 14px
      3: '1rem', // 16px
      4: '1.125rem', // 18px
      5: '1.5rem', // 24px
      6: '2rem', // 32px
      7: '2.5rem', // 40px
      8: '3rem', // 48px
      9: '4rem', // 64px
      10: '4.5rem', // 72px
    },
    fontWeights: {
      thin: 250,
      medium: 400,
      bold: 650,
    },
    fonts: {},
    lineHeights: {
      text: 1.5,
      title: 2,
    },
    radii: {
      none: 0,
      half: '50%',
      rounded: '4px',
      pill: '999rem',
    },
  },
  utils: {
    size: (value: Stitches.PropertyValue<'width'>) => ({
      height: value,
      width: value,
    }),
    marginX: (value: Stitches.PropertyValue<'margin'>) => ({
      marginLeft: value,
      marginRight: value,
    }),
    marginY: (value: Stitches.PropertyValue<'margin'>) => ({
      marginTop: value,
      marginBottom: value,
    }),
    paddingX: (value: Stitches.PropertyValue<'padding'>) => ({
      paddingLeft: value,
      paddingRight: value,
    }),
    paddingY: (value: Stitches.PropertyValue<'padding'>) => ({
      paddingTop: value,
      paddingBottom: value,
    }),
    showOn: (media: Medias) => ({
      [media in breakpoints
        ? `@media (max-width: ${parseInt((breakpoints as any)[media]) - 1}px)`
        : `@media ${media}`]: {
        display: 'none',
      },
    }),
    hideOn: (media: Medias) => ({
      [`@${media}`]: {
        display: 'none',
      },
    }),
  },
  media,
})
