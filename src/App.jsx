import { lazy, Suspense, useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react'
import { Heart, Info, MapPin, Search, SearchX, X } from 'lucide-react'
import { AREAS, CATEGORIES, TAGLINE, waNumberLink } from './data/listings.js'
import { average, budgetFromT, budgetLabel } from './lib/format.js'
import { usePersisted } from './lib/storage.js'
import ListingCard, { areaName } from './components/ListingCard.jsx'
import { BottomNav, Footer, Header } from './components/Layout.jsx'
import { supabase, supabaseConfigured } from './lib/supabase.js'

// Modals are code-split so first paint stays light on 3G/4G.
const ListingModal = lazy(() => import('./components/ListingModal.jsx'))
const AuthModal = lazy(() => import('./components/AuthModal.jsx'))
const AdminDashboard = lazy(() => import('./components/AdminDashboard.jsx'))

const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

export default function App() {
  const [listings, setListings] = useState([])
  const [view, setView] = useState('browse') // browse | saved
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('all')
  const [area, setArea] = useState('all')
  const [budgetT, setBudgetT] = useState(100)
  const [openId, setOpenId] = useState(null)
  const [modal, setModal] = useState(null) // auth
  const [toast, setToast] = useState('')
  const [bannerOff, setBannerOff] = useState(false)

  const [saved, setSaved] = usePersisted('og.saved', [])
  const [reviews, setReviews] = usePersisted('og.reviews', {})
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (!supabase) return
    supabase.from('properties').select('*').eq('published', true).order('created_at', { ascending: false })
      .then(({ data, error }) => { if (!error && data) setListings(data.map((p) => ({ ...p, id: p.id, type: p.property_type, beds: p.bedrooms, baths: p.bathrooms, studentWalk: p.student_walk, images: p.images || [], landmarks: p.landmarks || [] }))) })
  }, [])

  useEffect(() => {
    if (!supabase) { setAuthReady(true); return }
    supabase.auth.getSession().then(({ data }) => { setUser(data.session?.user ? { ...data.session.user, name: data.session.user.user_metadata?.full_name || data.session.user.email } : null); setAuthReady(true) })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ? { ...session.user, name: session.user.user_metadata?.full_name || session.user.email } : null))
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    let active = true
    if (!supabase || !user?.id) { setIsAdmin(false); return }
    supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
      .then(({ data }) => { if (active) setIsAdmin(data?.role === 'admin') })
    return () => { active = false }
  }, [user?.id])

  const dq = useDeferredValue(q)
  const nightMode = category === 'shortlet'
  const mode = nightMode ? 'night' : 'long'
  const budget = budgetFromT(budgetT, mode)

  const notify = useCallback((msg) => { setToast(msg); setTimeout(() => setToast(''), 3200) }, [])

  const results = useMemo(() => {
    const terms = norm(dq).split(/\s+/).filter(Boolean)
    return listings.filter((l) => {
      if (category !== 'all' && l.category !== category) return false
      if (area !== 'all' && l.area !== area) return false
      // Short lets are priced per night, so the yearly/sale slider only applies to the other categories.
      if (budget !== Infinity && (category === 'all' ? l.category !== 'shortlet' : true) && l.price > budget) return false
      if (!terms.length) return true
      const hay = norm([l.title, l.street, l.type, l.id, l.description, areaName(l.area), ...(l.landmarks || [])].join(' '))
      return terms.every((t) => hay.includes(t))
    })
  }, [dq, category, area, budget, listings])

  const savedListings = useMemo(() => listings.filter((l) => saved.includes(l.id)), [saved, listings])
  const toggleSave = useCallback((id) => {
    setSaved((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  }, [setSaved])
  const addReview = (id, review) => {
    setReviews((r) => ({ ...r, [id]: [review, ...(r[id] || [])] }))
    notify('Thanks, your review has been posted.')
  }
  const rating = (id) => { const rs = reviews[id] || []; return [average(rs.map((r) => r.rating)), rs.length] }

  const openListing = useCallback((id) => setOpenId(id), [])
  const active = listings.find((l) => l.id === openId)
  const shown = view === 'saved' ? savedListings : results
  const hasSample = false

  const clearFilters = () => { setQ(''); setCategory('all'); setArea('all'); setBudgetT(100) }
  const filtersActive = q || category !== 'all' || area !== 'all' || budgetT < 100
  const pickCategory = (id) => { setCategory(id); setBudgetT(100) }

  return (
    <div className="min-h-dvh pb-16 sm:pb-0">
      <Header
        view={view} setView={setView} savedCount={saved.length} user={user}
        onSignIn={() => setModal('auth')} onSignOut={async () => { await supabase?.auth.signOut(); setUser(null); notify('You have been signed out.') }} onList={() => window.open(waNumberLink, '_blank', 'noopener')} isAdmin={isAdmin} onAdmin={() => setModal('admin')}
      />

      {hasSample && !bannerOff && (
        <div className="bg-amber-100 text-amber-950">
          <div className="mx-auto flex max-w-6xl items-start gap-2 px-4 py-2 text-xs sm:text-sm">
            <Info size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
            <p className="flex-1"><b>Demo data:</b> these listings are placeholders. Replace <code>src/data/listings.js</code> with real, verified listings before launch.</p>
            <button onClick={() => setBannerOff(true)} aria-label="Dismiss" className="p-0.5"><X size={16} /></button>
          </div>
        </div>
      )}

      {!supabaseConfigured && (
        <div className="bg-amber-100 px-4 py-2 text-center text-xs font-semibold text-amber-950">Account services are being configured. Registration and sign-in will be available before launch.</div>
      )}

      {/* Hero search */}
      <section className="bg-navy text-white" aria-label="Search properties">
        <div className="mx-auto max-w-6xl px-4 pb-7 pt-6 sm:pb-10 sm:pt-10">
          <h1 className="max-w-2xl text-[1.65rem] font-extrabold leading-tight sm:text-4xl">Find your next home in <span className="text-teal">Benin City</span></h1>
          <p className="mt-2 max-w-xl text-sm text-white/75 sm:text-base">Houses, land and short lets from GRA to Ekosodin. {TAGLINE}.</p>

          <div className="mt-5 grid gap-3 lg:grid-cols-[1.4fr_1fr]">
            <div className="relative">
              <Search size={20} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-navy/50" aria-hidden="true" />
              <input
                type="search" value={q} onChange={(e) => { setQ(e.target.value); setView('browse') }}
                placeholder="Search street, landmark (Ihama, UNIBEN Gate, UBTH) or title"
                aria-label="Search properties" enterKeyHint="search"
                className="w-full rounded-xl bg-white py-3.5 pl-11 pr-3 text-base text-navy placeholder:text-navy/45 focus:outline-2 focus:outline-teal"
              />
            </div>
            <div className="relative">
              <MapPin size={20} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-navy/50" aria-hidden="true" />
              <select value={area} onChange={(e) => { setArea(e.target.value); setView('browse') }} aria-label="Area" className="w-full appearance-none rounded-xl bg-white py-3.5 pl-11 pr-3 text-base text-navy focus:outline-2 focus:outline-teal">
                <option value="all">All Benin City areas</option>
                {AREAS.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Category">
            {CATEGORIES.map((c) => (
              <button key={c.id} role="tab" aria-selected={category === c.id} onClick={() => { pickCategory(c.id); setView('browse') }}
                className={`shrink-0 rounded-full border-2 px-5 py-2 text-sm font-bold ${category === c.id ? 'border-teal bg-teal text-navy' : 'border-white/30 text-white hover:border-white/60'}`}>{c.label}</button>
            ))}
          </div>

          <div className="mt-5 max-w-xl">
            <div className="mb-2 flex items-baseline justify-between text-sm">
              <label htmlFor="budget" className="font-semibold">Budget <span className="font-normal text-white/60">({nightMode ? 'per night' : 'per year / sale price'})</span></label>
              <output htmlFor="budget" className="font-bold text-teal">{budgetLabel(budgetT, mode)}</output>
            </div>
            <input id="budget" className="budget" type="range" min="0" max="100" step="1" value={budgetT} style={{ '--fill': `${budgetT}%` }}
              onChange={(e) => { setBudgetT(+e.target.value); setView('browse') }} aria-valuetext={budgetLabel(budgetT, mode)} />
            <div className="mt-1.5 flex justify-between text-[11px] text-white/55"><span>{nightMode ? '₦10k' : '₦150k'}</span><span>{nightMode ? '₦200k+' : '₦50M+'}</span></div>
          </div>
        </div>
      </section>

      <main id="listings" className="mx-auto max-w-6xl px-4 pt-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-extrabold">
            {view === 'saved' ? <span className="inline-flex items-center gap-2"><Heart size={22} className="fill-red-500 text-red-500" aria-hidden="true" /> Saved Wishlist</span> : 'Available properties'}
            <span className="ml-2 text-sm font-medium text-navy/60" aria-live="polite">{shown.length} {shown.length === 1 ? 'result' : 'results'}</span>
          </h2>
          <div className="flex gap-2">
            {view === 'saved' && <button onClick={() => setView('browse')} className="rounded-lg border-2 border-navy px-3 py-1.5 text-sm font-bold">Back to search</button>}
            {view === 'browse' && filtersActive && <button onClick={clearFilters} className="inline-flex items-center gap-1 rounded-lg border-2 border-navy px-3 py-1.5 text-sm font-bold"><X size={14} aria-hidden="true" /> Clear filters</button>}
          </div>
        </div>

        {shown.length === 0 ? (
          <div className="grid place-items-center rounded-2xl border border-dashed border-navy/25 bg-white px-6 py-14 text-center">
            {view === 'saved' ? <Heart size={40} className="text-navy/30" aria-hidden="true" /> : <SearchX size={40} className="text-navy/30" aria-hidden="true" />}
            <p className="mt-3 font-bold">{view === 'saved' ? 'No saved properties yet' : listings.length === 0 ? 'New verified listings are being added' : 'No properties match your search'}</p>
            <p className="mt-1 max-w-sm text-sm text-navy/65">{view === 'saved' ? 'Tap the heart on any property to keep it here.' : listings.length === 0 ? 'Tell us what you are looking for on WhatsApp and we will find it for you.' : 'Try another area or landmark, or raise your budget.'}</p>
            {view !== 'saved' && listings.length === 0
              ? <a href={waNumberLink} target="_blank" rel="noopener noreferrer" className="mt-4 rounded-xl bg-teal px-5 py-2.5 font-bold text-navy">Chat on WhatsApp Now</a>
              : <button onClick={view === 'saved' ? () => setView('browse') : clearFilters} className="mt-4 rounded-xl bg-teal px-5 py-2.5 font-bold text-navy">{view === 'saved' ? 'Browse properties' : 'Clear filters'}</button>}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((l) => {
              const [avg, count] = rating(l.id)
              return <ListingCard key={l.id} listing={l} saved={saved.includes(l.id)} onToggleSave={toggleSave} onOpen={openListing} avgRating={avg} reviewCount={count} />
            })}
          </div>
        )}

        <section className="mt-10 rounded-2xl bg-navy p-6 text-white sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div>
            <h2 className="text-xl font-extrabold">Looking for a property in Benin City?</h2>
            <p className="mt-1 max-w-xl text-sm text-white/75">Tell us what you need. We can help you enquire about available homes, land and short lets.</p>
          </div>
          <a href={waNumberLink} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex w-full shrink-0 justify-center rounded-xl bg-teal px-6 py-3 font-bold text-navy hover:brightness-95 sm:mt-0 sm:w-auto">Chat with Ogwara Properties</a>
        </section>
      </main>

      <Footer />
      <BottomNav view={view} setView={setView} savedCount={saved.length} user={user} onList={() => window.open(waNumberLink, '_blank', 'noopener')}
        onAccount={async () => (user ? (await supabase?.auth.signOut(), setUser(null), notify('You have been signed out.')) : setModal('auth'))} />

      {toast && <div role="status" className="fixed bottom-20 left-1/2 z-[60] -translate-x-1/2 rounded-xl bg-navy px-4 py-3 text-sm font-semibold text-white shadow-lg sm:bottom-6">{toast}</div>}

      <Suspense fallback={null}>
        {active && (
          <ListingModal listing={active} reviews={reviews[active.id] || []} saved={saved.includes(active.id)} user={user}
            onToggleSave={toggleSave} onAddReview={addReview} onClose={() => setOpenId(null)} />
        )}
        {modal === 'admin' && isAdmin && <AdminDashboard onClose={() => setModal(null)} onSaved={() => { supabase?.from('properties').select('*').eq('published', true).order('created_at', { ascending: false }).then(({ data }) => { if (data) setListings(data.map((p) => ({ ...p, id: p.id, type: p.property_type, beds: p.bedrooms, baths: p.bathrooms, studentWalk: p.student_walk, images: p.images || [], landmarks: p.landmarks || [] }))) }) }} />}
        {modal === 'auth' && (
          <AuthModal onClose={() => setModal(null)} onAuth={(u) => { setUser({ ...u, name: u.user_metadata?.full_name || u.email }); setModal(null); notify(`Welcome, ${u.user_metadata?.full_name || u.email}!`) }} />
        )}
      </Suspense>
    </div>
  )
}
