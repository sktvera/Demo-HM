import { useState } from 'react'
import { Box, Text } from 'components'

export const ContactWhatsApp = (): JSX.Element => {
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [service, setService] = useState('Certificación de operadores')
  const [message, setMessage] = useState('')

  const fieldClass = 'contact-field'

  return (
    <form
      className='contact-form'
      onSubmit={event => {
        event.preventDefault()
        const text = encodeURIComponent(
          `Hola, soy ${name}${company ? ` de ${company}` : ''}. Estoy interesado(a) en: ${service}.${message ? ` Mensaje: ${message}` : ''}`
        )
        window.open(`https://wa.me/573042425384?text=${text}`, '_blank', 'noopener,noreferrer')
      }}
    >
      <Box>
        <label htmlFor='contact-name'>Nombre completo</label>
        <input id='contact-name' className={fieldClass} value={name} onChange={event => setName(event.target.value)} required />
      </Box>
      <Box>
        <label htmlFor='contact-company'>Empresa</label>
        <input id='contact-company' className={fieldClass} value={company} onChange={event => setCompany(event.target.value)} />
      </Box>
      <Box css={{ gridColumn: '1 / -1' }}>
        <label htmlFor='contact-service'>Servicio de interés</label>
        <select id='contact-service' className={fieldClass} value={service} onChange={event => setService(event.target.value)}>
          <option>Certificación de operadores</option>
          <option>Re-certificación</option>
          <option>Formación desde cero</option>
          <option>Mantenimiento de maquinaria</option>
          <option>Alquiler de maquinaria</option>
        </select>
      </Box>
      <Box css={{ gridColumn: '1 / -1' }}>
        <label htmlFor='contact-message'>¿Cómo podemos ayudarle?</label>
        <textarea id='contact-message' className={fieldClass} rows={4} value={message} onChange={event => setMessage(event.target.value)} />
      </Box>
      <Box css={{ gridColumn: '1 / -1' }}>
        <button type='submit' className='contact-submit'>
          Enviar solicitud por WhatsApp
          <span>→</span>
        </button>
        <Text css={{ color: '$shade300', fontSize: '$1', marginTop: '$3' }}>
          Al continuar se abrirá WhatsApp con el mensaje listo para enviar.
        </Text>
      </Box>
    </form>
  )
}
