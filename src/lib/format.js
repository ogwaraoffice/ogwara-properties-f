export const naira = (n) => '₦' + Math.round(n).toLocaleString('en-NG')

export const nairaCompact = (n) => {
  if (n >= 1e6) return '₦' + (n / 1e6).toFixed(n % 1e6 === 0 ? 0 : 1).replace(/\.0$/, '') + 'M'
  if (n >= 1e3) return '₦' + Math.round(n / 1e3) + 'k'
  return '₦' + n
}

export const priceLabel = (l) =>
  naira(l.price) + (l.period === 'year' ? ' / year' : l.period === 'night' ? ' / night' : '')

// Budget slider: t in [0,100] on a log scale between min and max. t===100 means "no upper limit".
export const SLIDER_RANGES = {
  long: { min: 150000, max: 50000000, unit: 'per year / sale price' },
  night: { min: 10000, max: 200000, unit: 'per night' },
}
export const budgetFromT = (t, mode = 'long') => {
  if (t >= 100) return Infinity
  const { min, max } = SLIDER_RANGES[mode]
  const raw = min * Math.pow(max / min, t / 100)
  const step = raw < 1e6 ? 50000 : raw < 1e7 ? 250000 : 1000000
  const small = mode === 'night' ? 5000 : step
  return Math.max(min, Math.round(raw / small) * small)
}
export const budgetLabel = (t, mode = 'long') => {
  const b = budgetFromT(t, mode)
  const { max } = SLIDER_RANGES[mode]
  return b === Infinity ? nairaCompact(max) + '+' : 'Up to ' + nairaCompact(b)
}

export const average = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0)
