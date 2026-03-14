interface BadgeProps {
  label: string
  variant?: 'blue' | 'red' | 'yellow' | 'green' | 'gray'
}

const variants = {
  blue: { background: 'var(--gdg-blue-bg)', color: 'var(--gdg-blue)' },
  red: { background: 'var(--gdg-red-bg)', color: 'var(--gdg-red)' },
  yellow: { background: 'var(--gdg-yellow-bg)', color: '#B06000' },
  green: { background: 'var(--gdg-green-bg)', color: 'var(--gdg-green)' },
  gray: { background: 'var(--bg-hover)', color: 'var(--text-secondary)' },
}

export function Badge({ label, variant = 'gray' }: BadgeProps) {
  const style = variants[variant]

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: 500,
        background: style.background,
        color: style.color,
        fontFamily: 'var(--font-sans)',
      }}
    >
      {label}
    </span>
  )
}
