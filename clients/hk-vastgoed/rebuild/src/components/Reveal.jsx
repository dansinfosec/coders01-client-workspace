import { useReveal } from '../hooks/useReveal.js'

// Wraps children in a scroll-reveal container. `delay` staggers grouped items
// (e.g. cards). Reduced-motion users see content immediately (handled in CSS).
export default function Reveal({ children, delay = 0, as: Tag = 'div', className = '', ...rest }) {
  const { ref, visible } = useReveal()
  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`.trim()}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  )
}
