import { styled } from 'stitches.config'

// Botón tipo enlace usado en todas las secciones del home
export const Cta = styled('a', {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$3',
  minHeight: 56,
  padding: '$3 $6',
  borderRadius: '$pill',
  fontWeight: '$bold',
  transition: 'transform .25s ease, background .25s ease, color .25s ease',
  '&:hover': { textDecoration: 'none', transform: 'translateY(-3px)' },
  variants: {
    tone: {
      orange: {
        background: '$orange200',
        color: '$white',
        boxShadow: '0 12px 35px rgba(255,102,0,.3)',
        '&:hover': { background: '$orange300' },
      },
      light: { background: '$white', color: '$black' },
      outline: {
        color: '$white',
        border: '1px solid rgba(255,255,255,.5)',
        backdropFilter: 'blur(12px)',
        '&:hover': { background: '$white', color: '$black' },
      },
    },
  },
  defaultVariants: { tone: 'orange' },
})
