
import { useState } from 'react'
import { Modal, Field, inputCls } from './ui.jsx'
import { AREAS } from '../data/listings.js'
import { supabase } from '../lib/supabase.js'

const initial = { title: '', category: 'rent', property_type: '2-Bed Flat', area: 'gra', street: '', price: '', period: 'year', bedrooms: '2', bathrooms: '2', description: '', power: '', water: '', student_walk: '', verified: false, published: false }
const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export default function AdminDashboard({ onClose, onSaved }) {
  const [form, setForm] = useState(initial)
  const [files, setFiles] = useState([])
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const set = (key, value) => setForm((old) => ({ ...old, [key]: value }))

  const submit = async (event) => {
    event.preventDefault(); setNotice('')
    if (!supabase) return setNotice('Supabase is not configured.')
    if (!form.title.trim() || !form.price || !form.description.trim()) return setNotice('Please complete the title, price and description.')
    setBusy(true)
    try {
      const imageUrls = []
      for (const file of files) {
        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
        const path = `${crypto.randomUUID()}.${ext}`
        const { error: uploadError } = await supabase.storage.from('property-images').upload(path, file, { upsert: false, contentType: file.type })
        if (uploadError) throw uploadError
        const { data } = supabase.storage.from('property-images').getPublicUrl(path)
        imageUrls.push(data.publicUrl)
      }
      const slug = `${slugify(form.title)}-${Math.random().toString(36).slice(2, 7)}`
      const payload = {
        slug, title: form.title.trim(), category: form.category, property_type: form.property_type,
        area: form.area, street: form.street.trim(), price: Number(form.price.replace(/,/g, '')),
        period: form.category === 'sale' ? null : form.period,
        bedrooms: form.property_type.toLowerCase().includes('land') ? null : (form.bedrooms ? Number(form.bedrooms) : null),
        bathrooms: form.property_type.toLowerCase().includes('land') ? null : (form.bathrooms ? Number(form.bathrooms) : null),
        student_walk: form.student_walk ? Number(form.student_walk) : null,
        description: form.description.trim(), power: form.power.trim() || 'Ask for current details',
        water: form.water.trim() || 'Ask for current details', images: imageUrls,
        verified: form.verified, published: form.published,
      }
      const { error } = await supabase.from('properties').insert(payload)
      if (error) throw error
      setNotice('Property saved successfully.')
      setForm(initial); setFiles([]); onSaved?.()
    } catch (error) { setNotice(error.message || 'Could not save the property.') }
    finally { setBusy(false) }
  }

  return <Modal title="Ogwara Properties · Admin" onClose={onClose} wide>
    <p className="mb-4 rounded-xl bg-teal-tint p-3 text-sm text-navy">Private property manager. Only the administrator account can save listings. Publish only after the property details and ownership/agent authority have been checked.</p>
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2"><Field label="Property title"><input className={inputCls} value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Modern 3-bedroom apartment in GRA" /></Field></div>
      <Field label="Listing type"><select className={inputCls} value={form.category} onChange={(e) => set('category', e.target.value)}><option value="rent">For rent</option><option value="sale">For sale</option><option value="shortlet">Short let</option></select></Field>
      <Field label="Property type"><select className={inputCls} value={form.property_type} onChange={(e) => set('property_type', e.target.value)}>{['Self-Contain','Single Room','1-Bed Flat','2-Bed Flat','3-Bed Flat','4-Bed House','Land Plot','Standalone House','Block of Flats','Furnished Apartment'].map((v) => <option key={v}>{v}</option>)}</select></Field>
      <Field label="Area"><select className={inputCls} value={form.area} onChange={(e) => set('area', e.target.value)}>{AREAS.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></Field>
      <Field label="Street / address"><input className={inputCls} value={form.street} onChange={(e) => set('street', e.target.value)} /></Field>
      <Field label="Price (₦)"><input className={inputCls} inputMode="numeric" value={form.price} onChange={(e) => set('price', e.target.value.replace(/[^\d,]/g, ''))} placeholder="850000" /></Field>
      <Field label="Price period"><select className={inputCls} value={form.period} onChange={(e) => set('period', e.target.value)}><option value="year">Per year</option><option value="night">Per night</option></select></Field>
      <Field label="Bedrooms"><input className={inputCls} type="number" min="0" value={form.bedrooms} onChange={(e) => set('bedrooms', e.target.value)} /></Field>
      <Field label="Bathrooms"><input className={inputCls} type="number" min="0" value={form.bathrooms} onChange={(e) => set('bathrooms', e.target.value)} /></Field>
      <Field label="Power supply"><input className={inputCls} value={form.power} onChange={(e) => set('power', e.target.value)} placeholder="Describe accurately" /></Field>
      <Field label="Water supply"><input className={inputCls} value={form.water} onChange={(e) => set('water', e.target.value)} placeholder="Describe accurately" /></Field>
      <Field label="Walk to UNIBEN (minutes, optional)"><input className={inputCls} type="number" min="0" value={form.student_walk} onChange={(e) => set('student_walk', e.target.value)} /></Field>
      <div className="sm:col-span-2"><Field label="Description"><textarea className={inputCls} rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} /></Field></div>
      <div className="sm:col-span-2"><Field label="Property photos"><input className={inputCls} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} /><span className="mt-1 block text-xs text-navy/60">Use genuine property photos. JPG, PNG or WebP recommended.</span></Field></div>
      <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={form.verified} onChange={(e) => set('verified', e.target.checked)} /> Mark as verified (only after checks)</label>
      <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={form.published} onChange={(e) => set('published', e.target.checked)} /> Publish immediately</label>
      {notice && <p className="sm:col-span-2 rounded-lg bg-paper p-3 text-sm" role="status">{notice}</p>}
      <div className="sm:col-span-2"><button disabled={busy} className="w-full rounded-xl bg-teal px-4 py-3.5 font-bold text-navy disabled:opacity-60">{busy ? 'Saving property…' : 'Save property'}</button></div>
    </form>
  </Modal>
}
