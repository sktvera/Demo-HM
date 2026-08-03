import type { ComponentPropsWithRef } from 'react'
import React from 'react'
import { styled, globalCss } from 'stitches.config'

import { DesktopOnly } from './desktop-only'

const globalStyles = globalCss({
  body: {
    background: '$shade100',
    fontFamily: 'sans-serif',
    fontSize: '$2',
    '@print': {
      background: 'white',
    },
  },
  '#__next': { display: 'flex' },
})

const Letter = styled('div', {
  position: 'relative',
  boxSizing: 'border-box',
  background: '$white',
  // letter paper size 22x28 (use -1cm for safe print)
  width: '21cm',
  minHeight: '27cm',
  margin: 'auto',
  padding: '.25cm',
  flexDirection: 'column',
  display: 'flex',
  showOn: 'desktop',
  '@print': {
    display: 'flex',
  },
})

export const Print = (
  props: ComponentPropsWithRef<typeof Letter>
): JSX.Element => {
  globalStyles()

  return (
    <>
      <DesktopOnly />
      <Letter {...props} className={`${props.className} page-break`} />
    </>
  )
}
