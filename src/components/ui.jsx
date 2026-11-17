
import { useEffect, useRef } from 'react'
import { BadgeCheck, Star, X } from 'lucide-react'

export function Stars({ value = 0, onChange, size = 18, label }) {
  const interactive = typeof onChange === 'function'
  return (
    <div className="inline-flex items-center gap-0.5" role={interactive ? 'radiogroup' : 'img'} aria-label={label || `${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= Math.round(value)
        const icon = (
          <Star size={size} className={filled ? 'fill-teal text-teal' : 'text-navy/25'} aria-hidden="true" />
        )
        return interactive ? (
          <button
            key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n} star${n > 1 ? 's' : ''}`}
            onClick={() => onChange(n)} className="p-1 -m-0.5 rounded focus-visible:outline-2 focus-visible:outline-teal"
          >{icon}</button>
        ) : <span key={n}>{icon}</span>
      })}
    </div>
  )
}

export function Modal({ title, onClose, children, wide = false }) {
  const ref = useRef(null)
  useEffect(() => {
    const prevFocus = document.activeElement
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    ref.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      prevFocus?.focus?.()
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-navy/70" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title}
        className={`sheet bg-white w-full ${wide ? 'sm:max-w-3xl' : 'sm:max-w-lg'} max-h-[92dvh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-2xl outline-none`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-white/95 backdrop-blur px-5 py-3 border-b border-navy/10">
          <h2 className="font-bold text-lg leading-tight">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="p-2 -mr-2 rounded-full hover:bg-navy/5"><X size={22} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

export const inputCls =
  'w-full rounded-xl border border-navy/20 bg-white px-3.5 py-3 text-base placeholder:text-navy/40 focus:border-teal focus:outline-2 focus:outline-teal'

export function Field({ label, error, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-navy/60">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-medium text-red-700" role="alert">{error}</span>}
    </label>
  )
}

export function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-teal-tint border border-teal px-2.5 py-1 text-[11px] font-bold tracking-wide text-teal-deep">
      <BadgeCheck size={14} aria-hidden="true" /> VERIFIED BY OGWARAOFFICE
    </span>
  )
}
