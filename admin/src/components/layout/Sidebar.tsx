'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

const navSections = [
  {
    title: 'Conteúdo',
    items: [
      {
        label: 'Dashboard',
        href: '/dashboard',
        icon: (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
          </svg>
        ),
      },
      {
        label: 'Eventos',
        href: '/dashboard/eventos',
        icon: (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        ),
      },
      {
        label: 'Posts',
        href: '/dashboard/posts',
        icon: (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        ),
      },
      {
        label: 'Avisos',
        href: '/dashboard/avisos',
        icon: (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        ),
      },
    ],
  },
  {
    title: 'Estrutura',
    items: [
      {
        label: 'Páginas',
        href: '/dashboard/paginas',
        icon: (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        ),
      },
      {
        label: 'Home Blocks',
        href: '/dashboard/home-blocks',
        icon: (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="9" y1="21" x2="9" y2="9" />
          </svg>
        ),
      },
      {
        label: 'Parceiros',
        href: '/dashboard/parceiros',
        icon: (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M6 20v-2a6 6 0 0 1 12 0v2" />
          </svg>
        ),
      },
    ],
  },
  {
    title: 'Sistema',
    items: [
      {
        label: 'Mensagens',
        href: '/dashboard/mensagens',
        icon: (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        ),
      },
      {
        label: 'Auditoria',
        href: '/dashboard/auditoria',
        icon: (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        ),
      },
      {
        label: 'Usuários',
        href: '/dashboard/usuarios',
        icon: (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ),
      },
    ],
  },
]

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function Sidebar() {
  const pathname = usePathname()
  const { user, role } = useAuth()

  const displayName = user?.displayName ?? user?.email ?? 'Usuário'

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        minWidth: 'var(--sidebar-width)',
        background: 'var(--bg-surface)',
        borderRight: '0.5px solid var(--border-default)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          height: '3px',
          flexShrink: 0,
        }}
      >
        <div style={{ flex: 1, background: 'var(--gdg-blue)' }} />
        <div style={{ flex: 1, background: 'var(--gdg-red)' }} />
        <div style={{ flex: 1, background: 'var(--gdg-yellow)' }} />
        <div style={{ flex: 1, background: 'var(--gdg-green)' }} />
      </div>

      <div
        style={{
          padding: '14px 16px',
          borderBottom: '0.5px solid var(--border-default)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '2.5px',
              width: '20px',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                background: 'var(--gdg-blue)',
                borderRadius: '2px',
              }}
            />
            <div
              style={{
                width: '8px',
                height: '8px',
                background: 'var(--gdg-red)',
                borderRadius: '2px',
              }}
            />
            <div
              style={{
                width: '8px',
                height: '8px',
                background: 'var(--gdg-yellow)',
                borderRadius: '2px',
              }}
            />
            <div
              style={{
                width: '8px',
                height: '8px',
                background: 'var(--gdg-green)',
                borderRadius: '2px',
              }}
            />
          </div>
          <div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 500,
                color: 'var(--text-primary)',
                lineHeight: 1.3,
              }}
            >
              GDG Vitória da Conquista
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
              Painel administrativo
            </div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '6px 0', overflowY: 'auto' }}>
        {navSections.map((section) => (
          <div key={section.title}>
            <div
              style={{
                padding: '8px 16px 3px',
                fontSize: '10px',
                color: 'var(--text-tertiary)',
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                marginTop: '4px',
              }}
            >
              {section.title}
            </div>
            {section.items.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '9px',
                    padding: '7px 10px',
                    borderRadius: '7px',
                    margin: '1px 8px',
                    fontSize: '13px',
                    color: isActive ? 'var(--text-accent)' : 'var(--text-secondary)',
                    background: isActive ? 'var(--bg-active)' : 'transparent',
                    fontWeight: isActive ? 500 : 400,
                    textDecoration: 'none',
                    transition: 'background 0.1s, color 0.1s',
                  }}
                >
                  {item.icon}
                  {item.label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      <div
        style={{
          padding: '10px 12px',
          borderTop: '0.5px solid var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          gap: '9px',
        }}
      >
        <div
          style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            background: 'var(--gdg-blue)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: 500,
            color: 'white',
            flexShrink: 0,
          }}
        >
          {getInitials(displayName)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 500,
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {displayName}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
            {role ?? 'carregando...'}
          </div>
        </div>
      </div>
    </aside>
  )
}
