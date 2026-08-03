export interface CertificationTemplate {
  id: string
  name: string
  equipment: string
  hours: number
  equipmentBrand: string
  limitedUse: string
  validity: string
  contactInfo: string
  description: string
  active: boolean
}

export const CERTIFICATION_TEMPLATES_KEY = 'hm_certification_templates'
export const defaultCertificationTemplates: CertificationTemplate[] = [
  { id: 'cert-safe-forklift', name: 'Operación segura de montacargas', equipment: 'Montacargas contrabalanceada', hours: 8, equipmentBrand: '', limitedUse: '', validity: '1 año', contactInfo: 'HM Maquinaria · 304 242 5384', description: 'Certificación teórico-práctica para operadores con experiencia.', active: true },
  { id: 'recert-forklift', name: 'Re-certificación de montacargas', equipment: 'Montacargas contrabalanceada', hours: 4, equipmentBrand: '', limitedUse: '', validity: '1 año', contactInfo: 'HM Maquinaria · 304 242 5384', description: 'Actualización anual de competencias del operador.', active: true },
  { id: 'cert-narrow-aisle', name: 'Operación de pasillo angosto', equipment: 'Montacargas de pasillo angosto', hours: 8, equipmentBrand: '', limitedUse: '', validity: '1 año', contactInfo: 'HM Maquinaria · 304 242 5384', description: 'Certificación específica para operación en pasillos angostos.', active: true },
]
export const readCertificationTemplates = (): CertificationTemplate[] => {
  if (typeof window === 'undefined') return defaultCertificationTemplates
  const stored = window.localStorage.getItem(CERTIFICATION_TEMPLATES_KEY)
  if (!stored) {
    window.localStorage.setItem(CERTIFICATION_TEMPLATES_KEY, JSON.stringify(defaultCertificationTemplates))
    return defaultCertificationTemplates
  }
  try {
    return (JSON.parse(stored) as Array<Partial<CertificationTemplate>>).map(item => ({
      ...item,
      id: item.id ?? `cert-template-${Date.now()}`,
      name: item.name ?? '', equipment: item.equipment ?? '', hours: item.hours ?? 8,
      equipmentBrand: item.equipmentBrand ?? '', limitedUse: item.limitedUse ?? '', validity: item.validity ?? '1 año',
      contactInfo: item.contactInfo ?? 'HM Maquinaria · 304 242 5384', description: item.description ?? '', active: item.active !== false,
    })) as CertificationTemplate[]
  } catch { return defaultCertificationTemplates }
}
export const saveCertificationTemplates = (templates: CertificationTemplate[]): void => window.localStorage.setItem(CERTIFICATION_TEMPLATES_KEY, JSON.stringify(templates))
