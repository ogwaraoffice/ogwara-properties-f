import { Heart, LogOut, Mail, MessageCircle, Search, User, Phone } from 'lucide-react'
import { CALL_DISPLAY, CALL_NUMBER, EMAIL, TAGLINE, WHATSAPP_DISPLAY, waNumberLink } from '../data/listings.js'

export function Logo({ light = true }) {
  return (
    <span className="flex items-center gap-2.5">
      <img src="/ogwara-properties-logo.png" alt="" className="h-10 w-14 rounded-md bg-white object-contain" />
      <span className="leading-none">
        <span className={`block text-lg font-extrabold tracking-tight ${light ? 'text-white' : 'text-navy'}`}>Ogwara Properties</span>
        <span className={`hidden text-[10px] font-medium sm:block ${light ? 'text-white/70' : 'text-navy/60'}`}>{TAGLINE}</span>
      </span>
    </span>
  )
}

export function Header({ view, setView, savedCount, user, onSignIn, onSignOut, onList, isAdmin, onAdmin }) {
  return (
    <header className="sticky top-0 z-40 bg-navy text-white shadow-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <button onClick={() => setView('browse')} aria-label="OgwaraOffice home"><Logo /></button>
        <nav className="flex items-center gap-1.5 sm:gap-2" aria-label="Main">
          <button onClick={() => setView('saved')} className={`relative hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold hover:bg-white/10 sm:flex ${view === 'saved' ? 'bg-white/10' : ''}`}>
            <Heart size={18} aria-hidden="true" />Saved{savedCount > 0 && <span className="rounded-full bg-teal px-1.5 text-xs font-bold text-navy">{savedCount}</span>}
          </button>
          <a href={waNumberLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-teal px-3 py-2 text-sm font-bold text-navy hover:brightness-95">
            <MessageCircle size={18} aria-hidden="true" /><span>Contact Us</span>
          </a>
          {isAdmin && <button onClick={onAdmin} className="rounded-lg border border-teal px-3 py-2 text-sm font-bold text-teal">Admin</button>}
          {user ? (
            <button onClick={onSignOut} className="inline-flex items-center gap-1.5 rounded-lg border border-white/30 px-3 py-2 text-sm font-semibold hover:bg-white/10" aria-label={`Sign out ${user.name}`}>
              <LogOut size={17} aria-hidden="true" /><span className="hidden max-w-[7rem] truncate sm:inline">{user.name}</span>
            </button>
          ) : (
            <button onClick={onSignIn} className="inline-flex items-center gap-1.5 rounded-lg border border-white/30 px-3 py-2 text-sm font-semibold hover:bg-white/10">
              <User size={17} aria-hidden="true" />Sign in
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}

export function BottomNav({ view, setView, savedCount, onList, onAccount, user }) {
  const item = (active) => `flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-semibold ${active ? 'text-teal-deep' : 'text-navy/70'}`
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-navy/10 bg-white pb-[env(safe-area-inset-bottom)] sm:hidden" aria-label="Mobile">
      <button className={item(view === 'browse')} onClick={() => { setView('browse'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}><Search size={22} aria-hidden="true" />Browse</button>
      <button className={item(view === 'saved')} onClick={() => setView('saved')}>
        <span className="relative"><Heart size={22} aria-hidden="true" />{savedCount > 0 && <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-teal px-1 text-[10px] font-bold text-navy">{savedCount}</span>}</span>Saved
      </button>
      <a className={item(false)} href={waNumberLink} target="_blank" rel="noopener noreferrer"><MessageCircle size={22} aria-hidden="true" />Contact</a>
      <button className={item(false)} onClick={onAccount}><User size={22} aria-hidden="true" />{user ? 'Account' : 'Sign in'}</button>
    </nav>
  )
}

export function Footer() {
  return (
    <footer className="mt-12 bg-navy pb-24 text-white sm:pb-10">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-3 text-sm text-white/70">Find homes, land, rentals and short lets in Benin City with Ogwara Properties.</p>
        </div>
        <div>
          <h2 className="font-bold">Talk to us</h2>
          <a className="mt-3 flex items-center gap-2 text-sm text-white/85 hover:text-teal" href={waNumberLink} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} aria-hidden="true" />WhatsApp {WHATSAPP_DISPLAY}</a>
          <a className="mt-2 flex items-center gap-2 text-sm text-white/85 hover:text-teal" href={`tel:${CALL_NUMBER}`}><Phone size={16} aria-hidden="true" />Call {CALL_DISPLAY}</a>
          <a className="mt-2 flex items-center gap-2 text-sm text-white/85 hover:text-teal" href={`mailto:${EMAIL}`}><Mail size={16} aria-hidden="true" />{EMAIL}</a>
        </div>
        <div>
          <h2 className="font-bold">Partnerships &amp; legal</h2>
          <p className="mt-3 text-sm text-white/70">Institutional partnerships, legal enquiries and sponsorship: email <a className="font-semibold text-teal underline" href={`mailto:${EMAIL}?subject=OgwaraOffice%20Partnership%20Enquiry`}>{EMAIL}</a>.</p>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/50">© {new Date().getFullYear()} OgwaraOffice · {TAGLINE}</div>
    </footer>
  )
}
