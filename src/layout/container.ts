import { styled } from 'stitches.config'

const StyledContainer = styled('div', {
  '@mobile': {
    width: '100%',
  },
  '@desktop': {
    minWidth: 990,
    maxWidth: 1600,
  },
  margin: '0 auto',
})

export const Container = StyledContainer
