import type { ReactElement } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useReactToPrint } from 'react-to-print'
import Head from 'next/head'
import { Box, Flex, Text } from 'components'
import { asset } from 'paths'
import { AdminGuard } from 'components/admin-guard'
import { AdminShell } from 'layout/admin-shell'

import type { NextPageWithLayout } from '../_app'

type Status = 'pendiente' | 'aprobada' | 'rechazada'
interface Quote {
  id: string
  token: string
  number: string
  associateId: string
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
  purchaseOrder?: { number: string; comment: string; registeredAt: string }
  collections?: Array<{
    id: string
    type: 'abono' | 'pago_total'
    amount: number
    comment: string
    registeredAt: string
    invoiceNumber?: string
    invoiceEmail?: string
    invoiceCc?: string
    invoiceSentAt?: string
  }>
  invoices?: Array<{
    id: string
    number: string
    amount: number
    email: string
    cc: string
    sentAt?: string
    createdAt: string
  }>
  settlementReceipt?: {
    number: string
    email: string
    cc: string
    sentAt?: string
    createdAt: string
  }
}

const KEY = 'hm_associated_quotes'
const PAGE_SIZE = 8
const currency = (value: number): string =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
const statusLabel: Record<Status, string> = {
  pendiente: 'Pendiente de aprobación',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
}

const Page: NextPageWithLayout = () => {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('todos')
  const [page, setPage] = useState(1)
  const [rejecting, setRejecting] = useState<Quote | null>(null)
  const [reason, setReason] = useState('')
  const [copied, setCopied] = useState('')
  const [ordering, setOrdering] = useState<Quote | null>(null)
  const [orderForm, setOrderForm] = useState({ number: '', comment: '' })
  const [collecting, setCollecting] = useState<Quote | null>(null)
  const [collectionForm, setCollectionForm] = useState({
    type: 'abono' as 'abono' | 'pago_total',
    amount: '',
    comment: '',
  })
  const [invoiceContact, setInvoiceContact] = useState({ email: '', cc: '' })
  const [summary, setSummary] = useState<Quote | null>(null)
  const [summaryTab, setSummaryTab] = useState<
    'quote' | 'approval' | 'order' | 'collections'
  >('quote')
  const [receiptContact, setReceiptContact] = useState({ email: '', cc: '' })
  const [receiptMessage, setReceiptMessage] = useState('')
  const invoiceRef = useRef<HTMLDivElement>(null)
  const receiptRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(KEY) ?? '[]') as Array<
      Partial<Quote>
    >
    const normalized = stored.map(quote => ({
      ...quote,
      token: quote.token ?? `digital-${quote.id}`,
      status: quote.status ?? 'pendiente',
      rejectionReason: quote.rejectionReason ?? '',
      collections: quote.collections ?? [],
      invoices: quote.invoices ?? [],
    })) as Quote[]
    setQuotes(normalized)
    localStorage.setItem(KEY, JSON.stringify(normalized))
  }, [])

  const save = (next: Quote[]): void => {
    setQuotes(next)
    localStorage.setItem(KEY, JSON.stringify(next))
  }
  const decide = (
    quote: Quote,
    nextStatus: Status,
    rejectionReason = ''
  ): void => {
    save(
      quotes.map(item =>
        item.id === quote.id
          ? {
              ...item,
              status: nextStatus,
              rejectionReason,
              decidedAt: new Date().toISOString(),
              decidedBy: 'Equipo HM Maquinaria',
            }
          : item
      )
    )
    setRejecting(null)
    setReason('')
  }
  const copyLink = async (quote: Quote): Promise<void> => {
    const link = `${window.location.origin}/cotizacion-digital/${quote.token}`
    await navigator.clipboard.writeText(link)
    setCopied(quote.id)
    window.setTimeout(() => setCopied(''), 1800)
  }
  const collectedTotal = (quote: Quote): number =>
    (quote.collections ?? []).reduce(
      (sum, collection) => sum + collection.amount,
      0
    )
  const balance = (quote: Quote): number =>
    Math.max(0, quote.total - collectedTotal(quote))
  const collectionAmount = collecting
    ? collectionForm.type === 'pago_total'
      ? balance(collecting)
      : Number(collectionForm.amount) || 0
    : 0
  const invoiceAmount = collecting ? balance(collecting) : 0
  const invoiceNumber = collecting
    ? `FAC-${collecting.number.replace('COT-', '')}-${String(
        (collecting.invoices?.length ?? 0) + 1
      ).padStart(2, '0')}`
    : ''
  const hasPendingBalance = collecting ? balance(collecting) > 0 : false
  const validInvoiceAmount = hasPendingBalance && invoiceAmount > 0
  const downloadInvoice = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: `${invoiceNumber}-${
      collecting?.client.company.replace(/\s+/g, '-') ?? 'cliente'
    }`,
    pageStyle:
      '@page { size: A4; margin: 14mm; } @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }',
  })
  const receiptNumber = summary
    ? `RC-${summary.number.replace('COT-', '')}-FINAL`
    : ''
  const downloadReceipt = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `${receiptNumber}-${
      summary?.client.company.replace(/\s+/g, '-') ?? 'cliente'
    }`,
    pageStyle:
      '@page { size: A4; margin: 14mm; } @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }',
  })
  const openCollection = (quote: Quote): void => {
    if (balance(quote) <= 0) return
    setCollecting(quote)
    setCollectionForm({ type: 'abono', amount: '', comment: '' })
    setInvoiceContact({
      email: quote.client.email || quote.to,
      cc: quote.cc || '',
    })
  }
  const saveOrder = (): void => {
    if (!ordering || !orderForm.number.trim()) return
    const updated = {
      ...ordering,
      purchaseOrder: {
        number: orderForm.number.trim(),
        comment: orderForm.comment.trim(),
        registeredAt: new Date().toISOString(),
      },
      collections: ordering.collections ?? [],
    }
    save(quotes.map(quote => (quote.id === ordering.id ? updated : quote)))
    setOrdering(null)
    openCollection(updated)
  }
  const saveCollection = (sendInvoice: boolean): void => {
    if (!collecting || balance(collecting) <= 0) return
    const pending = balance(collecting)
    const amount =
      collectionForm.type === 'pago_total'
        ? pending
        : Number(collectionForm.amount)
    if (amount <= 0 || amount > pending) return
    if (sendInvoice && !invoiceContact.email.trim()) return
    const registeredAt = new Date().toISOString()
    const collection = {
      id: `collection-${Date.now()}`,
      type: collectionForm.type,
      amount,
      comment: collectionForm.comment.trim(),
      registeredAt,
      invoiceNumber,
      invoiceEmail: invoiceContact.email.trim(),
      invoiceCc: invoiceContact.cc.trim(),
      invoiceSentAt: sendInvoice ? registeredAt : undefined,
    }
    save(
      quotes.map(quote =>
        quote.id === collecting.id
          ? {
              ...quote,
              collections: [...(quote.collections ?? []), collection],
            }
          : quote
      )
    )
    setCollecting(null)
  }
  const sendInvoice = (): void => {
    if (!collecting || !hasPendingBalance || !invoiceContact.email.trim())
      return
    const invoice = {
      id: `invoice-${Date.now()}`,
      number: invoiceNumber,
      amount: invoiceAmount,
      email: invoiceContact.email.trim(),
      cc: invoiceContact.cc.trim(),
      sentAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }
    const updated = {
      ...collecting,
      invoices: [...(collecting.invoices ?? []), invoice],
    }
    save(quotes.map(quote => (quote.id === collecting.id ? updated : quote)))
    setCollecting(updated)
  }
  const openSummary = (quote: Quote): void => {
    setSummary(quote)
    setSummaryTab('quote')
    setReceiptContact({
      email: quote.client.email || quote.to,
      cc: quote.cc || '',
    })
    setReceiptMessage('')
  }
  const sendSettlementReceipt = (): void => {
    if (!summary || balance(summary) > 0 || !receiptContact.email.trim()) return
    const receipt = {
      number: receiptNumber,
      email: receiptContact.email.trim(),
      cc: receiptContact.cc.trim(),
      sentAt: new Date().toISOString(),
      createdAt:
        summary.settlementReceipt?.createdAt ?? new Date().toISOString(),
    }
    const updated = { ...summary, settlementReceipt: receipt }
    save(quotes.map(quote => (quote.id === summary.id ? updated : quote)))
    setSummary(updated)
    setReceiptMessage(`Recibo enviado a ${receipt.email}.`)
  }
  const filtered = useMemo(
    () =>
      quotes.filter(quote => {
        const text = search.trim().toLowerCase()
        return (
          (!text ||
            [
              quote.number,
              quote.client.company,
              quote.client.taxId,
              quote.client.contact,
            ].some(value => value.toLowerCase().includes(text))) &&
          (status === 'todos' || quote.status === status)
        )
      }),
    [quotes, search, status]
  )
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <AdminGuard permission='quotes.manage'>
      <Head>
        <title>Oportunidades de negocio | Administración HM</title>
      </Head>
      <Flex className='opportunity-heading' justify='between' align='end'>
        <Box>
          <Text as='h1' css={{ fontSize: '$7' }}>
            Oportunidades de negocio
          </Text>
          <Text css={{ color: '$shade300' }}>
            Seguimiento comercial y confirmación de cotizaciones asociadas.
          </Text>
        </Box>
      </Flex>
      <Box className='associate-kpis opportunity-kpis'>
        <Box>
          <span>Total oportunidades</span>
          <strong>{quotes.length}</strong>
          <small>
            {currency(quotes.reduce((sum, quote) => sum + quote.total, 0))} en
            propuestas
          </small>
        </Box>
        <Box>
          <span>Pendientes</span>
          <strong>
            {quotes.filter(quote => quote.status === 'pendiente').length}
          </strong>
          <small>Esperando confirmación</small>
        </Box>
        <Box>
          <span>Aprobadas</span>
          <strong>
            {quotes.filter(quote => quote.status === 'aprobada').length}
          </strong>
          <small>
            {currency(
              quotes
                .filter(quote => quote.status === 'aprobada')
                .reduce((sum, quote) => sum + quote.total, 0)
            )}
          </small>
        </Box>
        <Box>
          <span>Rechazadas</span>
          <strong>
            {quotes.filter(quote => quote.status === 'rechazada').length}
          </strong>
          <small>Con motivo registrado</small>
        </Box>
      </Box>
      <Box className='access-table-panel'>
        <Box className='access-filters opportunity-filters'>
          <input
            value={search}
            onChange={event => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder='Buscar por cotización, empresa, NIT o contacto…'
          />
          <select
            value={status}
            onChange={event => {
              setStatus(event.target.value)
              setPage(1)
            }}
          >
            <option value='todos'>Todos los estados</option>
            <option value='pendiente'>Pendiente de aprobación</option>
            <option value='aprobada'>Aprobada</option>
            <option value='rechazada'>Rechazada</option>
          </select>
        </Box>
        <Box className='access-table-scroll'>
          <table className='access-table opportunity-table'>
            <thead>
              <tr>
                <th>Cotización</th>
                <th>Asociado</th>
                <th>Valor / recaudo</th>
                <th>Confirmación</th>
                <th>Orden de compra</th>
                <th>Cotización digital</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(quote => (
                <tr key={quote.id}>
                  <td>
                    <strong>{quote.number}</strong>
                    <small className='access-code'>
                      {quote.items.length} ítems
                    </small>
                  </td>
                  <td>
                    <strong>{quote.client.company}</strong>
                    <small className='access-code'>
                      {quote.client.contact} · {quote.client.email}
                    </small>
                  </td>
                  <td>
                    <strong>{currency(quote.total)}</strong>
                    <small className='access-code'>
                      {collectedTotal(quote)
                        ? `${currency(
                            collectedTotal(quote)
                          )} recaudado · ${currency(balance(quote))} saldo`
                        : 'Sin recaudos'}
                    </small>
                  </td>
                  <td>
                    <span className={`opportunity-status ${quote.status}`}>
                      {statusLabel[quote.status]}
                    </span>
                    {quote.rejectionReason && (
                      <small
                        className='access-code'
                        title={quote.rejectionReason}
                      >
                        {quote.rejectionReason}
                      </small>
                    )}
                  </td>
                  <td>
                    {quote.purchaseOrder ? (
                      <>
                        <strong>{quote.purchaseOrder.number}</strong>
                        <small className='access-code'>
                          {balance(quote) > 0
                            ? `Saldo: ${currency(balance(quote))}`
                            : 'Pago completado'}
                        </small>
                        {balance(quote) > 0 && (
                          <button
                            className='opportunity-inline-collect'
                            onClick={() => openCollection(quote)}
                          >
                            + Ingresar recaudo
                          </button>
                        )}
                      </>
                    ) : (
                      <span className='opportunity-muted'>Pendiente</span>
                    )}
                  </td>
                  <td>
                    <button
                      className='copy-digital-link'
                      onClick={() => void copyLink(quote)}
                    >
                      {copied === quote.id
                        ? '✓ Link copiado'
                        : '⧉ Copiar cotización digital'}
                    </button>
                  </td>
                  <td>
                    <Flex gap='2' css={{ width: 'auto' }}>
                      {quote.status !== 'aprobada' && (
                        <button
                          className='opportunity-action approve'
                          onClick={() => decide(quote, 'aprobada')}
                        >
                          Aprobar
                        </button>
                      )}
                      {quote.status !== 'rechazada' && (
                        <button
                          className='opportunity-action reject'
                          onClick={() => {
                            setRejecting(quote)
                            setReason('')
                          }}
                        >
                          Rechazar
                        </button>
                      )}
                      {quote.status === 'aprobada' && !quote.purchaseOrder && (
                        <button
                          className='opportunity-action order'
                          onClick={() => {
                            setOrdering(quote)
                            setOrderForm({ number: '', comment: '' })
                          }}
                        >
                          Registrar OC
                        </button>
                      )}
                      {quote.status === 'aprobada' &&
                        quote.purchaseOrder &&
                        balance(quote) > 0 && (
                          <button
                            className='opportunity-action collect'
                            onClick={() => openCollection(quote)}
                          >
                            Registrar recaudo
                          </button>
                        )}
                      {quote.purchaseOrder && balance(quote) === 0 && (
                        <>
                          <span className='opportunity-paid'>Pagado</span>
                          <button
                            className='opportunity-action summary'
                            onClick={() => openSummary(quote)}
                          >
                            Ver resumen
                          </button>
                        </>
                      )}
                    </Flex>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
        {!visible.length && (
          <Box className='access-empty'>
            <strong>No hay oportunidades para mostrar</strong>
            <p>
              Las cotizaciones enviadas desde Cotización asociada aparecerán
              aquí.
            </p>
          </Box>
        )}
        <Flex className='access-pagination' justify='between' align='center'>
          <Text>
            Mostrando {visible.length} de {filtered.length} oportunidades
          </Text>
          <Flex gap='2' css={{ width: 'auto' }}>
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>
              Anterior
            </button>
            <span>
              Página {page} de {pages}
            </span>
            <button disabled={page === pages} onClick={() => setPage(page + 1)}>
              Siguiente
            </button>
          </Flex>
        </Flex>
      </Box>
      {rejecting && (
        <Box
          className='admin-modal access-drawer opportunity-reject-drawer'
          onClick={() => setRejecting(null)}
        >
          <Box
            className='admin-modal-card'
            onClick={event => event.stopPropagation()}
          >
            <Flex justify='between' align='center'>
              <Box>
                <span>Decisión comercial</span>
                <Text as='h2'>Rechazar {rejecting.number}</Text>
                <Text css={{ color: '$shade300', fontSize: '$2' }}>
                  {rejecting.client.company} · {currency(rejecting.total)}
                </Text>
              </Box>
              <button
                className='drawer-close'
                onClick={() => setRejecting(null)}
              >
                ×
              </button>
            </Flex>
            <Box className='opportunity-reject-body'>
              <label className='admin-field'>
                Motivo del rechazo *
                <textarea
                  autoFocus
                  rows={6}
                  value={reason}
                  onChange={event => setReason(event.target.value)}
                  placeholder='Describa por qué la oportunidad fue rechazada…'
                />
              </label>
              <Box className='quote-send-note'>
                <strong>Registro de auditoría</strong>
                <p>
                  La decisión, el motivo y la fecha quedarán guardados en la
                  oportunidad.
                </p>
              </Box>
            </Box>
            <Flex className='quote-send-footer' justify='end' gap='3'>
              <button
                className='admin-secondary-button'
                onClick={() => setRejecting(null)}
              >
                Cancelar
              </button>
              <button
                className='admin-danger-button'
                disabled={!reason.trim()}
                onClick={() => decide(rejecting, 'rechazada', reason.trim())}
              >
                Confirmar rechazo
              </button>
            </Flex>
          </Box>
        </Box>
      )}
      {ordering && (
        <Box
          className='admin-modal access-drawer opportunity-flow-drawer'
          onClick={() => setOrdering(null)}
        >
          <Box
            className='admin-modal-card'
            onClick={event => event.stopPropagation()}
          >
            <Flex justify='between' align='center'>
              <Box>
                <span>Etapa 2 · Formalización</span>
                <Text as='h2'>Registrar orden de compra</Text>
                <Text css={{ color: '$shade300', fontSize: '$2' }}>
                  {ordering.number} · {ordering.client.company}
                </Text>
              </Box>
              <button
                className='drawer-close'
                onClick={() => setOrdering(null)}
              >
                ×
              </button>
            </Flex>
            <Box className='opportunity-flow-summary'>
              <span>Cotización aprobada</span>
              <strong>{currency(ordering.total)}</strong>
              <small>Registre la orden para habilitar el recaudo.</small>
            </Box>
            <Box className='opportunity-flow-form'>
              <label className='admin-field'>
                Número de orden de compra *
                <input
                  autoFocus
                  value={orderForm.number}
                  onChange={event =>
                    setOrderForm({ ...orderForm, number: event.target.value })
                  }
                  placeholder='Ej. OC-2026-00125'
                />
              </label>
              <label className='admin-field'>
                Comentario
                <textarea
                  rows={5}
                  value={orderForm.comment}
                  onChange={event =>
                    setOrderForm({ ...orderForm, comment: event.target.value })
                  }
                  placeholder='Observaciones, condiciones o referencia interna…'
                />
              </label>
            </Box>
            <Flex className='quote-send-footer' justify='end' gap='3'>
              <button
                className='admin-secondary-button'
                onClick={() => setOrdering(null)}
              >
                Cancelar
              </button>
              <button
                className='admin-primary-button'
                disabled={!orderForm.number.trim()}
                onClick={saveOrder}
              >
                Guardar orden de compra
              </button>
            </Flex>
          </Box>
        </Box>
      )}
      {collecting && (
        <Box
          className='admin-modal access-drawer opportunity-flow-drawer'
          onClick={() => setCollecting(null)}
        >
          <Box
            className='admin-modal-card'
            onClick={event => event.stopPropagation()}
          >
            <Flex justify='between' align='center'>
              <Box>
                <span>Etapa 3 · Recaudo</span>
                <Text as='h2'>Registrar recaudo</Text>
                <Text css={{ color: '$shade300', fontSize: '$2' }}>
                  OC {collecting.purchaseOrder?.number} ·{' '}
                  {collecting.client.company}
                </Text>
              </Box>
              <button
                className='drawer-close'
                onClick={() => setCollecting(null)}
              >
                ×
              </button>
            </Flex>
            <Box className='collection-balance'>
              <Box>
                <span>Valor cotización</span>
                <strong>{currency(collecting.total)}</strong>
              </Box>
              <Box>
                <span>Recaudado</span>
                <strong>{currency(collectedTotal(collecting))}</strong>
              </Box>
              <Box>
                <span>Saldo pendiente</span>
                <strong>{currency(balance(collecting))}</strong>
              </Box>
            </Box>
            <Box className='collection-type-selector'>
              <button
                className={collectionForm.type === 'abono' ? 'active' : ''}
                onClick={() =>
                  setCollectionForm({
                    ...collectionForm,
                    type: 'abono',
                    amount: '',
                  })
                }
              >
                <strong>Abono parcial</strong>
                <small>Registre una parte de la deuda</small>
              </button>
              <button
                className={collectionForm.type === 'pago_total' ? 'active' : ''}
                onClick={() =>
                  setCollectionForm({
                    ...collectionForm,
                    type: 'pago_total',
                    amount: String(balance(collecting)),
                  })
                }
              >
                <strong>Pago completo</strong>
                <small>Liquida todo el saldo pendiente</small>
              </button>
            </Box>
            <Box className='opportunity-flow-form'>
              {collectionForm.type === 'abono' && (
                <label className='admin-field'>
                  Valor del abono *
                  <input
                    type='number'
                    min='1'
                    max={balance(collecting)}
                    value={collectionForm.amount}
                    onChange={event =>
                      setCollectionForm({
                        ...collectionForm,
                        amount: event.target.value,
                      })
                    }
                    placeholder='Valor recibido'
                  />
                  <small>
                    Máximo disponible: {currency(balance(collecting))}
                  </small>
                </label>
              )}
              <label className='admin-field'>
                Comentario del recaudo
                <textarea
                  rows={4}
                  value={collectionForm.comment}
                  onChange={event =>
                    setCollectionForm({
                      ...collectionForm,
                      comment: event.target.value,
                    })
                  }
                  placeholder='Medio de pago, referencia o información adicional…'
                />
              </label>
            </Box>
            {hasPendingBalance ? (
              <Box className='invoice-delivery-section'>
                <Flex justify='between' align='center'>
                  <Box>
                    <span>Factura de cobro</span>
                    <strong>{invoiceNumber}</strong>
                    <small>Valor pendiente: {currency(invoiceAmount)}</small>
                  </Box>
                  <button
                    className='admin-secondary-button'
                    disabled={!validInvoiceAmount}
                    onClick={() => downloadInvoice()}
                  >
                    ↓ Descargar factura PDF
                  </button>
                </Flex>
                <Box className='invoice-email-grid'>
                  <label className='admin-field'>
                    Enviar a
                    <input
                      type='email'
                      value={invoiceContact.email}
                      onChange={event =>
                        setInvoiceContact({
                          ...invoiceContact,
                          email: event.target.value,
                        })
                      }
                    />
                  </label>
                  <label className='admin-field'>
                    CC
                    <input
                      type='email'
                      value={invoiceContact.cc}
                      onChange={event =>
                        setInvoiceContact({
                          ...invoiceContact,
                          cc: event.target.value,
                        })
                      }
                      placeholder='correo.adicional@empresa.com'
                    />
                  </label>
                </Box>
                <Flex justify='end'>
                  <button
                    className='admin-primary-button invoice-send-button'
                    disabled={!invoiceContact.email.trim()}
                    onClick={sendInvoice}
                  >
                    Enviar factura al cliente
                  </button>
                </Flex>
              </Box>
            ) : (
              <Box className='invoice-settled-lock'>
                <span>✓</span>
                <Box>
                  <strong>Obligación pagada en su totalidad</strong>
                  <small>
                    No se pueden generar ni enviar nuevas facturas porque no
                    existe saldo pendiente.
                  </small>
                </Box>
              </Box>
            )}
            <Box className='invoice-print-document' ref={invoiceRef}>
              <Box className='invoice-template-accent' />
              <Flex
                className='invoice-template-header'
                justify='between'
                align='start'
              >
                <Box>
                  <img
                    src={asset('/images/logo-horizontal.png')}
                    alt='HM Maquinaria'
                  />
                  <p>
                    Soluciones integrales en maquinaria,
                    <br />
                    formación y certificación.
                  </p>
                </Box>
                <Box className='invoice-template-title'>
                  <span>FACTURA DE VENTA</span>
                  <strong>{invoiceNumber}</strong>
                  <small>
                    Fecha de emisión: {new Date().toLocaleDateString('es-CO')}
                  </small>
                  <i>PENDIENTE DE PAGO</i>
                </Box>
              </Flex>
              <Box className='invoice-template-company'>
                <Box>
                  <span>EMISOR</span>
                  <strong>HM Maquinaria S.A.S.</strong>
                  <p>
                    NIT 901.357.485-1
                    <br />
                    Envigado, Antioquia · Colombia
                    <br />
                    Tel. 320 398 01 61
                  </p>
                </Box>
                <Box>
                  <span>FACTURAR A</span>
                  <strong>{collecting.client.company}</strong>
                  <p>
                    NIT / Documento: {collecting.client.taxId}
                    <br />
                    Contacto: {collecting.client.contact}
                    <br />
                    {invoiceContact.email} · {collecting.client.phone}
                  </p>
                </Box>
              </Box>
              <Box className='invoice-template-references'>
                <Box>
                  <span>Cotización relacionada</span>
                  <strong>{collecting.number}</strong>
                </Box>
                <Box>
                  <span>Orden de compra</span>
                  <strong>{collecting.purchaseOrder?.number}</strong>
                </Box>
                <Box>
                  <span>Estado de cartera</span>
                  <strong>Saldo pendiente</strong>
                </Box>
              </Box>
              <Box className='invoice-template-table'>
                <Box className='invoice-template-table-head'>
                  <span>Descripción</span>
                  <span>Cant.</span>
                  <span>Valor unitario</span>
                  <span>Total</span>
                </Box>
                <Box>
                  <span>
                    Servicios correspondientes a la cotización{' '}
                    {collecting.number}
                    <small>
                      Cobro del saldo pendiente de la obligación comercial.
                    </small>
                  </span>
                  <span>1</span>
                  <span>{currency(invoiceAmount)}</span>
                  <strong>{currency(invoiceAmount)}</strong>
                </Box>
              </Box>
              <Box className='invoice-template-summary'>
                <Box className='invoice-template-observations'>
                  <span>OBSERVACIONES</span>
                  <p>
                    Factura generada para solicitar el pago de la obligación
                    asociada a la orden de compra indicada.
                  </p>
                  <small>
                    Valor original: {currency(collecting.total)}
                    <br />
                    Pagos registrados: {currency(collectedTotal(collecting))}
                  </small>
                </Box>
                <Box className='invoice-template-totals'>
                  <p>
                    <span>Subtotal</span>
                    <strong>{currency(invoiceAmount)}</strong>
                  </p>
                  <p>
                    <span>Impuestos incluidos</span>
                    <strong>{currency(0)}</strong>
                  </p>
                  <p>
                    <span>TOTAL A PAGAR</span>
                    <strong>{currency(invoiceAmount)}</strong>
                  </p>
                </Box>
              </Box>
              <Box className='invoice-template-paid invoice-template-pending'>
                <span>!</span>
                <Box>
                  <strong>Pago pendiente</strong>
                  <small>
                    Por favor realice el pago por el valor indicado en esta
                    factura.
                  </small>
                </Box>
              </Box>
              <Box className='invoice-template-legal'>
                <p>Gracias por confiar en HM Maquinaria.</p>
                <small>
                  Documento generado electrónicamente desde la plataforma
                  administrativa de HM Maquinaria. Conserve esta factura como
                  soporte de su transacción. Para inquietudes comuníquese al 320
                  398 01 61.
                </small>
              </Box>
            </Box>
            <Flex
              className='quote-send-footer collection-footer'
              justify='end'
              gap='3'
            >
              <button
                className='admin-secondary-button'
                onClick={() => setCollecting(null)}
              >
                Cancelar
              </button>
              <button
                className='admin-primary-button'
                disabled={
                  collectionAmount <= 0 ||
                  collectionAmount > balance(collecting)
                }
                onClick={() => saveCollection(false)}
              >
                {collectionForm.type === 'pago_total'
                  ? 'Registrar pago completo'
                  : 'Registrar abono'}
              </button>
            </Flex>
          </Box>
        </Box>
      )}
      {summary && (
        <Box
          className='admin-modal access-drawer opportunity-summary-drawer'
          onClick={() => setSummary(null)}
        >
          <Box
            className='admin-modal-card'
            onClick={event => event.stopPropagation()}
          >
            <Box className='opportunity-summary-head'>
              <Flex justify='between' align='center'>
                <Box>
                  <span>Expediente comercial</span>
                  <Text as='h2'>{summary.number}</Text>
                  <Text css={{ color: '$shade300', fontSize: '$2' }}>
                    {summary.client.company} · {currency(summary.total)}
                  </Text>
                </Box>
                <button
                  className='drawer-close'
                  onClick={() => setSummary(null)}
                >
                  ×
                </button>
              </Flex>
              <Box className='opportunity-summary-tabs'>
                {(
                  [
                    ['quote', 'Cotización'],
                    ['approval', 'Aprobación'],
                    ['order', 'Orden de compra'],
                    ['collections', 'Recaudos'],
                  ] as Array<[typeof summaryTab, string]>
                ).map(([value, label]) => (
                  <button
                    key={value}
                    className={summaryTab === value ? 'active' : ''}
                    onClick={() => setSummaryTab(value)}
                  >
                    {label}
                  </button>
                ))}
              </Box>
            </Box>
            <Box className='opportunity-summary-body'>
              {summaryTab === 'quote' && (
                <Box>
                  <Box className='summary-status-banner'>
                    <span className='opportunity-paid'>
                      Pagado en su totalidad
                    </span>
                    <strong>{currency(summary.total)}</strong>
                    <small>
                      {summary.client.company} · {summary.client.taxId}
                    </small>
                  </Box>
                  <Box className='summary-info-grid'>
                    <Box>
                      <span>Contacto</span>
                      <strong>{summary.client.contact}</strong>
                      <small>
                        {summary.client.email}
                        <br />
                        {summary.client.phone}
                      </small>
                    </Box>
                    <Box>
                      <span>Fecha de envío</span>
                      <strong>
                        {new Date(summary.sentAt).toLocaleDateString('es-CO')}
                      </strong>
                      <small>
                        {summary.items.length} productos o servicios
                      </small>
                    </Box>
                  </Box>
                  <Box className='summary-item-list'>
                    {summary.items.map(item => (
                      <Box key={item.id}>
                        <span>
                          {item.description}
                          <small>
                            {item.quantity} × {currency(item.price)}
                          </small>
                        </span>
                        <strong>{currency(item.quantity * item.price)}</strong>
                      </Box>
                    ))}
                  </Box>
                  <Box className='summary-grand-total'>
                    <span>Total cotización</span>
                    <strong>{currency(summary.total)}</strong>
                  </Box>
                </Box>
              )}
              {summaryTab === 'approval' && (
                <Box className='summary-timeline'>
                  <Box className='complete'>
                    <i>✓</i>
                    <Box>
                      <span>Cotización enviada</span>
                      <strong>
                        {new Date(summary.sentAt).toLocaleString('es-CO')}
                      </strong>
                      <small>Destinatario: {summary.to}</small>
                    </Box>
                  </Box>
                  <Box className='complete'>
                    <i>✓</i>
                    <Box>
                      <span>Cotización aprobada</span>
                      <strong>
                        {summary.decidedAt
                          ? new Date(summary.decidedAt).toLocaleString('es-CO')
                          : 'Fecha no disponible'}
                      </strong>
                      <small>
                        Confirmada por:{' '}
                        {summary.decidedBy || 'Equipo HM Maquinaria'}
                      </small>
                    </Box>
                  </Box>
                  <Box className='complete'>
                    <i>✓</i>
                    <Box>
                      <span>Pago completado</span>
                      <strong>
                        {summary.collections?.length ?? 0} movimiento(s)
                      </strong>
                      <small>
                        Saldo pendiente: {currency(balance(summary))}
                      </small>
                    </Box>
                  </Box>
                </Box>
              )}
              {summaryTab === 'order' && (
                <Box>
                  <Box className='summary-document-card'>
                    <span>Orden de compra</span>
                    <strong>{summary.purchaseOrder?.number}</strong>
                    <small>
                      Registrada el{' '}
                      {summary.purchaseOrder
                        ? new Date(
                            summary.purchaseOrder.registeredAt
                          ).toLocaleString('es-CO')
                        : ''}
                    </small>
                  </Box>
                  <Box className='summary-comment'>
                    <span>Comentario</span>
                    <p>
                      {summary.purchaseOrder?.comment ||
                        'Sin comentarios adicionales.'}
                    </p>
                  </Box>
                </Box>
              )}
              {summaryTab === 'collections' && (
                <Box>
                  <Box className='collection-balance'>
                    <Box>
                      <span>Valor cotización</span>
                      <strong>{currency(summary.total)}</strong>
                    </Box>
                    <Box>
                      <span>Total recaudado</span>
                      <strong>{currency(collectedTotal(summary))}</strong>
                    </Box>
                    <Box>
                      <span>Saldo</span>
                      <strong>{currency(balance(summary))}</strong>
                    </Box>
                  </Box>
                  <Box className='summary-collection-list'>
                    {(summary.collections ?? []).map((collection, index) => (
                      <Box key={collection.id}>
                        <i>{index + 1}</i>
                        <Box>
                          <strong>
                            {collection.type === 'pago_total'
                              ? 'Pago completo'
                              : 'Abono parcial'}{' '}
                            · {collection.invoiceNumber}
                          </strong>
                          <small>
                            {new Date(collection.registeredAt).toLocaleString(
                              'es-CO'
                            )}{' '}
                            · {collection.comment || 'Sin comentario'}
                            {collection.invoiceSentAt
                              ? ` · Factura enviada a ${collection.invoiceEmail}`
                              : ' · Factura no enviada'}
                          </small>
                        </Box>
                        <strong>{currency(collection.amount)}</strong>
                      </Box>
                    ))}
                  </Box>
                  {balance(summary) === 0 && (
                    <Box className='settlement-receipt-panel'>
                      <Flex justify='between' align='center'>
                        <Box>
                          <span>Paz y salvo</span>
                          <strong>{receiptNumber}</strong>
                          <small>
                            La obligación se encuentra pagada en su totalidad.
                          </small>
                        </Box>
                        <button
                          className='admin-secondary-button'
                          onClick={() => downloadReceipt()}
                        >
                          ↓ Descargar recibo PDF
                        </button>
                      </Flex>
                      <Box className='invoice-email-grid'>
                        <label className='admin-field'>
                          Enviar a
                          <input
                            type='email'
                            value={receiptContact.email}
                            onChange={event =>
                              setReceiptContact({
                                ...receiptContact,
                                email: event.target.value,
                              })
                            }
                          />
                        </label>
                        <label className='admin-field'>
                          CC
                          <input
                            type='email'
                            value={receiptContact.cc}
                            onChange={event =>
                              setReceiptContact({
                                ...receiptContact,
                                cc: event.target.value,
                              })
                            }
                            placeholder='correo.adicional@empresa.com'
                          />
                        </label>
                      </Box>
                      <Flex justify='end'>
                        <button
                          className='admin-primary-button invoice-send-button'
                          disabled={!receiptContact.email.trim()}
                          onClick={sendSettlementReceipt}
                        >
                          Enviar recibo al cliente
                        </button>
                      </Flex>
                      {receiptMessage && (
                        <Box className='quote-send-success'>
                          {receiptMessage}
                        </Box>
                      )}
                      {summary.settlementReceipt?.sentAt && (
                        <small className='settlement-last-send'>
                          Último envío:{' '}
                          {new Date(
                            summary.settlementReceipt.sentAt
                          ).toLocaleString('es-CO')}{' '}
                          · {summary.settlementReceipt.email}
                        </small>
                      )}
                    </Box>
                  )}
                </Box>
              )}
            </Box>
            <Box className='settlement-print-document' ref={receiptRef}>
              <Box className='settlement-accent' />
              <Flex
                className='settlement-header'
                justify='between'
                align='start'
              >
                <Box>
                  <img
                    src={asset('/images/logo-horizontal.png')}
                    alt='HM Maquinaria'
                  />
                  <p>
                    Soluciones integrales en maquinaria,
                    <br />
                    formación y certificación.
                  </p>
                </Box>
                <Box>
                  <span>RECIBO DE PAGO</span>
                  <strong>{receiptNumber}</strong>
                  <small>{new Date().toLocaleDateString('es-CO')}</small>
                  <i>PAZ Y SALVO</i>
                </Box>
              </Flex>
              <Box className='settlement-hero'>
                <span>✓</span>
                <Box>
                  <strong>Obligación pagada en su totalidad</strong>
                  <p>
                    Certificamos que el cliente no presenta saldo pendiente
                    relacionado con esta operación.
                  </p>
                </Box>
              </Box>
              <Box className='invoice-template-company'>
                <Box>
                  <span>EMISOR</span>
                  <strong>HM Maquinaria S.A.S.</strong>
                  <p>
                    NIT 901.357.485-1
                    <br />
                    Envigado, Antioquia · Colombia
                    <br />
                    Tel. 320 398 01 61
                  </p>
                </Box>
                <Box>
                  <span>CLIENTE</span>
                  <strong>{summary.client.company}</strong>
                  <p>
                    NIT / Documento: {summary.client.taxId}
                    <br />
                    Contacto: {summary.client.contact}
                    <br />
                    {receiptContact.email}
                  </p>
                </Box>
              </Box>
              <Box className='invoice-template-references'>
                <Box>
                  <span>Cotización</span>
                  <strong>{summary.number}</strong>
                </Box>
                <Box>
                  <span>Orden de compra</span>
                  <strong>{summary.purchaseOrder?.number}</strong>
                </Box>
                <Box>
                  <span>Estado</span>
                  <strong>Pagado</strong>
                </Box>
              </Box>
              <Box className='settlement-payment-table'>
                <Box>
                  <span>Movimiento</span>
                  <span>Fecha</span>
                  <span>Valor</span>
                </Box>
                {(summary.collections ?? []).map((collection, index) => (
                  <Box key={collection.id}>
                    <span>
                      {index + 1}.{' '}
                      {collection.type === 'pago_total'
                        ? 'Pago completo'
                        : 'Abono parcial'}
                      <small>
                        {collection.comment || 'Pago aplicado a la obligación'}
                      </small>
                    </span>
                    <span>
                      {new Date(collection.registeredAt).toLocaleDateString(
                        'es-CO'
                      )}
                    </span>
                    <strong>{currency(collection.amount)}</strong>
                  </Box>
                ))}
              </Box>
              <Box className='settlement-total'>
                <Box>
                  <span>Valor de la obligación</span>
                  <strong>{currency(summary.total)}</strong>
                </Box>
                <Box>
                  <span>Total pagado</span>
                  <strong>{currency(collectedTotal(summary))}</strong>
                </Box>
                <Box>
                  <span>SALDO PENDIENTE</span>
                  <strong>{currency(0)}</strong>
                </Box>
              </Box>
              <Box className='settlement-certification'>
                <strong>CONSTANCIA</strong>
                <p>
                  HM Maquinaria S.A.S. deja constancia de que los pagos
                  relacionados anteriormente cubren la totalidad de la
                  obligación derivada de la cotización {summary.number} y la
                  orden de compra {summary.purchaseOrder?.number}. A la fecha de
                  emisión de este documento, el cliente se encuentra a paz y
                  salvo por este concepto.
                </p>
              </Box>
              <Box className='invoice-template-legal'>
                <p>Gracias por confiar en HM Maquinaria.</p>
                <small>
                  Documento generado electrónicamente desde la plataforma
                  administrativa. Para verificar su contenido comuníquese al 320
                  398 01 61.
                </small>
              </Box>
            </Box>
            <Flex className='quote-send-footer' justify='end'>
              <button
                className='admin-secondary-button'
                onClick={() => setSummary(null)}
              >
                Cerrar resumen
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
