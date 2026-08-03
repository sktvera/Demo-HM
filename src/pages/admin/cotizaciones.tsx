import { useMemo, useState } from 'react'
import Head from 'next/head'
import NextLink from 'next/link'
import { Box, Flex, Text } from 'components'
import { asset } from 'paths'
import { AdminGuard } from 'components/admin-guard'

interface QuoteItem {
  id: string
  description: string
  quantity: number
  price: number
  taxable: boolean
}
const currency = (value: number): string =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)

const Page = (): JSX.Element => {
  const [number, setNumber] = useState('001')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [client, setClient] = useState({
    company: '',
    contact: '',
    taxId: '',
    email: '',
    phone: '',
  })
  const [items, setItems] = useState<QuoteItem[]>([
    {
      id: 'initial',
      description: 'Servicio de certificación de operadores',
      quantity: 1,
      price: 0,
      taxable: true,
    },
  ])
  const [notes, setNotes] = useState(
    'Validez de la oferta: 15 días calendario.'
  )
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
  const updateItem = (id: string, patch: Partial<QuoteItem>): void =>
    setItems(current =>
      current.map(item => (item.id === id ? { ...item, ...patch } : item))
    )

  return (
    <AdminGuard permission='quotes.manage'>
      <Head>
        <title>Nueva cotización | HM Maquinaria</title>
      </Head>
      <Box className='quote-app'>
        <Flex className='quote-topbar' justify='between' align='center'>
          <Flex align='center' gap='4' css={{ width: 'auto' }}>
            <NextLink href='/admin'>
              <a>← Panel</a>
            </NextLink>
            <Box>
              <Text as='h1'>Crear cotización</Text>
              <Text>
                Edite la información y revise el resultado en tiempo real.
              </Text>
            </Box>
          </Flex>
          <Flex gap='2' css={{ width: 'auto' }}>
            <button
              className='quote-button primary'
              onClick={() => window.print()}
            >
              Imprimir / PDF
            </button>
          </Flex>
        </Flex>

        <Box className='quote-workspace'>
          <Box className='quote-editor'>
            <section>
              <Text as='h2'>Información general</Text>
              <Box className='quote-form-grid'>
                <label>
                  Número
                  <input
                    value={number}
                    onChange={event => setNumber(event.target.value)}
                  />
                </label>
                <label>
                  Fecha
                  <input
                    type='date'
                    value={date}
                    onChange={event => setDate(event.target.value)}
                  />
                </label>
              </Box>
            </section>
            <section>
              <Text as='h2'>Datos del cliente</Text>
              <Box className='quote-form-grid'>
                <label className='wide'>
                  Empresa o razón social
                  <input
                    value={client.company}
                    placeholder='Nombre del cliente'
                    onChange={event =>
                      setClient({ ...client, company: event.target.value })
                    }
                  />
                </label>
                <label>
                  Persona de contacto
                  <input
                    value={client.contact}
                    onChange={event =>
                      setClient({ ...client, contact: event.target.value })
                    }
                  />
                </label>
                <label>
                  NIT / Documento
                  <input
                    value={client.taxId}
                    onChange={event =>
                      setClient({ ...client, taxId: event.target.value })
                    }
                  />
                </label>
                <label>
                  Correo
                  <input
                    type='email'
                    value={client.email}
                    onChange={event =>
                      setClient({ ...client, email: event.target.value })
                    }
                  />
                </label>
                <label>
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
            <section>
              <Flex justify='between' align='center'>
                <Text as='h2'>Servicios o productos</Text>
                <button
                  className='quote-add'
                  onClick={() =>
                    setItems([
                      ...items,
                      {
                        id: `${Date.now()}`,
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
              {items.map((item, index) => (
                <Box className='quote-item' key={item.id}>
                  <Flex justify='between'>
                    <strong>Ítem {index + 1}</strong>
                    {items.length > 1 && (
                      <button
                        className='quote-remove'
                        onClick={() =>
                          setItems(items.filter(value => value.id !== item.id))
                        }
                      >
                        Eliminar
                      </button>
                    )}
                  </Flex>
                  <label>
                    Descripción
                    <textarea
                      rows={2}
                      value={item.description}
                      onChange={event =>
                        updateItem(item.id, { description: event.target.value })
                      }
                    />
                  </label>
                  <Box className='quote-form-grid'>
                    <label>
                      Cantidad
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
                    </label>
                    <label>
                      Precio unitario
                      <input
                        type='number'
                        min='0'
                        value={item.price || ''}
                        onChange={event =>
                          updateItem(item.id, {
                            price: Number(event.target.value),
                          })
                        }
                      />
                    </label>
                  </Box>
                  <label className='quote-check'>
                    <input
                      type='checkbox'
                      checked={item.taxable}
                      onChange={event =>
                        updateItem(item.id, { taxable: event.target.checked })
                      }
                    />{' '}
                    Aplicar IVA del 19%
                  </label>
                </Box>
              ))}
            </section>
            <section>
              <Text as='h2'>Notas y condiciones</Text>
              <textarea
                rows={4}
                value={notes}
                onChange={event => setNotes(event.target.value)}
              />
            </section>
          </Box>

          <Box className='quote-preview-wrap'>
            <Text className='preview-label'>Vista previa del documento</Text>
            <Box className='quote-document'>
              <Flex justify='between' align='start'>
                <img
                  src={asset('/images/logo-horizontal.png')}
                  alt='HM Maquinaria'
                />
                <Box css={{ textAlign: 'right' }}>
                  <Text as='h2'>COTIZACIÓN</Text>
                  <strong>#{number}</strong>
                  <Text>{date}</Text>
                </Box>
              </Flex>
              <Box className='quote-client'>
                <small>COTIZACIÓN PARA</small>
                <Text as='h3'>{client.company || 'Nombre del cliente'}</Text>
                <p>
                  {client.contact}
                  {client.taxId && ` · NIT ${client.taxId}`}
                  <br />
                  {client.email} {client.phone}
                </p>
              </Box>
              <table>
                <thead>
                  <tr>
                    <th>Descripción</th>
                    <th>Cant.</th>
                    <th>Precio</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id}>
                      <td>{item.description || 'Descripción del servicio'}</td>
                      <td>{item.quantity}</td>
                      <td>{currency(item.price)}</td>
                      <td>{currency(item.quantity * item.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Box className='quote-totals'>
                <p>
                  <span>Subtotal</span>
                  <strong>{currency(totals.subtotal)}</strong>
                </p>
                <p>
                  <span>IVA</span>
                  <strong>{currency(totals.tax)}</strong>
                </p>
                <p className='grand'>
                  <span>Total</span>
                  <strong>{currency(totals.total)}</strong>
                </p>
              </Box>
              <Box className='quote-notes'>
                <strong>Notas y condiciones</strong>
                <p>{notes}</p>
              </Box>
              <footer>
                HM Maquinaria S.A.S. · NIT 901357485-1 · Envigado, Antioquia ·
                320 398 01 61
              </footer>
            </Box>
          </Box>
        </Box>
      </Box>
    </AdminGuard>
  )
}

export default Page
