import { Link } from 'react-router-dom'

// Reusable button that renders as a router <Link>, an <a> (external / tel /
// mailto), or a <button>, while sharing one visual style set.
const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
}

export default function Button({ to, href, variant = 'primary', children, className = '', ...rest }) {
  const cls = `${variants[variant] || variants.primary} ${className}`.trim()

  if (to) {
    return (
      <Link to={to} className={cls} {...rest}>
        {children}
      </Link>
    )
  }
  if (href) {
    return (
      <a href={href} className={cls} {...rest}>
        {children}
      </a>
    )
  }
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  )
}
