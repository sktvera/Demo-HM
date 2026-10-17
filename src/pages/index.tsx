import type { ReactElement } from 'react'
import Head from 'next/head'
import { FloatingWhatsApp } from 'components/floating-whatsapp'
import {
  HeroSection,
  FeaturesMarquee,
  ProgramsSection,
  TrainingSection,
  ServicesSection,
  OshaSection,
  CertificateCheckSection,
  TrustSection,
  ContactSection,
  FinalCtaSection,
} from 'components/home'
import { Shell } from 'layout'

import type { NextPageWithLayout } from './_app'

// El Header y el Footer los pone <Shell> (layout/shell.tsx)
const Page: NextPageWithLayout = () => (
  <>
    <Head>
      <title>Certificación de montacarguistas | HM Maquinaria</title>
      <meta
        name='description'
        content='Cursos de certificación, re-certificación y formación de montacarguistas con evaluación teórica y práctica.'
      />
    </Head>

    {/* Header (desde Shell) */}

    {/* Hero: portada principal */}
    <HeroSection />

    {/* Marquesina de características */}
    <FeaturesMarquee />

    {/* Programas / cursos (#programas) */}
    <ProgramsSection />

    {/* Aprender haciendo */}
    <TrainingSection />

    {/* Servicios */}
    <ServicesSection />

    {/* Certificación OSHA */}
    <OshaSection />

    {/* Consultar certificado */}
    <CertificateCheckSection />

    {/* Empresas y sectores que confían */}
    <TrustSection />

    {/* Contacto (#contacto) */}
    <ContactSection />

    {/* Llamado final a la acción */}
    <FinalCtaSection />

    {/* Footer (desde Shell) */}

    {/* Botón flotante de WhatsApp */}
    <FloatingWhatsApp />
  </>
)

Page.getLayout = (page: ReactElement) => <Shell>{page}</Shell>

export default Page
