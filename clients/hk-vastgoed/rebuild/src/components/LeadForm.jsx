import { useState } from 'react'
import { Link } from 'react-router-dom'
import FormField from './FormField.jsx'
import { services } from '../data/services.js'

// -----------------------------------------------------------------------------
// FRONTEND-ONLY lead form (contact + quotation share this component).
//
// ⚠️ BACKEND INTEGRATION PENDING: on submit this validates required fields and
// shows a success state, but it does NOT send data anywhere. There is no API,
// email service or storage yet. Wire `submitLead()` to a Django endpoint (or a
// form service) before launch. Until then, no user data leaves the browser.
// -----------------------------------------------------------------------------

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(values, { requireService }) {
  const errors = {}
  if (!values.name.trim()) errors.name = 'Vul uw naam in.'
  if (!values.email.trim()) errors.email = 'Vul uw e-mailadres in.'
  else if (!EMAIL_RE.test(values.email)) errors.email = 'Vul een geldig e-mailadres in.'
  if (!values.phone.trim()) errors.phone = 'Vul uw telefoonnummer in.'
  if (requireService && !values.service) errors.service = 'Kies een dienst.'
  if (!values.message.trim()) errors.message = 'Vul uw bericht of aanvraag in.'
  return errors
}

const EMPTY = { name: '', email: '', phone: '', service: '', message: '' }

export default function LeadForm({ variant = 'contact' }) {
  const requireService = variant === 'quote'
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const onChange = (e) => {
    const { name, value } = e.target
    setValues((v) => ({ ...v, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const onSubmit = (e) => {
    e.preventDefault()
    const found = validate(values, { requireService })
    setErrors(found)
    if (Object.keys(found).length > 0) return

    // NOTE: no network call — backend integration is pending (see header).
    // A real implementation would POST `values` here.
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-brand-200 bg-brand-50 p-8 text-center" role="status">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-white">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-ink">Bedankt voor uw aanvraag!</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
          We hebben uw gegevens ontvangen en nemen zo snel mogelijk contact met u op — doorgaans
          binnen 24 uur. Heeft u haast of gaat het om spoed? Bel ons gerust direct.
        </p>
        <button
          type="button"
          onClick={() => {
            setValues(EMPTY)
            setSubmitted(false)
          }}
          className="btn-secondary mt-6"
        >
          Nog een aanvraag versturen
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Naam" name="name" required value={values.name} onChange={onChange} error={errors.name} autoComplete="name" />
        <FormField label="Telefoonnummer" name="phone" type="tel" required value={values.phone} onChange={onChange} error={errors.phone} autoComplete="tel" />
      </div>
      <FormField label="E-mailadres" name="email" type="email" required value={values.email} onChange={onChange} error={errors.email} autoComplete="email" />

      {requireService && (
        <FormField
          label="Waarvoor vraagt u een offerte aan?"
          name="service"
          as="select"
          required
          value={values.service}
          onChange={onChange}
          error={errors.service}
          options={[
            { value: '', label: 'Kies een dienst…' },
            ...services.map((s) => ({ value: s.slug, label: s.title })),
            { value: 'anders', label: 'Anders / weet ik nog niet' },
          ]}
        />
      )}

      <FormField
        label={requireService ? 'Omschrijving van uw situatie' : 'Uw bericht'}
        name="message"
        as="textarea"
        required
        value={values.message}
        onChange={onChange}
        error={errors.message}
        placeholder={
          requireService
            ? 'Beschrijf kort het type dak, het probleem of de gewenste werkzaamheden…'
            : 'Waarmee kunnen we u helpen?'
        }
      />

      <button type="submit" className="btn-primary w-full sm:w-auto">
        {requireService ? 'Offerte aanvragen' : 'Verstuur bericht'}
      </button>
      <p className="text-xs text-slate-500">
        Door te versturen gaat u akkoord met ons{' '}
        <Link to="/privacybeleid" className="underline hover:text-brand-700">privacybeleid</Link>. Uw
        gegevens worden uitsluitend gebruikt om uw aanvraag te behandelen.
      </p>
    </form>
  )
}
