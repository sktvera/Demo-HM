import { forwardRef } from 'react'
import type { ComponentPropsWithRef } from 'react'
import { styled } from 'stitches.config'
import { asset } from 'paths'

const StyledImage = styled('img', {
  display: 'inline-flex',
  verticalAlign: 'middle',
  maxWidth: '100%',
})

export type ImageProps = ComponentPropsWithRef<typeof StyledImage>

export const Image = forwardRef<HTMLImageElement, ImageProps>(
  ({ src, ...props }, ref) => (
    <StyledImage ref={ref} src={asset(src)} {...props} />
  )
)

Image.displayName = 'Image'
