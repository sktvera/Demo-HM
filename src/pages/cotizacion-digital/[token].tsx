import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { Box, Flex, Text } from 'components'
import { asset } from 'paths'

type Status = 'pendiente' | 'aprobada' | 'rechazada'
interface Quote {
  id: string
  token: string
  number: string
  client: {
    company: string
    taxId: string
    contact: string
    email: string
    phone: string
    address: string
  }
  items: Array<{
    id: string
    description: string
    quantity: number
    price: number
    taxable: boolean
  }>
  notes: string
  to: string
  cc: string
  total: number
  sentAt: string
  status: Status
  rejectionReason: string
  decidedAt?: string
  decidedBy?: string
}

const KEY = 'hm_associated_quotes'
const currency = (value: number): string =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)

const Page = (): JSX.Element => {
  const router = useRouter()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [email, setEmail] = useState('')
  const [verified, setVerified] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [terms, setTerms] = useState(false)
  const [rejectMode, setRejectMode] = useState(false)
  const [reason, setReason] = useState('')
  const token = typeof router.query.token === 'string' ? router.query.token : ''
  const quote = quotes.find(item => item.token === token)

  useEffect(() => {
    if (!router.isReady) return
    const stored = JSON.parse(localStorage.getItem(KEY) ?? '[]') as Quote[]
    setQuotes(stored)
  }, [router.isReady])

  const totals = useMemo(() => {
    if (!quote) return { subtotal: 0, tax: 0 }
    const subtotal = quote.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    )
    const tax = quote.items
      .filter(item => item.taxable)
      .reduce((sum, item) => sum + item.quantity * item.price * 0.19, 0)
    return { subtotal, tax }
  }, [quote])
  const verify = (): void => {
    if (!quote) return
    const accepted = [quote.client.email, quote.to, quote.cc]
      .flatMap(value => value.split(','))
      .map(value => value.trim().toLowerCase())
      .filter(Boolean)
    if (!accepted.includes(email.trim().toLowerCase())) {
      setEmailError(
        'El correo no coincide con los destinatarios de esta cotización.'
      )
      return
    }
    setVerified(true)
    setEmailError('')
  }
  const decide = (status: Status, rejectionReason = ''): void => {
    if (!quote) return
    const next = quotes.map(item =>
      item.id === quote.id
        ? {
            ...item,
            status,
            rejectionReason,
            decidedAt: new Date().toISOString(),
            decidedBy: email.trim().toLowerCase(),
          }
        : item
    )
    setQuotes(next)
    localStorage.setItem(KEY, JSON.stringify(next))
    setRejectMode(false)
  }

  if (!router.isReady)
    return <Box className='digital-quote-loading'>Cargando cotización…</Box>
  if (!quote)
    return (
      <Box className='digital-quote-error'>
        <strong>Enlace no disponible</strong>
        <p>La cotización no existe o el enlace dejó de ser válido.</p>
      </Box>
    )

  return (
    <Box className='digital-quote-page'>
      <Head>
        <title>{quote.number} | Cotización HM Maquinaria</title>
      </Head>
      <header className='digital-quote-header'>
        <img src={asset('/images/logo-horizontal.png')} alt='HM Maquinaria' />
        <span>Propuesta comercial segura</span>
      </header>
      {!verified ? (
        <Box className='digital-email-gate'>
          <Box className='digital-lock'>✓</Box>
          <span>Cotización digital</span>
          <Text as='h1'>Consulte su propuesta</Text>
          <p>
            Para proteger la información comercial, ingrese el correo al que fue
            enviada la cotización.
          </p>
          <label>
            Correo electrónico
            <input
              type='email'
              value={email}
              onChange={event => setEmail(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter') verify()
              }}
              placeholder='nombre@empresa.com'
            />
          </label>
          {emailError && <small>{emailError}</small>}
          <button onClick={verify}>Acceder a la cotización →</button>
          <footer>Documento {quote.number} · HM Maquinaria</footer>
        </Box>
      ) : (
        <Box className='digital-quote-container'>
          <Flex className='digital-quote-meta' justify='between' align='center'>
            <Box>
              <span>Propuesta comercial</span>
              <Text as='h1'>{quote.number}</Text>
              <p>
                Emitida el {new Date(quote.sentAt).toLocaleDateString('es-CO')}
              </p>
            </Box>
            <span className={`opportunity-status ${quote.status}`}>
              {quote.status === 'pendiente'
                ? 'Pendiente de aprobación'
                : quote.status === 'aprobada'
                ? 'Aprobada'
                : 'Rechazada'}
            </span>
          </Flex>
          <Box className='digital-client-card'>
            <span>Preparada para</span>
            <Text as='h2'>{quote.client.company}</Text>
            <p>
              {quote.client.contact} · NIT {quote.client.taxId}
              <br />
              {quote.client.email} · {quote.client.phone}
            </p>
          </Box>
          <Box className='digital-items'>
            <Box className='digital-items-head'>
              <span>Descripción</span>
              <span>Cantidad</span>
              <span>Valor unitario</span>
              <span>Total</span>
            </Box>
            {quote.items.map(item => (
              <Box key={item.id}>
                <span>{item.description}</span>
                <span>{item.quantity}</span>
                <span>{currency(item.price)}</span>
                <strong>{currency(item.quantity * item.price)}</strong>
              </Box>
            ))}
          </Box>
          <Box className='digital-totals'>
            <p>
              <span>Subtotal</span>
              <strong>{currency(totals.subtotal)}</strong>
            </p>
            <p>
              <span>IVA</span>
              <strong>{currency(totals.tax)}</strong>
            </p>
            <p>
              <span>Total propuesta</span>
              <strong>{currency(quote.total)}</strong>
            </p>
          </Box>
          <Box className='digital-terms'>
            <span>Términos y condiciones</span>
            <p>{quote.notes}</p>
            <ul>
              <li>
                Los valores y alcance corresponden exclusivamente a los
                servicios descritos.
              </li>
              <li>
                La aprobación digital registra el correo, la fecha y la decisión
                del cliente.
              </li>
              <li>
                Cambios posteriores deberán ser formalizados mediante una nueva
                cotización.
              </li>
            </ul>
          </Box>
          {quote.status === 'pendiente' ? (
            <Box className='digital-decision'>
              <label>
                <input
                  type='checkbox'
                  checked={terms}
                  onChange={event => setTerms(event.target.checked)}
                />{' '}
                He leído y acepto los términos y condiciones de esta propuesta.
              </label>
              {!rejectMode ? (
                <Flex gap='3' justify='end'>
                  <button
                    className='digital-reject'
                    onClick={() => setRejectMode(true)}
                  >
                    Rechazar cotización
                  </button>
                  <button
                    className='digital-approve'
                    disabled={!terms}
                    onClick={() => decide('aprobada')}
                  >
                    Aprobar cotización
                  </button>
                </Flex>
              ) : (
                <Box className='digital-reject-box'>
                  <label>
                    Cuéntenos el motivo del rechazo
                    <textarea
                      rows={4}
                      value={reason}
                      onChange={event => setReason(event.target.value)}
                      placeholder='Esta información ayudará a nuestro equipo comercial…'
                    />
                  </label>
                  <Flex gap='3' justify='end'>
                    <button onClick={() => setRejectMode(false)}>
                      Cancelar
                    </button>
                    <button
                      disabled={!reason.trim()}
                      onClick={() => decide('rechazada', reason.trim())}
                    >
                      Confirmar rechazo
                    </button>
                  </Flex>
                </Box>
              )}
            </Box>
          ) : (
            <Box className={`digital-result ${quote.status}`}>
              <strong>
                {quote.status === 'aprobada'
                  ? 'Cotización aprobada correctamente'
                  : 'Cotización rechazada'}
              </strong>
              <p>
                Decisión registrada el{' '}
                {quote.decidedAt
                  ? new Date(quote.decidedAt).toLocaleString('es-CO')
                  : ''}{' '}
                por {quote.decidedBy}.
              </p>
              {quote.rejectionReason && (
                <blockquote>“{quote.rejectionReason}”</blockquote>
              )}
            </Box>
          )}
        </Box>
      )}
      <footer className='digital-page-footer'>
        HM Maquinaria S.A.S. · Operación segura, formación y servicio técnico
      </footer>
    </Box>
  )
}

export default Page
