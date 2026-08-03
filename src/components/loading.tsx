import { asset } from 'paths'
import { useRef, useEffect } from 'react'
import { styled, keyframes } from 'stitches.config'
// @ts-expect-error
import { Polygon } from 'vendor/polygon'

const rotation = keyframes({
  from: {
    transform: 'rotateY(0)',
  },
  to: {
    transform: 'rotateY(360deg)',
  },
})

const shadowPulse = keyframes({
  from: {
    backgroundSize: '80% 80%',
  },
  to: {
    backgroundSize: '100% 100%',
  },
})

const Stage = styled('div', {
  perspective: 500,
  '.polygon, .shape, .layer': {
    transformStyle: 'preserve-3d',
  },
  '.shape': {
    position: 'relative',

    '&, .layer, .front, .back': { height: '100%' },

    '.layer': {
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'absolute',

      '&.top, &.bottom, .front, .back': {
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
      },

      '.back': {
        transform: 'rotateY(180deg) translateZ(1px)',
      },
    },
  },
})

const Square = styled('div', {
  animation: `${rotation} 10s linear infinite`,
  margin: '100px auto',
  width: 150,
  height: 135,
  '.layer': {
    '.front': {
      background: `url(${asset('/images/logo.png')})`,
      backgroundSize: 'cover',
    },
    '.back': { background: '$orange200' },
  },
  '.bottom': {
    background:
      'radial-gradient(farthest-side, black, transparent) center no-repeat',
    animation: `${shadowPulse} 2s linear infinite alternate`,
  },
})

export const Loading = (): JSX.Element => {
  const ref = useRef(null)

  useEffect(() => {
    // eslint-disable-next-line no-new
    new Polygon(ref.current, 4)
  }, [])

  return (
    <Stage>
      <Square ref={ref} />
    </Stage>
  )
}
