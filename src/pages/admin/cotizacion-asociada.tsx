import type { ReactElement } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useReactToPrint } from 'react-to-print'
import Head from 'next/head'
import { Box, Flex, Text } from 'components'
import { asset } from 'paths'
import { AdminGuard } from 'components/admin-guard'
import { AdminShell } from 'layout/admin-shell'
import { defaultQuoteTemplates, readQuoteTemplates } from 'quote-templates'
import type { QuoteTemplate } from 'quote-templates'

import type { NextPageWithLayout } from '../_app'

interface Associate {
  id: string
  name: string
  kind: string
  taxId: string
  contact: string
  email: string
  phone: string
  address?: string
  city?: string
}
interface QuoteItem {
  id: string
  description: string
  quantity: number
  price: number
  taxable: boolean
}
interface Client {
  company: string
  taxId: string
  contact: string
  email: string
  phone: string
  address: string
}
interface SentQuote {
  id: string
  token: string
  number: string
  associateId: string
  client: Client
  items: QuoteItem[]
  notes: string
  to: string
  cc: string
  total: number
  sentAt: string
  status: 'pendiente' | 'aprobada' | 'rechazada'
  rejectionReason: string
}

const ASSOCIATES_KEY = 'hm_business_associates'
const SENT_KEY = 'hm_associated_quotes'
const currency = (value: number): string =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
const uid = (prefix: string): string =>
  `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`

const nextQuoteNumber = (sent: SentQuote[]): string => {
  const year = new Date().getFullYear()
  const max = sent
    .filter(item => item.number.startsWith(`COT-${year}-`))
    .reduce(
      (value, item) =>
        Math.max(value, Number(item.number.split('-').pop()) || 0),
      0
    )
  return `COT-${year}-${String(max + 1).padStart(4, '0')}`
}

const Page: NextPageWithLayout = () => {
  const [associates, setAssociates] = useState<Associate[]>([])
  const [templates, setTemplates] = useState<QuoteTemplate[]>(
    defaultQuoteTemplates
  )
  const [sentQuotes, setSentQuotes] = useState<SentQuote[]>([])
  const [search, setSearch] = useState('')
  const [associateId, setAssociateId] = useState('')
  const [client, setClient] = useState<Client>({
    company: '',
    taxId: '',
    contact: '',
    email: '',
    phone: '',
    address: '',
  })
  const [items, setItems] = useState<QuoteItem[]>([])
  const [notes, setNotes] = useState(
    'Vigencia de la oferta: 15 días calendario.'
  )
  const [sendOpen, setSendOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [recipient, setRecipient] = useState('')
  const [cc, setCc] = useState('')
  const [sentMessage, setSentMessage] = useState('')
  const quotePreviewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setAssociates(
      JSON.parse(localStorage.getItem(ASSOCIATES_KEY) ?? '[]') as Associate[]
    )
    setTemplates(readQuoteTemplates())
    setSentQuotes(
      JSON.parse(localStorage.getItem(SENT_KEY) ?? '[]') as SentQuote[]
    )
  }, [])

  const quoteNumber = nextQuoteNumber(sentQuotes)
  const selectedAssociate = associates.find(item => item.id === associateId)
  const matches = search.trim()
    ? associates
        .filter(
          item =>
            item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.taxId.toLowerCase().includes(search.toLowerCase())
        )
        .slice(0, 6)
    : []
  const totals = useMemo(() => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    )
    const tax = items
      .filter(item => item.taxable)
      .reduce((sum, item) => sum + item.quantity * item.price * 0.19, 0)
    return { subtotal, tax, total: subtotal + tax }
  }, [items])
  const chooseAssociate = (associate: Associate): void => {
    setAssociateId(associate.id)
    setSearch('')
    setClient({
      company: associate.name,
      taxId: associate.taxId,
      contact: associate.contact,
      email: associate.email,
      phone: associate.phone,
      address: [associate.address, associate.city].filter(Boolean).join(', '),
    })
  }
  const applyTemplate = (template: QuoteTemplate): void => {
    setItems(template.items.map(item => ({ ...item, id: uid('item') })))
    setNotes(template.notes)
  }
  const updateItem = (id: string, patch: Partial<QuoteItem>): void =>
    setItems(items.map(item => (item.id === id ? { ...item, ...patch } : item)))
  const openSend = (): void => {
    setRecipient(client.email)
    setCc('')
    setSentMessage('')
    setSendOpen(true)
  }
  const sendQuote = (): void => {
    if (!selectedAssociate || !recipient || !items.length) return
    const record: SentQuote = {
      id: uid('quote'),
      token: uid('digital'),
      number: quoteNumber,
      associateId,
      client,
      items,
      notes,
      to: recipient,
      cc,
      total: totals.total,
      sentAt: new Date().toISOString(),
      status: 'pendiente',
      rejectionReason: '',
    }
    const next = [...sentQuotes, record]
    setSentQuotes(next)
    localStorage.setItem(SENT_KEY, JSON.stringify(next))
    setSentMessage(`Cotización ${quoteNumber} registrada como enviada.`)
  }
  const downloadPdf = useReactToPrint({
    contentRef: quotePreviewRef,
    documentTitle: `${quoteNumber}-${client.company.replace(/\s+/g, '-')}`,
    pageStyle:
      '@page { size: A4; margin: 14mm; } @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }',
  })

  return (
    <AdminGuard permission='quotes.manage'>
      <Head>
        <title>Cotización asociada | Administración HM</title>
      </Head>
      <Flex className='associated-quote-heading' justify='between' align='end'>
        <Box>
          <Text as='h1' css={{ fontSize: '$7' }}>
            Cotización asociada
          </Text>
          <Text css={{ color: '$shade300' }}>
            Cree propuestas reutilizables vinculadas a sus asociados de negocio.
          </Text>
        </Box>
        <span className='associated-quote-number'>
          {quoteNumber}
          <small>Número único reservado</small>
        </span>
      </Flex>

      <Box className='associated-stepper'>
        <span className='active'>
          <b>1</b>Seleccionar asociado
        </span>
        <span className={selectedAssociate ? 'active' : ''}>
          <b>2</b>Preparar cotización
        </span>
        <span>
          <b>3</b>Revisar y enviar
        </span>
      </Box>

      {!selectedAssociate ? (
        <Box className='associate-search-stage'>
          <Box className='associate-search-hero'>
            <span>01 · Cliente</span>
            <Text as='h2'>¿Para quién es la cotización?</Text>
            <Text>
              Busque un asociado registrado por razón social o número de
              documento.
            </Text>
            <Box className='associate-live-search'>
              <input
                autoFocus
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder='Ej. Logística Nacional o 901.357.485-1'
              />
              <b>⌕</b>
              {matches.length > 0 && (
                <Box className='associate-search-results'>
                  {matches.map(associate => (
                    <button
                      key={associate.id}
                      onClick={() => chooseAssociate(associate)}
                    >
                      <span className='associate-logo'>
                        {associate.name.slice(0, 2).toUpperCase()}
                      </span>
                      <span>
                        <strong>{associate.name}</strong>
                        <small>
                          {associate.kind} ·{' '}
                          {associate.taxId || 'Sin documento'} ·{' '}
                          {associate.contact}
                        </small>
                      </span>
                      <b>Seleccionar →</b>
                    </button>
                  ))}
                </Box>
              )}
            </Box>
            {search && !matches.length && (
              <Box className='associated-no-results'>
                <strong>No encontramos este asociado</strong>
                <span>
                  Créelo primero desde el módulo Asociados de negocio.
                </span>
              </Box>
            )}
          </Box>
        </Box>
      ) : (
        <Box className='associated-quote-layout'>
          <Box className='associated-editor'>
            <section className='associated-card'>
              <Flex justify='between' align='center'>
                <Box>
                  <span className='associated-eyebrow'>
                    Cliente seleccionado
                  </span>
                  <Text as='h2'>{client.company}</Text>
                </Box>
                <button
                  className='access-action'
                  onClick={() => {
                    setAssociateId('')
                    setItems([])
                  }}
                >
                  Cambiar asociado
                </button>
              </Flex>
              <Box className='associate-form-grid associated-client-form'>
                <label className='admin-field wide'>
                  Razón social
                  <input
                    value={client.company}
                    onChange={event =>
                      setClient({ ...client, company: event.target.value })
                    }
                  />
                </label>
                <label className='admin-field'>
                  NIT / Documento
                  <input
                    value={client.taxId}
                    onChange={event =>
                      setClient({ ...client, taxId: event.target.value })
                    }
                  />
                </label>
                <label className='admin-field'>
                  Contacto principal
                  <input
                    value={client.contact}
                    onChange={event =>
                      setClient({ ...client, contact: event.target.value })
                    }
                  />
                </label>
                <label className='admin-field'>
                  Correo
                  <input
                    value={client.email}
                    onChange={event =>
                      setClient({ ...client, email: event.target.value })
                    }
                  />
                </label>
                <label className='admin-field'>
                  Teléfono
                  <input
                    value={client.phone}
                    onChange={event =>
                      setClient({ ...client, phone: event.target.value })
                    }
                  />
                </label>
              </Box>
            </section>

            <section className='associated-card'>
              <span className='associated-eyebrow'>
                Plantillas reutilizables
              </span>
              <Text as='h2'>Elija un punto de partida</Text>
              <Box className='quote-template-grid'>
                {templates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => applyTemplate(template)}
                  >
                    <span>{template.category}</span>
                    <strong>{template.name}</strong>
                    <small>{template.description}</small>
                    <b>Usar plantilla →</b>
                  </button>
                ))}
              </Box>
            </section>

            <section className='associated-card'>
              <Flex justify='between' align='center'>
                <Box>
                  <span className='associated-eyebrow'>Detalle comercial</span>
                  <Text as='h2'>Ítems de la cotización</Text>
                </Box>
                <button
                  className='admin-secondary-button'
                  onClick={() =>
                    setItems([
                      ...items,
                      {
                        id: uid('item'),
                        description: '',
                        quantity: 1,
                        price: 0,
                        taxable: true,
                      },
                    ])
                  }
                >
                  + Agregar ítem
                </button>
              </Flex>
              <Box className='associated-items'>
                {items.map((item, index) => (
                  <Box key={item.id}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <textarea
                      rows={2}
                      value={item.description}
                      onChange={event =>
                        updateItem(item.id, { description: event.target.value })
                      }
                      placeholder='Descripción del servicio'
                    />
                    <input
                      type='number'
                      min='1'
                      value={item.quantity}
                      onChange={event =>
                        updateItem(item.id, {
                          quantity: Number(event.target.value),
                        })
                      }
                    />
                    <input
                      type='number'
                      min='0'
                      value={item.price || ''}
                      onChange={event =>
                        updateItem(item.id, {
                          price: Number(event.target.value),
                        })
                      }
                      placeholder='Valor unitario'
                    />
                    <label>
                      <input
                        type='checkbox'
                        checked={item.taxable}
                        onChange={event =>
                          updateItem(item.id, { taxable: event.target.checked })
                        }
                      />{' '}
                      IVA
                    </label>
                    <button
                      onClick={() =>
                        setItems(items.filter(value => value.id !== item.id))
                      }
                    >
                      ×
                    </button>
                  </Box>
                ))}
              </Box>
              {!items.length && (
                <Box className='access-empty'>
                  <strong>Aún no hay ítems</strong>
                  <p>Seleccione una plantilla o agregue un ítem manualmente.</p>
                </Box>
              )}
              <label className='admin-field associated-notes'>
                Notas y condiciones
                <textarea
                  rows={4}
                  value={notes}
                  onChange={event => setNotes(event.target.value)}
                />
              </label>
              <Flex className='associated-total' justify='end'>
                <Box>
                  <p>
                    <span>Subtotal</span>
                    <strong>{currency(totals.subtotal)}</strong>
                  </p>
                  <p>
                    <span>IVA</span>
                    <strong>{currency(totals.tax)}</strong>
                  </p>
                  <p>
                    <span>Total</span>
                    <strong>{currency(totals.total)}</strong>
                  </p>
                </Box>
              </Flex>
              <Flex justify='end'>
                <button
                  className='admin-primary-button associated-send-button'
                  disabled={!items.length || !client.company}
                  onClick={openSend}
                >
                  Enviar al cliente →
                </button>
              </Flex>
            </section>
          </Box>
        </Box>
      )}

      {sendOpen && (
        <Box
          className='admin-modal access-drawer quote-send-drawer'
          onClick={() => setSendOpen(false)}
        >
          <Box
            className='admin-modal-card'
            onClick={event => event.stopPropagation()}
          >
            <Box className='quote-send-header'>
              <Flex justify='between' align='center'>
                <Box>
                  <span>Envío de cotización</span>
                  <Text as='h2'>{quoteNumber}</Text>
                  <Text css={{ color: '$shade300', fontSize: '$2' }}>
                    Confirme destinatarios y revise el documento.
                  </Text>
                </Box>
                <button
                  className='drawer-close'
                  onClick={() => setSendOpen(false)}
                >
                  ×
                </button>
              </Flex>
            </Box>
            <Box className='quote-send-body'>
              <Box className='quote-send-client'>
                <span className='associate-logo'>
                  {client.company.slice(0, 2).toUpperCase()}
                </span>
                <Box>
                  <strong>{client.company}</strong>
                  <small>
                    {client.contact} · {client.taxId}
                  </small>
                </Box>
                <strong>{currency(totals.total)}</strong>
              </Box>
              <button
                className='quote-preview-trigger'
                onClick={() => setPreviewOpen(!previewOpen)}
              >
                {previewOpen
                  ? 'Ocultar vista previa'
                  : 'Previsualizar cotización'}{' '}
                <span>{previewOpen ? '↑' : '↓'}</span>
              </button>
              {previewOpen && (
                <Box className='quote-preview-download-wrap'>
                  <Flex
                    className='quote-preview-toolbar'
                    justify='between'
                    align='center'
                  >
                    <span>Vista previa del documento</span>
                    <button onClick={() => downloadPdf()}>
                      ↓ Descargar PDF
                    </button>
                  </Flex>
                  <Box
                    className='quote-mini-preview quote-print-document'
                    ref={quotePreviewRef}
                  >
                    <Flex justify='between'>
                      <img
                        src={asset('/images/logo-horizontal.png')}
                        alt='HM Maquinaria'
                      />
                      <Box>
                        <strong>COTIZACIÓN</strong>
                        <small>#{quoteNumber}</small>
                        <small>{new Date().toLocaleDateString('es-CO')}</small>
                      </Box>
                    </Flex>
                    <p>
                      Señores
                      <br />
                      <strong>{client.company}</strong>
                      <br />
                      {client.contact} · {client.taxId}
                      <br />
                      {client.email} · {client.phone}
                    </p>
                    <div className='quote-print-table-head'>
                      <span>Descripción</span>
                      <span>Cant.</span>
                      <span>Valor</span>
                    </div>
                    {items.map(item => (
                      <div key={item.id}>
                        <span>{item.description}</span>
                        <span>{item.quantity}</span>
                        <strong>{currency(item.quantity * item.price)}</strong>
                      </div>
                    ))}
                    <Box className='quote-print-totals'>
                      <p>
                        <span>Subtotal</span>
                        <strong>{currency(totals.subtotal)}</strong>
                      </p>
                      <p>
                        <span>IVA</span>
                        <strong>{currency(totals.tax)}</strong>
                      </p>
                    </Box>
                    <footer>
                      Total <strong>{currency(totals.total)}</strong>
                    </footer>
                    <Box className='quote-print-notes'>
                      <strong>Notas y condiciones</strong>
                      <p>{notes}</p>
                    </Box>
                  </Box>
                </Box>
              )}
              <label className='admin-field'>
                Correo del destinatario *
                <input
                  type='email'
                  value={recipient}
                  onChange={event => setRecipient(event.target.value)}
                />
              </label>
              <label className='admin-field'>
                CC
                <input
                  type='email'
                  value={cc}
                  onChange={event => setCc(event.target.value)}
                  placeholder='correo.adicional@empresa.com'
                />
              </label>
              <Box className='quote-send-note'>
                <strong>¿Qué ocurrirá?</strong>
                <p>
                  La cotización quedará registrada con este número único y
                  marcada como enviada al cliente.
                </p>
              </Box>
              {sentMessage && (
                <Box className='quote-send-success'>{sentMessage}</Box>
              )}
            </Box>
            <Flex className='quote-send-footer' justify='end' gap='3'>
              <button
                className='admin-secondary-button'
                onClick={() => setSendOpen(false)}
              >
                Cancelar
              </button>
              <button
                className='admin-primary-button'
                disabled={!recipient || Boolean(sentMessage)}
                onClick={sendQuote}
              >
                {sentMessage
                  ? 'Cotización enviada'
                  : 'Enviar cotización al cliente'}
              </button>
            </Flex>
          </Box>
        </Box>
      )}
    </AdminGuard>
  )
}

Page.getLayout = (page: ReactElement) => <AdminShell>{page}</AdminShell>
export default Page
