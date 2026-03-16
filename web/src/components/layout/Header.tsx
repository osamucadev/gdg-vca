import Link from 'next/link'

export function Header() {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: 'white',
        borderBottom: '0.5px solid rgba(0,0,0,0.08)',
      }}
    >
      <div
        style={{
          display: 'flex',
          height: '3px',
        }}
      >
        <div style={{ flex: 1, background: '#4285F4' }} />
        <div style={{ flex: 1, background: '#EA4335' }} />
        <div style={{ flex: 1, background: '#FBBC04' }} />
        <div style={{ flex: 1, background: '#34A853' }} />
      </div>
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '0 24px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link
          href="/"
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '2.5px',
              width: '20px',
            }}
          >
            <div
              style={{ width: '8px', height: '8px', background: '#4285F4', borderRadius: '2px' }}
            />
            <div
              style={{ width: '8px', height: '8px', background: '#EA4335', borderRadius: '2px' }}
            />
            <div
              style={{ width: '8px', height: '8px', background: '#FBBC04', borderRadius: '2px' }}
            />
            <div
              style={{ width: '8px', height: '8px', background: '#34A853', borderRadius: '2px' }}
            />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 500, color: '#1A1A1A', lineHeight: 1.2 }}>
              GDG Vitória da Conquista
            </div>
          </div>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {[
            { label: 'Eventos', href: '/eventos' },
            { label: 'Posts', href: '/posts' },
            { label: 'Comunidade', href: '/comunidade' },
            { label: 'Contato', href: '#contato' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                padding: '6px 12px',
                fontSize: '13px',
                color: '#5F6368',
                textDecoration: 'none',
                borderRadius: '6px',
                transition: 'background 0.1s, color 0.1s',
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
