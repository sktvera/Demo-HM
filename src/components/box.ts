import { styled } from 'stitches.config'

export const Box = styled('div', {
  boxSizing: 'border-box',
  variants: {
    fluid: {
      true: {
        flexBasis: 0,
        flexGrow: 1,
        maxWidth: '100%',
        width: '100%',
        maxHeight: '100%',
        height: '100%',
      },
    },
  },
})
