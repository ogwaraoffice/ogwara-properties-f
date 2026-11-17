import { useState } from 'react'
import { CheckCircle2, MessageCircle, ShieldCheck } from 'lucide-react'
import { AREAS, LISTING_FEE } from '../data/listings.js'
import { listingFeeLink } from '../lib/whatsapp.js'
import { Field, Modal, inputCls } from './ui.jsx'

const EMPTY = { name: '', phone: '', category: 'rent', area: AREAS[0].id, price: '', description: '' }

export default function LandlordModal({ user, onSubmit, onClose }) {
  const [f, setF] = useState({ ...EMPTY, name: user?.name || '' })
  const [errors, setErrors] = useState({})
  const [done, setDone] = useState(null)
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }))

  const validate = () => {
    const e = {}
    if (f.name.trim().length < 2) e.name = 'Enter your full name.'
    if (!/^(\+?234|0)[789][01]\d{8}$/.test(f.phone.replace(/[\s-]/g, ''))) e.phone = 'Enter a valid Nigerian number, e.g. 0802 123 4567.'
    if (!f.price.trim()) e.price = 'Enter your asking price.'
    if (f.description.trim().length < 15) e.description = 'Add a short description (at least 15 characters).'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = (ev) => {
    ev.preventDefault()
    if (!validate()) return
    const ref = 'SUB-' + Date.now().toString(36).toUpperCase()
    const payload = { ...f, name: f.name.trim(), description: f.description.trim(), ref, status: 'pending_payment', createdAt: new Date().toISOString() }
    onSubmit(payload)
    setDone(payload)
    window.open(listingFeeLink(payload), '_blank', 'noopener')
  }

  if (done) {
    return (
      <Modal title="Listing received" onClose={onClose}>
        <div className="space-y-4 text-center">
          <CheckCircle2 className="mx-auto text-teal-deep" size={48} aria-hidden="true" />
          <p className="font-semibold">Your reference is <span className="rounded bg-paper px-2 py-0.5 font-mono">{done.ref}</span></p>
          <p className="text-sm leading-relaxed text-navy/80">We opened WhatsApp with your details. Your property goes live only after the verification and listing fee is settled and our team has checked the property. If WhatsApp did not open, use the button below.</p>
          <a href={listingFeeLink(done)} target="_blank" rel="noopener noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal px-4 py-3.5 font-bold text-navy">
            <MessageCircle size={20} aria-hidden="true" /> Pay Listing Fee on WhatsApp
          </a>
          <button onClick={onClose} className="w-full rounded-xl border-2 border-navy px-4 py-3 font-bold">Done</button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title="List Property (Landlords)" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div className="rounded-xl border-2 border-teal bg-teal-tint p-4 text-sm">
          <p className="flex items-center gap-2 font-bold text-teal-deep"><ShieldCheck size={18} aria-hidden="true" /> Verification &amp; listing fee required</p>
          <p className="mt-1.5 leading-relaxed">To keep fraudulent posts off OgwaraOffice, every property must pass verification and a <b>listing fee{LISTING_FEE ? <> of {LISTING_FEE}</> : ''} must be paid before it goes live</b>. Submit the form below and you will be taken to WhatsApp to {LISTING_FEE ? 'pay the fee and agree' : 'confirm the fee and'} next steps with our team.</p>
        </div>

        <Field label="Landlord / Agent name" error={errors.name}><input className={inputCls} value={f.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" /></Field>
        <Field label="WhatsApp phone number" error={errors.phone}><input className={inputCls} type="tel" inputMode="tel" value={f.phone} onChange={(e) => set('phone', e.target.value)} placeholder="0802 123 4567" autoComplete="tel" /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Property category">
            <select className={inputCls} value={f.category} onChange={(e) => set('category', e.target.value)}>
              <option value="rent">For Rent</option><option value="sale">For Sale</option><option value="shortlet">Short Let</option>
            </select>
          </Field>
          <Field label="Area">
            <select className={inputCls} value={f.area} onChange={(e) => set('area', e.target.value)}>
              {AREAS.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Asking price (₦)" error={errors.price} hint="Per year for rent, per night for short let, total for sale.">
          <input className={inputCls} inputMode="numeric" value={f.price} onChange={(e) => set('price', e.target.value.replace(/[^\d,]/g, ''))} placeholder="e.g. 450,000" />
        </Field>
        <Field label="Description" error={errors.description}><textarea className={inputCls} rows={4} value={f.description} onChange={(e) => set('description', e.target.value)} placeholder="Type of property, street or landmark, light and water situation, anything a tenant should know." /></Field>

        <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal px-4 py-3.5 font-bold text-navy hover:brightness-95">
          <MessageCircle size={20} aria-hidden="true" /> Submit &amp; Pay Listing Fee on WhatsApp
        </button>
      </form>
    </Modal>
  )
}
