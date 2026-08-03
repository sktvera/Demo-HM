import { styled, config } from 'stitches.config'

import { mapKeysToVariants } from './utils'

export const Text = styled('span', {
  variants: {
    color: mapKeysToVariants(config.theme.colors, 'color'),
    size: mapKeysToVariants(config.theme.fontSizes, 'fontSize'),
    weight: mapKeysToVariants(config.theme.fontWeights, 'fontWeight'),
  },
})
