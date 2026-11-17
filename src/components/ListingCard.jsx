import { memo } from 'react'
import { Bath, BedDouble, Droplets, GraduationCap, Heart, House, Landmark, MapPin, MessageCircle, Zap } from 'lucide-react'
import { AREAS, CATEGORY_LABEL } from '../data/listings.js'
import { priceLabel } from '../lib/format.js'
import { propertyEnquiryLink } from '../lib/whatsapp.js'
import { Stars, VerifiedBadge } from './ui.jsx'

export const areaName = (id) => AREAS.find((a) => a.id === id)?.name ?? id

const TONE = {
  rent: 'from-navy to-navy-soft',
  sale: 'from-[#0B4A63] to-[#0A6B6B]',
  shortlet: 'from-[#0A5A5A] to-teal-deep',
}

export const Chip = ({ icon: Icon, children, accent }) => (
  <span className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium ${accent ? 'bg-teal-tint text-teal-deep' : 'bg-paper text-navy'}`}>
    <Icon size={13} aria-hidden="true" className="shrink-0" /> {children}
  </span>
)

function ListingCard({ listing: l, saved, onToggleSave, onOpen, avgRating, reviewCount }) {
  const Icon = l.type === 'Land Plot' ? Landmark : House
  return (
    <article className="relative flex flex-col overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-sm">
      {/* Fixed aspect-ratio placeholder keeps layout stable (no photos = no network cost). */}
      <button onClick={() => onOpen(l.id)} className={`relative aspect-[16/9] w-full bg-gradient-to-br ${TONE[l.category]} text-white`} aria-label={`View details: ${l.title}`}>
        <span className="absolute left-3 top-3 z-[1] rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-navy">{CATEGORY_LABEL[l.category]}</span>
        {l.images?.[0]
          ? <img src={l.images[0]} alt={l.title} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
          : <span className="absolute inset-0 grid place-items-center opacity-90"><Icon size={52} strokeWidth={1.3} aria-hidden="true" /></span>}
        <span className="absolute bottom-3 left-3 z-[1] rounded bg-navy/60 px-1.5 py-0.5 text-xs font-medium text-white">{l.type} · {l.id}</span>
        {l.sample && <span className="absolute bottom-3 right-3 rounded bg-black/30 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">Sample</span>}
      </button>
      <button
        onClick={() => onToggleSave(l.id)} aria-pressed={saved} aria-label={saved ? 'Remove from saved' : 'Save listing'}
        className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white shadow"
      >
        <Heart size={20} className={saved ? 'fill-red-500 text-red-500' : 'text-navy'} aria-hidden="true" />
      </button>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          {l.verified && <div className="mb-2"><VerifiedBadge /></div>}
          <h3 className="text-base font-bold leading-snug">{l.title}</h3>
          <p className="mt-1 flex items-start gap-1 text-sm text-navy/70"><MapPin size={15} className="mt-0.5 shrink-0" aria-hidden="true" />{l.street}</p>
        </div>

        <p className="text-xl font-extrabold">{priceLabel(l)}</p>

        <div className="flex flex-wrap gap-1.5">
          {l.beds != null && <Chip icon={BedDouble}>{l.beds} bed{l.beds > 1 ? 's' : ''}</Chip>}
          {l.baths != null && <Chip icon={Bath}>{l.baths} bath{l.baths > 1 ? 's' : ''}</Chip>}
          {l.studentWalk != null && <Chip icon={GraduationCap} accent>Student friendly · {l.studentWalk} min walk to UNIBEN</Chip>}
          <Chip icon={Zap}>{l.power}</Chip>
          <Chip icon={Droplets}>{l.water}</Chip>
        </div>

        {reviewCount > 0 && (
          <div className="flex items-center gap-2 text-xs text-navy/70"><Stars value={avgRating} size={14} /> {avgRating.toFixed(1)} ({reviewCount} review{reviewCount > 1 ? 's' : ''})</div>
        )}

        <div className="mt-auto grid grid-cols-[1fr_auto] gap-2 pt-1">
          <a
            href={propertyEnquiryLink(l)} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal px-4 py-3 text-sm font-bold text-navy hover:brightness-95 active:scale-[.99]"
          ><MessageCircle size={18} aria-hidden="true" /> Chat on WhatsApp Now</a>
          <button onClick={() => onOpen(l.id)} className="rounded-xl border-2 border-navy px-4 py-3 text-sm font-bold hover:bg-navy hover:text-white">Details</button>
        </div>
      </div>
    </article>
  )
}

export default memo(ListingCard)
