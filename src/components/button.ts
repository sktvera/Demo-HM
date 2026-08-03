import { styled } from 'stitches.config'

export const Button = styled('button', {
  boxSizing: 'border-box',
  display: 'inline-flex',
  justifyContent: 'center',
  alignItems: 'center',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  textAlign: 'center',
  verticalAlign: 'middle',
  userSelect: 'none',
  fontFamily: 'inherit',
  fontStyle: 'normal',
  fontStretch: 'normal',
  letterSpacing: 'normal',
  fontWeight: 'normal',
  position: 'relative',
  cursor: 'pointer',
  border: 'none',
  backgroundColor: 'transparent',
  borderRadius: '$pill',
  padding: '$3',
  lineHeight: 1,
  '&[disabled]': {
    pointerEvents: 'none',
    opacity: 0.4,
  },
  variants: {
    variant: {
      orange: {},
      black: {},
    },
    appearance: {
      filled: {},
      outlined: {},
    },
    fluid: {
      true: {
        width: '100%',
        display: 'block',
      },
    },
  },
  compoundVariants: [
    {
      variant: 'orange',
      appearance: 'filled',
      css: {
        color: '$white',
        backgroundColor: '$orange200',
        '&:hover': {
          backgroundColor: '$orange300',
        },
      },
    },
    {
      variant: 'orange',
      appearance: 'outlined',
      css: {
        color: '$white',
        border: '1px solid $orange200',
        '&:hover': {
          color: '$white',
          backgroundColor: '$orange200',
        },
      },
    },
    {
      variant: 'black',
      appearance: 'filled',
      css: {
        color: '$white',
        backgroundColor: '$black',
        '&:hover': {
          backgroundColor: '$shade300',
        },
      },
    },
    {
      variant: 'black',
      appearance: 'outlined',
      css: {
        color: '$black',
        border: '1px solid $black',
        '&:hover': {
          color: '$white',
          backgroundColor: '$shade300',
          borderColor: '$shade300',
        },
      },
    },
  ],
  defaultVariants: {
    variant: 'orange',
    appearance: 'filled',
  },
})
