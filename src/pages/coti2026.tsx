import type { ReactElement, PropsWithChildren } from 'react'
import { useEffect, useRef, useState } from 'react'
import Head from 'next/head'
import { styled } from 'stitches.config'
import { Box, Image, Flex, Button, Print } from 'components'
import { asset } from 'paths'
import chunk from 'lodash.chunk'
import { withZero } from 'utils'

import type { NextPageWithLayout } from './_app'

const priceMask = (price: number | string): string => {
  const numPrice =
    typeof price === 'string' ? price.replaceAll('.', '') : String(price)

  return chunk(numPrice.split('').reverse(), 3)
    .map((x: string[]) => x.reverse().join(''))
    .reverse()
    .join('.')
}

// https://css-tricks.com/auto-growing-inputs-textareas/#aa-other-ideas
const EditableContainer = styled('span', {
  position: 'relative',
  display: 'inline-flex',
  span: {
    whiteSpace: 'pre-wrap',
  },
  'input, textarea': {
    overflow: 'hidden',
    all: 'unset',
    lineHeight: 'initial',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    appearance: 'none',
    '&:focus': {
      color: 'initial',
      border: '1px solid $shade300',
      margin: '-1px',
    },
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
  '&, span, input, textarea': {
    lineHeight: 1.2,
    minWidth: '1em',
    minHeight: '1em',
  },
  input: {
    '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
      '-webkit-appearance': 'none',
      margin: 0,
    },
    '&[type=number]': {
      '-moz-appearance': 'textfield',
    },
  },
  variants: {
    fluid: {
      true: {
        '&, span, input, textarea': {
          width: '100%',
        },
      },
    },
  },
})

const Editable = ({
  children,
  multiline = false,
  fluid = false,
  onChange,
}: PropsWithChildren<{
  multiline?: boolean
  fluid?: boolean
  onChange?: (value: string) => void
}>): JSX.Element => {
  const textareaRef = useRef(null)
  const [text, setText] = useState<string>(`${children}`)

  const TextField = multiline ? 'textarea' : 'input'

  return (
    <EditableContainer fluid={fluid}>
      <TextField
        ref={textareaRef}
        onChange={e => {
          setText(e.currentTarget.value)
          onChange?.(e.currentTarget.value)
        }}
        onFocus={e => {
          if (e.nativeEvent.type === 'focusin') {
            e.currentTarget.select()
          }
        }}
        value={text}
        style={{ color: 'transparent' }}
      />
      <span>
        {text}
        {/\n$/.test(text) && <br />}
      </span>
    </EditableContainer>
  )
}

export const StyledPrint = styled(Print, {
  borderBottom: '0.5cm solid $orange200',
  borderTop: '0.5cm solid $black',
  fontSize: '$1',
})

const Header = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  textAlign: 'right',
  paddingBottom: '.25cm',
  borderBottom: '1px solid $black',
})

const Title = styled('h1', {
  fontSize: '$5',
})

const InvoiceDate = styled('div', {
  fontSize: '$4',
  textTransform: 'capitalize',
})

const InvoiceNumber = styled('strong', {
  fontSize: '$4',
})

const Body = styled('div', {
  flex: 1,
})

const CustomerData = styled('div', {
  fontSize: '$2',
  h3: {
    lineHeight: 1,
    fontSize: '$5',
    fontWeight: 'bold',
    letterSpacing: '-1px',
  },
})

const CustomerPerson = styled('div', {
  fontSize: '$3',
  marginTop: '.5cm',
})

const TotalPriceContainer = styled('div', {
  textAlign: 'right',
})

const TotalPrice = styled('strong', {
  fontSize: '$7',
  fontWeight: 'normal',
  color: '$orange200',
  display: 'block',
  marginBottom: '$4',
  textAlign: 'right',
  minWidth: 230,
})

const PriceTable = styled('table', {
  width: '100%',
  borderTop: '3px solid $black',
  borderBottom: '1px solid $black',
  'th, td': {
    textAlign: 'right',
    '&:first-child': {
      textAlign: 'left',
    },
  },
  'tr > td': {
    padding: '0.15cm 0',
  },
  'tbody tr': {
    borderTop: '1px solid $shade200',
  },
})

const AddItemButton = styled(Button, {
  border: 'none',
  borderRadius: '$none',
  '@print': {
    display: 'none !important',
  },
})

const InvoiceItem = ({
  onRemoveItem,
  updateInvoicePrice,
}: {
  onRemoveItem: () => void
  updateInvoicePrice: (total: number, iva: boolean) => void
}) => {
  const [quantity, setQuantity] = useState<number>(1)
  const [iva, setIva] = useState<boolean>(true)
  const [price, setPrice] = useState<number>(0)

  // Calculado, no en estado
  const derivedTotal = Math.round(
    (Number.isFinite(price) ? price : 0) *
      (Number.isFinite(quantity) ? quantity : 1)
  )

  // Evita notificar al padre si no hay cambios
  const lastSentRef = useRef<{ total: number; iva: boolean }>({
    total: NaN,
    iva: !iva,
  })

  useEffect(() => {
    const { total: lastTotal, iva: lastIva } = lastSentRef.current
    if (lastTotal !== derivedTotal || lastIva !== iva) {
      updateInvoicePrice(derivedTotal, iva)
      lastSentRef.current = { total: derivedTotal, iva }
    }
  }, [derivedTotal, iva, updateInvoicePrice])

  return (
    <tr style={{ position: 'relative' }}>
      <td>
        <Editable multiline>Descripción del producto</Editable>
      </td>
      <td>
        $
        <Editable
          onChange={value => {
            const raw = (value ?? '').toString()
            const n = Number(raw.replaceAll('.', '').replace(',', '.'))
            setPrice(Number.isFinite(n) && n >= 0 ? n : 0)
          }}
        >
          {price}
        </Editable>
      </td>

      <td>
        <Editable
          onChange={value => {
            const n = parseInt((value ?? '').toString().replaceAll('.', ''), 10)
            setQuantity(Number.isInteger(n) && n > 0 ? n : 1)
          }}
        >
          {quantity}
        </Editable>
      </td>

      <td>${priceMask(derivedTotal)}</td>

      <Box as='td' css={{ '@print': { display: 'none !important' } }}>
        <input
          type='checkbox'
          aria-label='Incluir IVA'
          checked={iva}
          onChange={e => setIva(e.target.checked)}
        />
      </Box>

      <Box as='td' css={{ '@print': { display: 'none !important' } }}>
        <Button
          onClick={onRemoveItem}
          css={{ position: 'absolute', left: '100%', top: 9, p: '$0', ml: 5 }}
        >
          X
        </Button>
      </Box>
    </tr>
  )
}

const Notes = styled('div', {
  marginTop: '1cm',
  '@print': {
    [`&:has(> ${EditableContainer} textarea:empty)`]: {
      display: 'none',
    },
  },
})

const Footer = styled('div', {
  fontSize: '$1',
  alignSelf: 'flex-end',
  lineHeight: 1.5,
  display: 'flex',
  gap: '10',
  borderTop: '1px solid',
  paddingTop: '0.25cm',
  width: '100%',
  '& > div': {
    flex: 1,
    padding: '5px 15px',
    '& + &': { borderLeft: '1px solid $shade300' },
  },
  '.icon': {
    fontSize: '150%',
    lineHeight: 1,
    display: 'inline-block',
    verticalAlign: 'middle',
    marginTop: '-5px',
    marginRight: '3px',
  },
  // '@print': {
  //   position: 'fixed',
  //   bottom: '.5cm',
  //   width: 'calc(100% - 1cm)',
  //   height: '55px',
  //   left: '.5cm',
  // },
})

const Select = styled('select', {
  width: '25px',
  appearance: 'none',
  border: 'none',
})

const Page: NextPageWithLayout = () => {
  const [date, setDate] = useState<Date>()
  const [items, setItems] = useState<{
    [id: string]: {
      total: number
      iva: boolean
    }
  }>({})
  const [invoiceNumber, setInvoiceNumber] = useState<
    number | string | undefined
  >()
  const [itemsPrice, setItemsPrice] = useState<number>(0)
  const [iva, setIva] = useState<number>(0)

  useEffect(() => {
    setDate(new Date())
    setInvoiceNumber(withZero(Math.floor(Math.random() * 10000000), 7))
  }, [])

  useEffect(() => {
    const updatedPrices = Object.values(items).reduce(
      (price, { total, iva }) => ({
        total: price.total + total,
        iva: price.iva + (iva ? Math.floor(total * 0.19) : 0),
      }),
      {
        total: 0,
        iva: 0,
      }
    )

    setItemsPrice(updatedPrices.total)
    setIva(updatedPrices.iva)
  }, [items])

  const removeItem = (id: string): void => {
    setItems(prev => {
      const { [id]: _, ...result } = prev
      return result
    })
  }

  const addItem = (): void => {
    setItems(items => ({
      ...items,
      [Date.now()]: {
        total: 0,
        iva: false,
      },
    }))
  }

  return (
    <>
      <Header>
        <Image src={asset('/images/logo.png')} css={{ width: '2.5cm' }} />

        <div>
          <Title>COTIZACIÓN</Title>
          <InvoiceNumber>
            Nº
            <Select css={{ marginLeft: '$3' }}>
              <option>C - Certificados</option>
              <option>E - Equipos</option>
              <option>M - Mantenimientos</option>
              <option>R - Repuestos</option>
            </Select>
            {invoiceNumber}
          </InvoiceNumber>
          <InvoiceDate>
            {date?.getDate()} {date?.toLocaleString('es', { month: 'long' })}{' '}
            {date?.getFullYear()}
          </InvoiceDate>
        </div>
      </Header>
      <Body>
        <Flex justify='between' css={{ paddingY: '.25cm' }}>
          <CustomerData>
            <h3>
              <Editable>Nombre de la empresa</Editable>
            </h3>
            <strong>
              Nit: <Editable>811134566-2</Editable>
            </strong>
            <br />
            <CustomerPerson>
              <Editable>Pepito Pérez</Editable>
              <br />
              <small>
                <Editable>pepito.p@empresa.com</Editable>
                <br />
                <Editable>300 123 0055</Editable>
              </small>
            </CustomerPerson>
          </CustomerData>
          <TotalPriceContainer>
            <TotalPrice>${priceMask(itemsPrice)}</TotalPrice>+ IVA{' '}
            {priceMask(iva)}
            <Box
              css={{
                borderTop: '1px solid',
                marginTop: '$1',
                paddingTop: '$1',
              }}
            >
              Total <strong>{priceMask(itemsPrice + iva)}</strong>
            </Box>
          </TotalPriceContainer>
        </Flex>

        <PriceTable>
          <thead>
            <tr>
              <th style={{ width: '55%' }}>Descripción</th>
              <th style={{ width: '15%' }}>Precio</th>
              <th style={{ width: '15%' }}>Cantidad</th>
              <th style={{ width: '15%' }}>Total</th>
              <Box
                as='th'
                css={{
                  paddingLeft: '$2',
                  '@print': {
                    display: 'none !important',
                  },
                }}
              >
                IVA
              </Box>
            </tr>
          </thead>
          <tbody>
            {Object.keys(items).map(id => (
              <InvoiceItem
                key={id}
                onRemoveItem={() => removeItem(id)}
                updateInvoicePrice={(itemTotal, iva) =>
                  setItems(items => ({
                    ...items,
                    [id]: {
                      total: itemTotal,
                      iva,
                    },
                  }))
                }
              />
            ))}
          </tbody>
        </PriceTable>

        <AddItemButton fluid onClick={addItem}>
          + agregar item
        </AddItemButton>

        <Notes>
          <strong>Nota</strong>
          <br />
          <Editable multiline fluid>
            xxxxx xxxxx xxxxx
          </Editable>
        </Notes>
      </Body>
      <Footer>
        <div>
          <strong>HM Maquinaria SAS.</strong>
          <br />
          Nit: 901357485-1
        </div>
        <div>
          Calle 36 sur # 44-37
          <br />
          Envigado Antioquia
        </div>
        <div>
          <strong>320 398 01 61</strong>
          <br />
          <a href='https://hm-maquinaria.com'>hm-maquinaria.com</a>
        </div>
      </Footer>
    </>
  )
}

Page.getLayout = (page: ReactElement) => (
  <>
    <Head>
      <title>HM Maquinaria - Cotización</title>
      <meta name='robots' content='noindex,follow' />
    </Head>
    <StyledPrint>{page}</StyledPrint>
  </>
)

export default Page
