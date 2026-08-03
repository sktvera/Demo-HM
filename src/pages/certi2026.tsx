import { useState, useEffect, useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import type { ComponentPropsWithRef } from 'react'
import Head from 'next/head'
import { styled } from 'stitches.config'
import { Box, Image, Link, Flex, Print, Button, DesktopOnly } from 'components'
import { useForm, useFieldArray } from 'react-hook-form'
import type {
  UseFormRegister,
  UseFormReturn,
  FieldValues,
  UseFormWatch,
} from 'react-hook-form'
import chunk from 'lodash.chunk'
import { asset } from 'paths'
import type { CertificateRecord } from 'platform-storage'
import {
  readPendingCertificates,
  readCertificateRecords,
  saveCertificateRecords,
  savePendingCertificates,
} from 'platform-storage'

import { forkliftsNaming, brandsNaming, instructors } from '../constants'
import type { Brands, Forklifts, Instructor } from '../constants'
import type { NextPageWithLayout } from './_app'

/* ---------------------------- UTILIDADES ---------------------------- */
const idNumberMask = (price: number | string): string =>
  chunk(String(price).split('').reverse(), 3)
    .map((x: string[]) => x.reverse().join(''))
    .reverse()
    .join('.')

const getLocalYYYYMMDD = (): string => {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/* ---------------------------- ESTILOS ---------------------------- */
const Input = styled('input', { display: 'block', width: '100%' })
const Select = styled('select', { display: 'block', width: '100%' })
const StyledPrint = styled(Print, {
  backgroundImage: `url(${asset('/images/certification-stripe.png')})`,
  backgroundRepeat: 'no-repeat',
  fontFamily: 'Overpass',
  border: '3px solid black',
  padding: '0',
  marginTop: '.5cm',
})
const Body = Box
const Footer = styled(Flex, {
  fontWeight: 'lighter',
  background: 'black',
  padding: '0.25cm 1.25cm',
  '&, a': { color: 'white' },
})
const Title = styled('div', {
  fontSize: '$8',
  lineHeight: 0.85,
  position: 'absolute',
  letterSpacing: -1,
  left: '1.25cm',
  top: '1.5cm',
  div: {
    fontSize: 75,
    fontWeight: 'bold',
    marginTop: '$3',
  },
})
const Content = styled('div', {
  position: 'absolute',
  top: '8.12cm',
  right: '1cm',
  width: '10.5cm',
  '.name': {
    fontWeight: 'bold',
    fontSize: '$5',
    marginTop: '$1', // 🔹 Reducida distancia arriba
    marginBottom: '$2',
  },
  '.machine': {
    fontWeight: 'bold',
    fontSize: '$5',
    marginY: '$2',
    color: '$orange200',
    textTransform: 'uppercase',
  },
  '.place-and-date span': { textTransform: 'capitalize' },
  '.instructor-signature': {
    marginTop: '2cm',
    borderBottom: '1px solid',
    width: '70%',
  },
  '.instructor-name': {
    fontWeight: 'bold',
    fontSize: '$4',
    marginY: '$2',
  },
  '.instructor-number': { fontSize: '$2' },
})
const StyledLogo = styled(Image, {
  position: 'absolute',
  width: '5cm',
  left: '1.25cm',
  bottom: '2.5cm',
})

const Logo = (
  props: ComponentPropsWithRef<typeof StyledLogo>
): JSX.Element | null => {
  const [hidden, setHidden] = useState(false)
  if (hidden) return null
  return (
    <StyledLogo
      {...props}
      src='/images/logo.png'
      onError={() => setHidden(true)}
    />
  )
}

const StyledStamp = styled(Image, {
  position: 'absolute',
  top: 360,
  left: 99,
  width: '2.5cm',
  height: '2.5cm',
  objectFit: 'contain',
  mixBlendMode: 'multiply',
  backgroundColor: 'transparent',
  borderRadius: '$2',
  userSelect: 'none',
  pointerEvents: 'none',
})

const Stamp = ({ machine }: { machine?: Forklifts }): JSX.Element | null => {
  const [hidden, setHidden] = useState(false)
  if (!machine || hidden) return null
  return (
    <StyledStamp
      src={`/images/${machine}.png`}
      alt={machine}
      onError={() => setHidden(true)}
    />
  )
}

const StyledSideBar = styled('div', {
  background: 'white',
  borderRight: '1px solid $shade200',
  padding: '$5',
  position: 'sticky',
  overflow: 'auto',
  top: 0,
  left: 0,
  height: '100vh',
  width: 300,
})
const StyledForm = styled('form', {
  borderBottom: '1px solid $shade100',
  position: 'relative',
  paddingY: '$4',
  '> div': { marginY: '$2' },
  label: { cursor: 'pointer', display: 'block' },
})

/* ---------------------------- FORMULARIO ---------------------------- */
const Form = ({
  register,
  index,
  remove,
  watch,
}: {
  register: UseFormRegister<FieldValues>
  index: number
  remove: () => void
  watch: UseFormWatch<FieldValues>
}): JSX.Element => {
  const $ = (s: string | TemplateStringsArray): string =>
    `certifications.${index}.${s}`

  const [date, setDate] = useState<string>('')
  useEffect(() => setDate(getLocalYYYYMMDD()), [])
  const enabled = !!watch($`customizeTexts`)

  return (
    <StyledForm
      className='certificate-candidate-form'
      onKeyDown={e => {
        if (e.code === 'Enter') e.preventDefault()
      }}
    >
      <Button
        css={{
          size: 20,
          padding: 0,
          marginTop: '$2',
          position: 'absolute',
          top: '$2',
          right: 0,
          fontSize: '$1',
        }}
        onClick={remove}
      >
        X
      </Button>

      <div>
        <label>Nombre</label>
        <Input {...register($`name`, { required: true })} />
      </div>

      <div>
        <label>No. cédula</label>
        <Input
          type='number'
          {...register($`idNumber`, { required: true, valueAsNumber: true })}
        />
      </div>

      <div>
        <label>Ciudad cédula</label>
        <Input {...register($`idCity`, { required: true })} />
      </div>

      <div>
        <label>Equipo</label>
        <Select {...register($`machine`, { required: true })}>
          {Object.entries(forkliftsNaming).map(([key, value]) => (
            <option value={key} key={key}>
              {value}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label>Horas de capacitación</label>
        <Input
          type='number'
          placeholder='Ej: 8'
          min={1}
          {...register($`hours`, { required: true, valueAsNumber: true })}
        />
      </div>

      <div>
        <label>Marca equipo</label>
        <Select {...register($`machineBrand`, { required: true })}>
          <option />
          {Object.entries(brandsNaming).map(([key, value]) => (
            <option value={key} key={key}>
              {value}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label>Instructor</label>
        <Select
          {...register($`instructor`, {
            required: true,
            setValueAs: v => (v === '' ? undefined : instructors[v]),
          })}
        >
          <option />
          {instructors.map((instructor, i) => (
            <option value={i} key={i}>
              {instructor.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label>Fecha</label>
        <Input
          type='date'
          {...register($`date`, {
            required: true,
            setValueAs: v => {
              if (!v) return new Date()
              const d = new Date(v)
              d.setMinutes(d.getMinutes() + d.getTimezoneOffset())
              return d
            },
          })}
          defaultValue={date}
        />
      </div>

      <div>
        <label>
          <Input
            type='checkbox'
            {...register($`recertification`)}
            css={{
              marginRight: '$2',
              marginTop: '$3',
              display: 'inline-block',
              width: 'auto',
            }}
          />
          re-certificación
        </label>
      </div>

      <hr style={{ marginTop: 16, marginBottom: 12 }} />
      <div>
        <label>
          <Input
            type='checkbox'
            {...register($`customizeTexts`)}
            css={{ marginRight: '$2', display: 'inline-block', width: 'auto' }}
          />
          Personalizar textos del certificado
        </label>
      </div>

      <div>
        <label>Uso limitado por</label>
        <Input
          type='text'
          placeholder='p. ej., DHL Colombia'
          disabled={!enabled}
          {...register($`usageText`)}
        />
      </div>
      <div>
        <label>Certificado válido por</label>
        <Input
          type='text'
          placeholder='p. ej., 1 año'
          disabled={!enabled}
          {...register($`validityText`)}
        />
      </div>
      <div>
        <label>Información de contacto</label>
        <Input
          type='text'
          placeholder='tel: 300 000 0000 · email: soporte@dominio.com'
          disabled={!enabled}
          {...register($`contactText`)}
        />
      </div>
    </StyledForm>
  )
}

/* ---------------------------- FORMS WRAPPER ---------------------------- */
const Forms = (props: UseFormReturn): JSX.Element => {
  const { control, register, watch } = props
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'certifications',
  })

  return (
    <>
      {fields.map((field, index) => (
        <Form
          key={field.id}
          register={register}
          index={index}
          watch={watch}
          remove={() => remove(index)}
        />
      ))}
      <Button
        onClick={() =>
          append({
            name: '',
            idNumber: undefined,
            idCity: '',
            machine: Object.keys(forkliftsNaming)[0] as Forklifts,
            machineBrand: undefined,
            date: new Date(),
            recertification: false,
            instructor: undefined,
            customizeTexts: false,
            usageText: '',
            validityText: '',
            contactText: '',
            hours: 8,
          })
        }
        css={{ marginTop: '$5' }}
      >
        Agregar candidato
      </Button>
    </>
  )
}

/* ---------------------------- CERTIFICADO ---------------------------- */
interface CertificationProps {
  name: string
  idNumber: number
  idCity: string
  machine: Forklifts
  machineBrand?: Brands
  date: Date
  recertification: boolean
  instructor?: Instructor
  customizeTexts?: boolean
  usageText?: string
  validityText?: string
  contactText?: string
  hours?: number
  onSave?: () => void
}

const Certification = ({
  name,
  idNumber,
  idCity,
  machine,
  machineBrand,
  date,
  recertification,
  instructor,
  customizeTexts,
  usageText,
  validityText,
  contactText,
  hours,
  onSave,
}: CertificationProps): JSX.Element => {
  const parsedDate = new Date(date)
  const [hideSignature, setHideSignature] = useState(false)

  // ✅ 1. Crear ref
  const printRef = useRef<HTMLDivElement | null>(null)

  // ✅ 2. Configurar hook con contentRef (nuevo API)
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Certificación ${name || 'HM Maquinaria'}`,
    pageStyle: `
      @page { size: A4; margin: 1cm; }
      @media print {
        body { -webkit-print-color-adjust: exact; }
      }
    `,
  })

  const fallbackUsage = 'Uso limitado por ****'
  const fallbackValidity = 'Certificado válido por *****'
  const fallbackContact = 'Información de contacto tel*** email **'

  const usage =
    customizeTexts && usageText?.trim()
      ? `Uso limitado por ${usageText.trim()}`
      : fallbackUsage
  const validity =
    customizeTexts && validityText?.trim()
      ? `Certificado válido por ${validityText.trim()}`
      : fallbackValidity
  const contact =
    customizeTexts && contactText?.trim() ? contactText.trim() : fallbackContact

  // ---------------------------- RENDER ---------------------------- //
  return (
    <>
      {/* ✅ Botón para imprimir */}
      <Button
        onClick={handlePrint}
        css={{
          marginBottom: '$3',
          background: '$orange200',
          color: 'white',
          fontWeight: 'bold',
          '@print': { display: 'none' },
        }}
      >
        Imprimir certificado
      </Button>
      <Button
        onClick={onSave}
        disabled={!onSave}
        css={{
          marginBottom: '$3',
          marginLeft: '$2',
          background: '$black',
          color: 'white',
          fontWeight: 'bold',
          '@print': { display: 'none' },
        }}
      >
        Guardar en registro
      </Button>

      {/* ✅ Contenido imprimible */}
      <div ref={printRef}>
        <StyledPrint>
          <Title>
            {recertification && 'Re-'}Certificación
            <br />
            HM Maquinaria
            <br />
            <div>{parsedDate.getFullYear()}</div>
          </Title>

          <Body fluid>
            <Stamp machine={machine} />

            <Content>
              Certificamos que,
              <div className='name'>{name || 'Pepito Pérez'}</div>
              <div className='id'>
                Con cédula{' '}
                {Number.isNaN(idNumber)
                  ? '1.337.009.123'
                  : idNumberMask(idNumber)}
              </div>
              <div className='city'>{idCity || 'Medellín'}.</div>
              <br />
              Asistió a la capacitación de{' '}
              <strong>{hours ?? (recertification ? 4 : 8)} horas </strong>
              sobre normas de seguridad en la operación de:
              <div className='machine'>
                {forkliftsNaming[machine]}
                {machineBrand && machineBrand.trim() !== ''
                  ? ` (${machineBrand})`
                  : ''}
              </div>
              <div className='place-and-date'>
                Envigado, {parsedDate.getDate()} de{' '}
                <span>
                  {parsedDate.toLocaleString('es', { month: 'long' })}
                </span>{' '}
                de {parsedDate.getFullYear()}
              </div>
              <div className='instructor-signature'>
                {instructor?.signature && !hideSignature ? (
                  <Image
                    src={instructor.signature}
                    height={75}
                    alt='Firma instructor'
                    onError={() => setHideSignature(true)}
                  />
                ) : null}
              </div>
              <div className='instructor-name'>
                {instructor?.name ?? 'Instructor'}
              </div>
              <div className='instructor-number'>
                <strong>Competencias Laborales</strong>
                <br />
                SENA: 270101114
              </div>
              <p style={{ textAlign: 'right' }}>
                <strong>* {usage}</strong>
                <br />
                <strong>{validity}</strong>
                <br />
                {contact}
              </p>
            </Content>

            <Logo />
          </Body>

          <Footer justify='between'>
            <span>HM Maquinaria SAS.</span>
            <Link href='https://hm-maquinaria.com'>hm-maquinaria.com</Link>
          </Footer>
        </StyledPrint>
      </div>
    </>
  )
}

/* ---------------------------- MAIN & PAGE ---------------------------- */
const Main = ({
  formProps,
  onSave,
}: {
  formProps: UseFormReturn
  onSave?: (props: CertificationProps) => void
}): JSX.Element => {
  const { watch } = formProps
  const values = watch()

  return (
    <Flex
      css={{
        padding: '$5',
        '@print': { padding: 0, display: 'block' },
      }}
      gap={{ '@initial': 5, '@print': 0 }}
      direction='column'
    >
      {values.certifications?.map(
        (props: CertificationProps, index: number) => {
          const raw = props as CertificationProps & {
            instructor?: Instructor | string
            date: Date | string
          }
          const normalized: CertificationProps = {
            ...raw,
            date: raw.date instanceof Date ? raw.date : new Date(raw.date),
            idNumber: Number(raw.idNumber),
            instructor:
              typeof raw.instructor === 'string'
                ? instructors[Number(raw.instructor)]
                : raw.instructor,
          }
          return (
            <Certification
              {...normalized}
              key={index}
              onSave={onSave ? () => onSave(normalized) : undefined}
            />
          )
        }
      )}
    </Flex>
  )
}

const SideBar = ({
  formProps,
  pendingCount,
}: {
  formProps: UseFormReturn
  pendingCount: number
}): JSX.Element => (
  <StyledSideBar className='certificate-builder-sidebar'>
    <Box className='certificate-builder-brand'>
      <span>HM</span>
      <Box>
        <a href='/admin' className='certificate-builder-back'>
          ← Volver al panel
        </a>
        <strong>Emisión de certificados</strong>
        <small>Complete y gestione candidatos</small>
      </Box>
    </Box>
    <Box className='certificate-builder-title'>
      <h2>Candidatos</h2>
      <p>
        Los datos se cargarán en el certificado sin cambiar su diseño de
        impresión.
      </p>
    </Box>
    <Box
      css={{
        margin: '$3 0',
        padding: '$3',
        borderRadius: 10,
        color: pendingCount ? '#9a3412' : '#667085',
        background: pendingCount ? '#fff7ed' : '#f2f4f7',
      }}
    >
      <strong>
        {pendingCount}{' '}
        {pendingCount === 1 ? 'certificado listo' : 'certificados listos'}
      </strong>
      <small style={{ display: 'block', marginTop: 3 }}>
        Pendientes de imprimir y guardar
      </small>
    </Box>
    <Box>
      <Forms {...formProps} />
    </Box>
  </StyledSideBar>
)

const Page: NextPageWithLayout = () => {
  const formProps = useForm<FieldValues>({
    mode: 'onBlur',
    defaultValues: { certifications: [] },
  })
  const [pending, setPending] = useState<CertificateRecord[]>([])
  const [notice, setNotice] = useState('')

  useEffect(() => {
    const queue = readPendingCertificates()
    setPending(queue)
    if (!queue.length) return
    formProps.reset({
      certifications: queue.map(record => ({
        name: record.fullName,
        idNumber: Number(record.documentNumber) || undefined,
        idCity: 'Medellín',
        machine: Object.keys(forkliftsNaming)[0] as Forklifts,
        machineBrand: '',
        date: new Date(record.issuedAt),
        recertification: record.certificationType === 'recertificacion',
        instructor: String(
          Math.max(
            0,
            instructors.findIndex(item => item.name === record.instructor)
          )
        ),
        customizeTexts: true,
        usageText: record.limitedUse,
        validityText: record.expiresAt,
        contactText: record.contactInfo,
        hours: record.trainingHours,
      })),
    })
  }, [formProps])

  const saveCandidate = (props: CertificationProps): void => {
    const documentNumber = String(props.idNumber)
    const queued = pending.find(
      record => record.documentNumber === documentNumber
    )
    const existing = readCertificateRecords()
    const previous = existing.find(
      record => record.documentNumber === documentNumber
    )
    const record: CertificateRecord = {
      ...(queued ?? {
        id:
          previous?.id ?? `certificate-manual-${documentNumber}-${Date.now()}`,
        fullName: props.name,
        documentType: 'Documento de identidad',
        documentNumber,
        equipment: forkliftsNaming[props.machine],
        trainingHours: props.hours ?? 8,
        equipmentBrand: props.machineBrand ?? '',
        instructor: props.instructor?.name ?? 'Instructor',
        issuedAt: props.date.toISOString().slice(0, 10),
        certificationType: props.recertification
          ? 'recertificacion'
          : 'certificacion',
        limitedUse: props.usageText ?? '',
        expiresAt: props.validityText ?? '',
        contactInfo: props.contactText ?? '',
        createdAt: new Date().toISOString(),
      }),
      fullName: props.name,
      documentNumber,
      instructor: props.instructor?.name ?? queued?.instructor ?? 'Instructor',
      issuedAt: props.date.toISOString().slice(0, 10),
    }
    saveCertificateRecords([
      ...existing.filter(item => item.id !== record.id),
      record,
    ])
    const remaining = pending.filter(item => item.id !== record.id)
    savePendingCertificates(remaining)
    setPending(remaining)
    setNotice(`${props.name} quedó registrado correctamente.`)
    window.setTimeout(() => setNotice(''), 3500)
  }
  return (
    <>
      <Head>
        <title>HM Maquinaria - Certificación</title>
        <meta name='robots' content='noindex,follow' />
      </Head>
      <DesktopOnly />
      <Flex className='certificate-builder'>
        <SideBar formProps={formProps} pendingCount={pending.length} />
        {notice && (
          <Box
            css={{
              position: 'fixed',
              top: 20,
              right: 20,
              zIndex: 100,
              padding: 14,
              borderRadius: 10,
              color: '#027a48',
              background: '#ecfdf3',
            }}
          >
            {notice}
          </Box>
        )}
        <Main formProps={formProps} onSave={saveCandidate} />
      </Flex>
    </>
  )
}

export default Page
