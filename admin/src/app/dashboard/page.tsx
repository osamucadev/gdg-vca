'use client'

import { AdminLayout } from '@/components/layout/AdminLayout'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect } from 'react'

const metrics = [
  { label: 'Eventos publicados', value: 0, color: 'var(--gdg-blue)' },
  { label: 'Posts publicados', value: 0, color: 'var(--gdg-green)' },
  { label: 'Avisos ativos', value: 0, color: 'var(--gdg-yellow)' },
]

const quickActions = [
  {
    label: 'Novo evento',
    description: 'Criar e publicar',
    color: 'var(--gdg-blue)',
    href: '/dashboard/eventos/novo',
  },
  {
    label: 'Novo post',
    description: 'Rascunho ou publicar',
    color: 'var(--gdg-green)',
    href: '/dashboard/posts/novo',
  },
  {
    label: 'Novo aviso',
    description: 'Alerta ou destaque',
    color: 'var(--gdg-yellow)',
    href: '/dashboard/avisos/novo',
  },
  {
    label: 'Editar Home',
    description: 'Blocos e conteúdo',
    color: 'var(--gdg-red)',
    href: '/dashboard/home-blocks',
  },
]

export default function DashboardPage() {
  const { user } = useAuth()

  const displayName = user?.displayName ?? 'Admin'
  const firstName = displayName.split(' ')[0]

  useEffect(() => {
  if (!user) return
  user.getIdToken().then((token) => console.log(token))
}, [user])

  return (
    <AdminLayout title="Dashboard">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '900px' }}>
        <div>
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 500,
              color: 'var(--text-primary)',
              marginBottom: '4px',
            }}
          >
            Olá, {firstName}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Bem-vindo ao painel do GDG Vitória da Conquista.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: '10px',
          }}
        >
          {metrics.map((metric) => (
            <div
              key={metric.label}
              style={{
                background: 'var(--bg-surface)',
                border: '0.5px solid var(--border-default)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '10px',
                }}
              >
                <div
                  style={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    background: metric.color,
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {metric.label}
                </span>
              </div>
              <div
                style={{
                  fontSize: '26px',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  lineHeight: 1,
                }}
              >
                {metric.value}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: 'var(--text-tertiary)',
                  marginTop: '6px',
                }}
              >
                nenhum ainda
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            background: 'var(--bg-surface)',
            border: '0.5px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <span
              style={{
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--text-primary)',
              }}
            >
              Atividade recente
            </span>
            <Badge label="auditoria" variant="gray" />
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              paddingBottom: '14px',
              borderBottom: '0.5px solid var(--border-default)',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'var(--gdg-blue-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  background: 'var(--gdg-blue)',
                }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                Bootstrap concluído
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Usuário owner criado · {user?.email}
              </div>
            </div>
            <Badge label="create" variant="blue" />
          </div>

          <div
            style={{
              paddingTop: '14px',
              textAlign: 'center',
              fontSize: '12px',
              color: 'var(--text-tertiary)',
            }}
          >
            Nenhuma outra atividade registrada
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-surface)',
            border: '0.5px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px',
          }}
        >
          <div
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--text-primary)',
              marginBottom: '14px',
            }}
          >
            Acesso rápido
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: '8px',
            }}
          >
            {quickActions.map((action) => (
              <a
                key={action.href}
                href={action.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px',
                  border: '0.5px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-base)',
                  textDecoration: 'none',
                  transition: 'border-color 0.1s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-default)')}
              >
                <div
                  style={{
                    width: '4px',
                    height: '28px',
                    borderRadius: '2px',
                    background: action.color,
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {action.label}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {action.description}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
