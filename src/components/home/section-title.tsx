import type { ReactNode } from 'react'
import { Box, Text } from 'components'

// Título de sección con línea naranja y texto superior (overline)
export const SectionTitle = ({
  overline,
  children,
  light = false,
}: {
  overline: string
  children: ReactNode
  light?: boolean
}): JSX.Element => (
  <Box css={{ maxWidth: 900, marginBottom: '$7' }}>
    <Text
      as='span'
      css={{
        display: 'flex',
        alignItems: 'center',
        gap: '$3',
        color: '$orange200',
        textTransform: 'uppercase',
        letterSpacing: '.16em',
        fontSize: '$2',
        fontWeight: '$bold',
        '&::before': {
          content: '',
          width: 32,
          height: 2,
          background: '$orange200',
        },
      }}
    >
      {overline}
    </Text>
    <Text
      as='h2'
      css={{
        color: light ? '$white' : '$black',
        fontSize: '$7',
        lineHeight: 1.02,
        letterSpacing: '-.035em',
        marginTop: '$4',
        '@desktop': { fontSize: '$9' },
      }}
    >
      {children}
    </Text>
  </Box>
)
