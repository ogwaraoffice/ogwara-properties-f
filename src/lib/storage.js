import { useEffect, useState } from 'react'

// localStorage can throw (private mode, blocked storage): never let it break the app.
export function load(key, fallback) {
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : fallback
  } catch { return fallback }
}
export function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* ignore */ }
}
export function usePersisted(key, initial) {
  const [value, setValue] = useState(() => load(key, initial))
  useEffect(() => { save(key, value) }, [key, value])
  return [value, setValue]
}
