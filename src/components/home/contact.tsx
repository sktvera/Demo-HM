import { Box, Text } from 'components'
import { Reveal } from 'components/reveal'
import { ContactWhatsApp } from 'components/contact-whatsapp'
import { Container } from 'layout'

import { SectionTitle } from './section-title'

// Formulario de contacto que envía por WhatsApp (ancla #contacto)
export const ContactSection = (): JSX.Element => (
  <Box id='contacto' css={{ padding: '$10 $5', background: '#f1f0ed' }}>
    <Container>
      <Box className='contact-layout'>
        <Reveal>
          <SectionTitle overline='Hablemos'>
            Cuéntenos qué necesita. Nosotros le orientamos.
          </SectionTitle>
          <Text css={{ color: '$shade300', fontSize: '$4', maxWidth: 560 }}>
            Complete sus datos y enviaremos la solicitud directamente a nuestro
            equipo mediante WhatsApp.
          </Text>
        </Reveal>
        <Reveal delay={150}>
          <ContactWhatsApp />
        </Reveal>
      </Box>
    </Container>
  </Box>
)
