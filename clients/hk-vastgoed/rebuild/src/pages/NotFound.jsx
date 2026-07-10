import { Link } from 'react-router-dom'
import Seo from '../components/Seo.jsx'
import Button from '../components/Button.jsx'
import { company } from '../data/company.js'
import { services } from '../data/services.js'

export default function NotFound() {
  return (
    <>
      <Seo
        title="Pagina niet gevonden (404)"
        description="Deze pagina bestaat niet of is verplaatst. Ga terug naar de homepage of bekijk onze diensten."
      />
      <section className="container-content flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <p className="text-7xl font-extrabold text-brand-200">404</p>
        <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Deze pagina bestaat niet</h1>
        <p className="mt-4 max-w-md text-ink-muted">
          De pagina die u zoekt is verplaatst of bestaat niet meer. Gebruik onderstaande links of
          bel ons gerust op{' '}
          <a href={company.phone.href} className="font-semibold text-brand-700 hover:underline">
            {company.phone.display}
          </a>
          .
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button to="/">Terug naar home</Button>
          <Button to="/diensten" variant="secondary">Bekijk onze diensten</Button>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {services.slice(0, 6).map((s) => (
            <Link
              key={s.slug}
              to={`/diensten/${s.slug}`}
              className="rounded-full border border-slate-200 px-3 py-1.5 text-sm text-ink-muted hover:border-brand-300 hover:text-brand-700"
            >
              {s.title}
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
