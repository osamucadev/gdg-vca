import Link from 'next/link'

export function Footer() {
  return (
    <footer
      style={{
        borderTop: '0.5px solid rgba(0,0,0,0.08)',
        background: '#F8F9FA',
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '40px 24px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '32px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
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
            <span style={{ fontSize: '13px', fontWeight: 500, color: '#1A1A1A' }}>
              GDG Vitória da Conquista
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#5F6368', lineHeight: 1.6 }}>
            Comunidade de desenvolvedores do sudoeste baiano, parte da rede global Google Developer
            Groups.
          </p>
        </div>

        <div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 500,
              color: '#9AA0A6',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '12px',
            }}
          >
            Navegação
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { label: 'Eventos', href: '/eventos' },
              { label: 'Posts', href: '/posts' },
              { label: 'Comunidade', href: '/comunidade' },
              { label: 'Código de conduta', href: '/codigo-de-conduta' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{ fontSize: '13px', color: '#5F6368', textDecoration: 'none' }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 500,
              color: '#9AA0A6',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '12px',
            }}
          >
            Comunidade
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              {
                label: 'GDG no Google',
                href: 'https://developers.google.com/community/gdg',
                target: '_blank',
              },
              { label: 'Meetup', href: 'https://www.meetup.com', target: '_blank' },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                target={item.target}
                rel="noopener noreferrer"
                style={{ fontSize: '13px', color: '#5F6368', textDecoration: 'none' }}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '16px 24px',
          borderTop: '0.5px solid rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: '11px', color: '#9AA0A6' }}>
          © {new Date().getFullYear()} GDG Vitória da Conquista
        </span>
        <span style={{ fontSize: '11px', color: '#9AA0A6' }}>
          Não é um produto oficial do Google
        </span>
      </div>
    </footer>
  )
}
