import type { ReactElement } from 'react'
import { useEffect, useMemo, useState } from 'react'
import Head from 'next/head'
import { Box, Flex, Text } from 'components'
import { AdminGuard } from 'components/admin-guard'
import { AdminShell } from 'layout/admin-shell'
import { readQuoteTemplates, saveQuoteTemplates } from 'quote-templates'
import type { QuoteTemplate } from 'quote-templates'

import type { NextPageWithLayout } from '../_app'

const PAGE_SIZE = 7
const uid = (prefix: string): string => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
const currency = (value: number): string => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)
const emptyTemplate = (): QuoteTemplate => ({ id: uid('template'), name: '', category: 'Certificación', description: '', notes: 'Vigencia de la oferta: 15 días calendario.', items: [{ id: uid('item'), description: '', quantity: 1, price: 0, taxable: true }] })

const Page: NextPageWithLayout = () => {
  const [templates, setTemplates] = useState<QuoteTemplate[]>([])
  const [editing, setEditing] = useState<QuoteTemplate | null>(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)
  const [deleting, setDeleting] = useState<QuoteTemplate | null>(null)

  useEffect(() => setTemplates(readQuoteTemplates()), [])
  const saveAll = (next: QuoteTemplate[]): void => {
    setTemplates(next)
    saveQuoteTemplates(next)
  }
  const persist = (): void => {
    if (!editing?.name.trim() || !editing.items.length) return
    saveAll(templates.some(template => template.id === editing.id) ? templates.map(template => template.id === editing.id ? editing : template) : [...templates, editing])
    setEditing(null)
  }
  const duplicate = (template: QuoteTemplate): void => {
    const copy = { ...template, id: uid('template'), name: `${template.name} (copia)`, items: template.items.map(item => ({ ...item, id: uid('item') })) }
    saveAll([...templates, copy])
  }
  const categories = Array.from(new Set(templates.map(template => template.category))).filter(Boolean)
  const filtered = useMemo(() => templates.filter(template => {
    const text = search.trim().toLowerCase()
    return (!text || [template.name, template.description, template.category].some(value => value.toLowerCase().includes(text))) && (!category || template.category === category)
  }), [category, search, templates])
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return <AdminGuard permission='quotes.manage'>
    <Head><title>Biblioteca de cotizaciones | Administración HM</title></Head>
    <Flex className='template-library-heading' justify='between' align='end'><Box><Text as='h1' css={{ fontSize: '$7' }}>Biblioteca de cotizaciones asociadas</Text><Text css={{ color: '$shade300' }}>Administre contenidos reutilizables para construir propuestas con mayor rapidez.</Text></Box><button className='admin-primary-button' onClick={() => setEditing(emptyTemplate())}>+ Crear plantilla</button></Flex>
    <Box className='associate-kpis template-library-kpis'><Box><span>Total plantillas</span><strong>{templates.length}</strong><small>Disponibles para cotizar</small></Box><Box><span>Categorías</span><strong>{categories.length}</strong><small>Grupos comerciales</small></Box><Box><span>Ítems configurados</span><strong>{templates.reduce((sum, template) => sum + template.items.length, 0)}</strong><small>Productos y servicios</small></Box><Box><span>Valor de referencia</span><strong>{currency(templates.reduce((sum, template) => sum + template.items.reduce((total, item) => total + item.quantity * item.price, 0), 0))}</strong><small>Suma de todas las plantillas</small></Box></Box>
    <Box className='access-table-panel'>
      <Box className='access-filters template-library-filters'><input value={search} onChange={event => { setSearch(event.target.value); setPage(1) }} placeholder='Buscar por nombre, descripción o categoría…' /><select value={category} onChange={event => { setCategory(event.target.value); setPage(1) }}><option value=''>Todas las categorías</option>{categories.map(value => <option key={value}>{value}</option>)}</select></Box>
      <Box className='access-table-scroll'><table className='access-table template-library-table'><thead><tr><th>Plantilla</th><th>Categoría</th><th>Contenido</th><th>Valor base</th><th>Condiciones</th><th>Acciones</th></tr></thead><tbody>{visible.map(template => {
        const total = template.items.reduce((sum, item) => sum + item.quantity * item.price, 0)
        return <tr key={template.id}><td><strong>{template.name}</strong><small className='access-code'>{template.description || 'Sin descripción'}</small></td><td><span className='template-category'>{template.category}</span></td><td><span className='access-count'>{template.items.length}</span> ítem{template.items.length === 1 ? '' : 's'}</td><td><strong>{currency(total)}</strong><small className='access-code'>Antes de IVA</small></td><td className='access-description'>{template.notes}</td><td><Flex gap='2' css={{ width: 'auto' }}><button className='access-action' onClick={() => setEditing({ ...template, items: template.items.map(item => ({ ...item })) })}>Editar</button><button className='template-icon-action' title='Duplicar plantilla' onClick={() => duplicate(template)}>⧉</button><button className='template-icon-action danger' title='Eliminar plantilla' onClick={() => setDeleting(template)}>×</button></Flex></td></tr>
      })}</tbody></table></Box>
      {!visible.length && <Box className='access-empty'><strong>No hay plantillas para mostrar</strong><p>Cambie los filtros o cree una nueva plantilla.</p></Box>}
      <Flex className='access-pagination' justify='between' align='center'><Text>Mostrando {visible.length} de {filtered.length} plantillas</Text><Flex gap='2' css={{ width: 'auto' }}><button disabled={page === 1} onClick={() => setPage(page - 1)}>Anterior</button><span>Página {page} de {pages}</span><button disabled={page === pages} onClick={() => setPage(page + 1)}>Siguiente</button></Flex></Flex>
    </Box>

    {editing && <Box className='admin-modal access-drawer template-drawer' onClick={() => setEditing(null)}><Box className='admin-modal-card' onClick={event => event.stopPropagation()}>
      <Box className='template-drawer-header'><Flex justify='between' align='center'><Box><span>Biblioteca comercial</span><Text as='h2'>{templates.some(template => template.id === editing.id) ? 'Editar plantilla' : 'Nueva plantilla'}</Text><Text css={{ color: '$shade300', fontSize: '$2' }}>Configure información reutilizable para futuras cotizaciones.</Text></Box><button className='drawer-close' onClick={() => setEditing(null)}>×</button></Flex></Box>
      <Box className='template-drawer-body'>
        <Box className='associate-form-grid'><label className='admin-field wide'>Nombre de la plantilla *<input value={editing.name} onChange={event => setEditing({ ...editing, name: event.target.value })} placeholder='Ej. Certificación empresarial 10 operadores' /></label><label className='admin-field'>Categoría<input list='template-categories' value={editing.category} onChange={event => setEditing({ ...editing, category: event.target.value })} /><datalist id='template-categories'>{categories.map(value => <option key={value}>{value}</option>)}</datalist></label><label className='admin-field wide'>Descripción<textarea rows={3} value={editing.description} onChange={event => setEditing({ ...editing, description: event.target.value })} /></label></Box>
        <Flex className='template-items-title' justify='between' align='center'><Box><strong>Ítems preconfigurados</strong><small>{editing.items.length} ítems en la plantilla</small></Box><button className='admin-secondary-button' onClick={() => setEditing({ ...editing, items: [...editing.items, { id: uid('item'), description: '', quantity: 1, price: 0, taxable: true }] })}>+ Agregar ítem</button></Flex>
        <Box className='template-item-editor'>{editing.items.map((item, index) => <Box key={item.id}><Box className='template-item-index'>{String(index + 1).padStart(2, '0')}</Box><label className='admin-field'>Descripción<textarea rows={2} value={item.description} onChange={event => setEditing({ ...editing, items: editing.items.map(value => value.id === item.id ? { ...value, description: event.target.value } : value) })} /></label><Box className='template-item-numbers'><label>Cantidad<input type='number' min='1' value={item.quantity} onChange={event => setEditing({ ...editing, items: editing.items.map(value => value.id === item.id ? { ...value, quantity: Number(event.target.value) } : value) })} /></label><label>Valor unitario<input type='number' min='0' value={item.price || ''} onChange={event => setEditing({ ...editing, items: editing.items.map(value => value.id === item.id ? { ...value, price: Number(event.target.value) } : value) })} /></label><label className='template-tax'><input type='checkbox' checked={item.taxable} onChange={event => setEditing({ ...editing, items: editing.items.map(value => value.id === item.id ? { ...value, taxable: event.target.checked } : value) })} /> IVA 19%</label></Box><button className='template-remove-item' disabled={editing.items.length === 1} onClick={() => setEditing({ ...editing, items: editing.items.filter(value => value.id !== item.id) })}>Eliminar</button></Box>)}</Box>
        <label className='admin-field template-notes'>Notas y condiciones<textarea rows={5} value={editing.notes} onChange={event => setEditing({ ...editing, notes: event.target.value })} /></label>
      </Box>
      <Flex className='template-drawer-footer' justify='end' gap='3'><button className='admin-secondary-button' onClick={() => setEditing(null)}>Cancelar</button><button className='admin-primary-button' disabled={!editing.name.trim() || !editing.category.trim() || !editing.items.length || editing.items.some(item => !item.description.trim())} onClick={persist}>Guardar plantilla</button></Flex>
    </Box></Box>}
    {deleting && <Box className='admin-modal template-delete-modal' onClick={() => setDeleting(null)}><Box className='admin-modal-card' onClick={event => event.stopPropagation()}><span>Eliminar plantilla</span><Text as='h2'>{deleting.name}</Text><p>Esta acción quitará la plantilla del constructor de cotizaciones asociadas.</p><Flex justify='end' gap='3'><button className='admin-secondary-button' onClick={() => setDeleting(null)}>Cancelar</button><button className='admin-danger-button' onClick={() => { saveAll(templates.filter(template => template.id !== deleting.id)); setDeleting(null) }}>Eliminar definitivamente</button></Flex></Box></Box>}
  </AdminGuard>
}

Page.getLayout = (page: ReactElement) => <AdminShell>{page}</AdminShell>
export default Page
