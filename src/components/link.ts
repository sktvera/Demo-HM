import { styled } from 'stitches.config'

export const Link = styled('a', {
  textDecorationLine: 'none',
  textUnderlineOffset: '3px',
  WebkitTapHighlightColor: 'rgba(0,0,0,0)',
  lineHeight: 'inherit',
  [`&:not(:has(button)):hover`]: {
    textDecorationLine: 'underline',
  },
  [`&:has(button):hover`]: {
    textDecorationLine: 'none',
  },
  '&:focus': {
    outlineWidth: '2px',
    outlineStyle: 'solid',
    outlineOffset: '2px',
  },
  variants: {
    variant: {
      orange: {
        color: '$orange200',
        '&:focus': {
          color: '$orange300',
        },
      },
      black: {
        color: '$shade300',
        '&:focus': {
          color: '$shade200',
        },
      },
    },
  },
  defaultVariants: {
    variant: 'orange',
  },
})
