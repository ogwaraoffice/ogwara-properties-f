import { useState } from 'react'
import { Field, Modal, inputCls } from './ui.jsx'
import { requireSupabase } from '../lib/supabase.js'

export default function AuthModal({ onAuth, onClose }) {
  const [mode, setMode] = useState('signin')
  const [f, setF] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }))
  const signup = mode === 'signup'

  const submit = async (e) => {
    e.preventDefault(); setError(''); setMessage('')
    if (signup && f.name.trim().length < 2) return setError('Enter your full name.')
    if (!/^\S+@\S+\.\S+$/.test(f.email)) return setError('Enter a valid email address.')
    if (f.password.length < 8) return setError('Password must be at least 8 characters.')
    setBusy(true)
    try {
      const client = requireSupabase()
      if (signup) {
        const { data, error: authError } = await client.auth.signUp({
          email: f.email.trim().toLowerCase(), password: f.password,
          options: { data: { full_name: f.name.trim() } },
        })
        if (authError) throw authError
        if (data.session) onAuth(data.session.user)
        else setMessage('Account created. Check your email to verify your address, then sign in.')
      } else {
        const { data, error: authError } = await client.auth.signInWithPassword({ email: f.email.trim().toLowerCase(), password: f.password })
        if (authError) throw authError
        onAuth(data.user)
      }
    } catch (err) { setError(err.message || 'Unable to complete your request.') }
    finally { setBusy(false) }
  }

  return (
    <Modal title={signup ? 'Create your customer account' : 'Sign in to Ogwara Properties'} onClose={onClose}>
      <div className="mb-4 grid grid-cols-2 rounded-xl bg-paper p-1 text-sm font-bold" role="tablist">
        {[['signin', 'Sign In'], ['signup', 'Sign Up']].map(([id, label]) => (
          <button key={id} role="tab" aria-selected={mode === id} onClick={() => { setMode(id); setError(''); setMessage('') }} className={`rounded-lg py-2.5 ${mode === id ? 'bg-navy text-white' : ''}`}>{label}</button>
        ))}
      </div>
      <form onSubmit={submit} className="space-y-4" noValidate>
        {signup && <Field label="Full name"><input className={inputCls} value={f.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" /></Field>}
        <Field label="Email address"><input className={inputCls} type="email" value={f.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" /></Field>
        <Field label="Password"><input className={inputCls} type="password" minLength={8} value={f.password} onChange={(e) => set('password', e.target.value)} autoComplete={signup ? 'new-password' : 'current-password'} /></Field>
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {message && <p role="status" className="rounded-lg bg-teal-tint p-3 text-sm text-navy">{message}</p>}
        <button disabled={busy} className="w-full rounded-xl bg-teal px-4 py-3.5 font-bold text-navy disabled:opacity-60">{busy ? 'Please wait…' : signup ? 'Create account' : 'Sign in'}</button>
      </form>
      <p className="mt-4 text-xs leading-relaxed text-navy/60">Customer accounts cannot publish properties or access administration. Property management is reserved for the verified Ogwara Properties administrator.</p>
    </Modal>
  )
}
