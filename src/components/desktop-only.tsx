import { styled } from 'stitches.config'
import { Loading } from 'components'

const MobileMessage = styled('div', {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  hideOn: 'desktop',
  '@print': {
    display: 'none',
  },
})

export const DesktopOnly = (): JSX.Element => (
  <MobileMessage>
    <Loading />
  </MobileMessage>
)
