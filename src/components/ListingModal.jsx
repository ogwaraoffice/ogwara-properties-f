import { useState } from 'react'
import { Bath, BedDouble, Droplets, GraduationCap, Handshake, Heart, MapPin, MessageCircle, Route, Zap, Lightbulb } from 'lucide-react'
import { CATEGORY_LABEL, REVIEW_ASPECTS } from '../data/listings.js'
import { average, priceLabel } from '../lib/format.js'
import { propertyEnquiryLink } from '../lib/whatsapp.js'
import { areaName, Chip } from './ListingCard.jsx'
import { Field, Modal, Stars, VerifiedBadge, inputCls } from './ui.jsx'

const ASPECT_ICON = { light: Lightbulb, water: Droplets, road: Route, landlord: Handshake }

export default function ListingModal({ listing: l, reviews, saved, onToggleSave, onAddReview, onClose, user }) {
  const [form, setForm] = useState({ name: user?.name || '', rating: 0, light: 0, water: 0, road: 0, landlord: 0, text: '' })
  const [error, setError] = useState('')
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const overall = average(reviews.map((r) => r.rating))
  const aspectAvg = (id) => average(reviews.map((r) => r[id]).filter(Boolean))

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return setError('Please enter your name.')
    if (!form.rating) return setError('Please choose an overall star rating.')
    if (form.text.trim().length < 10) return setError('Please write at least a short sentence about your experience.')
    onAddReview(l.id, { ...form, name: form.name.trim(), text: form.text.trim(), date: new Date().toISOString() })
    setForm((f) => ({ ...f, rating: 0, light: 0, water: 0, road: 0, landlord: 0, text: '' }))
    setError('')
  }

  return (
    <Modal title={l.title} onClose={onClose} wide>
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-navy px-2.5 py-1 text-[11px] font-bold text-white">{CATEGORY_LABEL[l.category]}</span>
            {l.verified && <VerifiedBadge />}
            <span className="text-xs text-navy/60">{l.type} · ID {l.id}</span>
          </div>
          <p className="flex items-start gap-1 text-sm text-navy/70"><MapPin size={15} className="mt-0.5 shrink-0" aria-hidden="true" />{l.street}, {areaName(l.area)}</p>
          {l.landmarks?.length > 0 && <p className="text-sm text-navy/70">Landmarks: {l.landmarks.join(', ')}</p>}
          <p className="text-3xl font-extrabold">{priceLabel(l)}</p>
        </div>

        {(l.images?.length > 0 || l.video) && (
          <div className="space-y-2">
            {l.video && <video src={l.video} poster={l.images?.[0]} controls playsInline preload="none" className="aspect-video w-full rounded-xl bg-navy" />}
            {l.images?.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {l.images.map((src, i) => <img key={src} src={src} alt={`${l.title}, photo ${i + 1}`} loading="lazy" decoding="async" className={`aspect-[4/3] w-full rounded-xl object-cover ${i === 0 && !l.video ? 'col-span-2 aspect-[16/9]' : ''}`} />)}
              </div>
            )}
          </div>
        )}

        <p className="leading-relaxed">{l.description}</p>

        <div className="flex flex-wrap gap-2">
          {l.beds != null && <Chip icon={BedDouble}>{l.beds} bed{l.beds > 1 ? 's' : ''}</Chip>}
          {l.baths != null && <Chip icon={Bath}>{l.baths} bath{l.baths > 1 ? 's' : ''}</Chip>}
          {l.studentWalk != null && <Chip icon={GraduationCap} accent>Student friendly · {l.studentWalk} min walk to UNIBEN</Chip>}
        </div>

        <dl className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-paper p-3"><dt className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-navy/60"><Zap size={14} aria-hidden="true" /> Power supply</dt><dd className="mt-1 font-semibold">{l.power}</dd></div>
          <div className="rounded-xl bg-paper p-3"><dt className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-navy/60"><Droplets size={14} aria-hidden="true" /> Water supply</dt><dd className="mt-1 font-semibold">{l.water}</dd></div>
        </dl>

        <div className="grid grid-cols-[1fr_auto] gap-2">
          <a href={propertyEnquiryLink(l)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal px-4 py-3.5 font-bold text-navy hover:brightness-95">
            <MessageCircle size={20} aria-hidden="true" /> Chat on WhatsApp Now
          </a>
          <button onClick={() => onToggleSave(l.id)} aria-pressed={saved} className="inline-flex items-center gap-2 rounded-xl border-2 border-navy px-4 py-3.5 font-bold">
            <Heart size={18} className={saved ? 'fill-red-500 text-red-500' : ''} aria-hidden="true" /> <span className="hidden sm:inline">{saved ? 'Saved' : 'Save'}</span>
          </button>
        </div>

        <section aria-labelledby="reviews-h" className="border-t border-navy/10 pt-5">
          <h3 id="reviews-h" className="text-lg font-bold">Resident &amp; tenant reviews</h3>
          {reviews.length === 0 ? (
            <p className="mt-2 rounded-xl bg-paper p-4 text-sm text-navy/70">No reviews yet. If you have lived here or visited, be the first to share your experience.</p>
          ) : (
            <>
              <div className="mt-2 flex items-center gap-2"><Stars value={overall} /><span className="font-bold">{overall.toFixed(1)}</span><span className="text-sm text-navy/60">from {reviews.length} review{reviews.length > 1 ? 's' : ''}</span></div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {REVIEW_ASPECTS.map((a) => {
                  const v = aspectAvg(a.id); const I = ASPECT_ICON[a.id]
                  return (
                    <div key={a.id} className="flex items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2 text-sm">
                      <span className="flex items-center gap-1.5 font-medium"><I size={15} aria-hidden="true" />{a.label}</span>
                      {v ? <span className="flex items-center gap-1.5"><Stars value={v} size={13} /><b>{v.toFixed(1)}</b></span> : <span className="text-navy/50">n/a</span>}
                    </div>
                  )
                })}
              </div>
              <ul className="mt-4 space-y-3">
                {reviews.map((r, i) => (
                  <li key={i} className="rounded-xl border border-navy/10 p-3">
                    <div className="flex items-center justify-between gap-2"><b>{r.name}</b><Stars value={r.rating} size={14} /></div>
                    <p className="mt-1 text-sm leading-relaxed">{r.text}</p>
                    <p className="mt-1 text-xs text-navy/50">{new Date(r.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </li>
                ))}
              </ul>
            </>
          )}

          <form onSubmit={submit} className="mt-5 space-y-4 rounded-2xl bg-paper p-4" noValidate>
            <h4 className="font-bold">Write a review</h4>
            <Field label="Your name"><input className={inputCls} value={form.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" /></Field>
            <div><span className="mb-1 block text-sm font-semibold">Overall rating</span><Stars value={form.rating} onChange={(n) => set('rating', n)} size={28} /></div>
            <div className="grid gap-3 sm:grid-cols-2">
              {REVIEW_ASPECTS.map((a) => (
                <div key={a.id}><span className="mb-0.5 block text-sm font-medium">{a.label} <span className="text-navy/50">(optional)</span></span><Stars value={form[a.id]} onChange={(n) => set(a.id, n)} size={22} label={a.label} /></div>
              ))}
            </div>
            <Field label="Your feedback"><textarea className={inputCls} rows={3} value={form.text} onChange={(e) => set('text', e.target.value)} placeholder="How are light, water, the road and the landlord?" /></Field>
            {error && <p className="text-sm font-medium text-red-700" role="alert">{error}</p>}
            <button className="w-full rounded-xl bg-navy px-4 py-3 font-bold text-white hover:bg-navy-soft">Post review</button>
          </form>
        </section>
      </div>
    </Modal>
  )
}
