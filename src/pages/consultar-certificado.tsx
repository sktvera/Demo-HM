import type { ReactElement } from 'react'
import { useState } from 'react'
import Head from 'next/head'
import { Box, Text } from 'components'
import { Shell, Container } from 'layout'
import { readCertificateRecords } from 'platform-storage'
import type { CertificateRecord } from 'platform-storage'

import type { NextPageWithLayout } from './_app'

const Page: NextPageWithLayout = () => {
  const [document, setDocument] = useState('')
  const [searched, setSearched] = useState(false)
  const [certificate, setCertificate] = useState<CertificateRecord | null>(null)

  return (
    <>
      <Head><title>Consultar certificado | HM Maquinaria</title></Head>
      <Box css={{ minHeight: 650, display: 'grid', placeItems: 'center', padding: '$8 $5', background: '$black', color: '$white' }}>
        <Container>
          <Box css={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
            <Text as='span' css={{ color: '$orange200', textTransform: 'uppercase', letterSpacing: '.14em', fontSize: '$2', fontWeight: '$bold' }}>
              Verificación en línea
            </Text>
            <Text as='h1' css={{ fontSize: '$8', lineHeight: 1, margin: '$4 0' }}>
              Consulte su certificado
            </Text>
            <Text css={{ color: '$shade200', marginBottom: '$6' }}>
              Ingrese el número de documento del operador para validar el estado de su certificación.
            </Text>
            <form
              onSubmit={event => {
                event.preventDefault()
                const normalized = document.trim().toLowerCase()
                const found = readCertificateRecords().find(record => record.documentNumber.trim().toLowerCase() === normalized)
                setCertificate(found ?? null)
                setSearched(true)
              }}
            >
              <input
                value={document}
                onChange={event => {
                  setDocument(event.target.value)
                  setSearched(false)
                }}
                placeholder='Número de documento'
                inputMode='numeric'
                required
                style={{ width: '100%', border: 0, borderRadius: 999, padding: '16px 22px', background: 'white' }}
              />
              <button type='submit' style={{ border: 0, borderRadius: 999, padding: '15px 28px', marginTop: 16, background: '#ff6600', color: 'white', fontWeight: 650, cursor: 'pointer' }}>
                Consultar certificado
              </button>
            </form>
            {searched && certificate && (
              <Box className='certificate-search-result valid'>
                <Text as='span'>Certificado encontrado</Text>
                <Text as='h2'>{certificate.fullName}</Text>
                <Text>{certificate.documentType} · {certificate.documentNumber}</Text>
                <Box><strong>Curso / equipo</strong><span>{certificate.equipment}</span><strong>Instructor</strong><span>{certificate.instructor}</span><strong>Vigencia</strong><span>{certificate.issuedAt} hasta {certificate.expiresAt}</span></Box>
                <Text className='certificate-validity'>✓ Certificación vigente</Text>
              </Box>
            )}
            {searched && !certificate && (
              <Box css={{ marginTop: '$5', padding: '$5', border: '1px solid $shade400', borderRadius: 18 }}>
                <Text css={{ fontWeight: '$bold' }}>No encontramos un certificado asociado.</Text>
                <Text css={{ color: '$shade200', fontSize: '$2', marginTop: '$2' }}>
                  Esta es una consulta local de demostración. Escríbanos para validar el certificado con nuestro equipo.
                </Text>
                <a href={`https://wa.me/573042425384?text=${encodeURIComponent(`Hola, quiero validar el certificado del documento ${document}`)}`} style={{ color: '#ff8833', display: 'inline-block', marginTop: 12 }}>
                  Validar por WhatsApp →
                </a>
              </Box>
            )}
          </Box>
        </Container>
      </Box>
    </>
  )
}

Page.getLayout = (page: ReactElement) => <Shell>{page}</Shell>

export default Page
