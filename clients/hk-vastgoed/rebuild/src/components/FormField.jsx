// Reusable, accessible form field (input / textarea / select).
export default function FormField({
  label,
  name,
  type = 'text',
  as = 'input',
  required = false,
  error,
  options = [],
  ...rest
}) {
  const id = `field-${name}`
  const base =
    'w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-ink shadow-sm transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-200'
  const border = error ? 'border-red-400' : 'border-slate-300'

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label} {required && <span className="text-red-500" aria-hidden="true">*</span>}
      </label>

      {as === 'textarea' ? (
        <textarea id={id} name={name} rows={5} className={`${base} ${border}`} aria-invalid={!!error} {...rest} />
      ) : as === 'select' ? (
        <select id={id} name={name} className={`${base} ${border}`} aria-invalid={!!error} {...rest}>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input id={id} name={name} type={type} className={`${base} ${border}`} aria-invalid={!!error} {...rest} />
      )}

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
