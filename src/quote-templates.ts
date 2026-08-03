export interface QuoteTemplateItem {
  id: string
  description: string
  quantity: number
  price: number
  taxable: boolean
}

export interface QuoteTemplate {
  id: string
  name: string
  category: string
  description: string
  items: QuoteTemplateItem[]
  notes: string
}

export const QUOTE_TEMPLATES_KEY = 'hm_quote_templates'

export const defaultQuoteTemplates: QuoteTemplate[] = [
  { id: 'tpl-cert', name: 'Certificación de montacargas', category: 'Certificación', description: 'Evaluación teórico-práctica y emisión de certificado.', notes: 'Vigencia de la oferta: 15 días. Certificado válido por 1 año.', items: [{ id: 'cert-item', description: 'Certificación en operación segura de montacargas · 8 horas', quantity: 1, price: 412000, taxable: true }] },
  { id: 'tpl-recert', name: 'Re-certificación de montacargas', category: 'Certificación', description: 'Actualización de competencias para operadores con experiencia.', notes: 'Requiere acreditar mínimo un año de experiencia. Vigencia de la oferta: 15 días.', items: [{ id: 'recert-item', description: 'Re-certificación en operación segura de montacargas · 4 horas', quantity: 1, price: 362000, taxable: true }] },
  { id: 'tpl-course', name: 'Curso montacarguista desde cero', category: 'Formación', description: 'Formación integral de operador de equipos logísticos.', notes: 'Programación sujeta a disponibilidad y confirmación de pago.', items: [{ id: 'course-item', description: 'Formación de montacarguista desde cero · 16 horas', quantity: 1, price: 1200000, taxable: true }] },
  { id: 'tpl-maintenance', name: 'Mantenimiento preventivo', category: 'Maquinaria', description: 'Inspección técnica y mantenimiento preventivo.', notes: 'Repuestos y trabajos adicionales se cotizan previa autorización.', items: [{ id: 'maintenance-item', description: 'Servicio de mantenimiento preventivo de maquinaria', quantity: 1, price: 0, taxable: true }] },
]

export const readQuoteTemplates = (): QuoteTemplate[] => {
  if (typeof window === 'undefined') return defaultQuoteTemplates
  const stored = window.localStorage.getItem(QUOTE_TEMPLATES_KEY)
  if (!stored) {
    window.localStorage.setItem(QUOTE_TEMPLATES_KEY, JSON.stringify(defaultQuoteTemplates))
    return defaultQuoteTemplates
  }
  try {
    return JSON.parse(stored) as QuoteTemplate[]
  } catch {
    return defaultQuoteTemplates
  }
}

export const saveQuoteTemplates = (templates: QuoteTemplate[]): void => {
  window.localStorage.setItem(QUOTE_TEMPLATES_KEY, JSON.stringify(templates))
}
