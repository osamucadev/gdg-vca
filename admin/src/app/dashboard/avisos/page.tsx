'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Badge } from '@/components/ui/Badge'
import {
  listAnnouncements,
  publishAnnouncement,
  archiveAnnouncement,
  formatDate,
  type AnnouncementListItem,
} from '@/lib/api/announcements'

const statusVariant: Record<string, 'blue' | 'green' | 'gray'> = {
  draft: 'blue',
  published: 'green',
  archived: 'gray',
}

const statusLabel: Record<string, string> = {
  draft: 'rascunho',
  published: 'publicado',
  archived: 'arquivado',
}

const kindLabel: Record<string, string> = {
  reminder: 'lembrete',
  opportunity: 'oportunidade',
  highlight: 'destaque',
  partner: 'parceiro',
  call: 'chamada',
  general: 'geral',
}

export default function AvisosPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const router = useRouter()

  async function loadAnnouncements() {
    try {
      setLoading(true)
      const res = await listAnnouncements()
      setAnnouncements(res.announcements)
    } catch (_err) {
      setError('Erro ao carregar avisos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnnouncements()
  }, [])

  async function handlePublish(id: string) {
    setActionLoading(id)
    try {
      await publishAnnouncement(id)
      await loadAnnouncements()
    } catch (_err) {
      setError('Erro ao publicar aviso')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleArchive(id: string) {
    setActionLoading(id)
    try {
      await archiveAnnouncement(id)
      await loadAnnouncements()
    } catch (_err) {
      setError('Erro ao arquivar aviso')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <AdminLayout title="Avisos">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '900px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2
              style={{
                fontSize: '20px',
                fontWeight: 500,
                color: 'var(--text-primary)',
                marginBottom: '4px',
              }}
            >
              Avisos
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Alertas, chamadas e conteúdos utilitários rápidos
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard/avisos/novo')}
            style={{
              height: '34px',
              padding: '0 16px',
              background: 'var(--gdg-blue)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              fontWeight: 500,
              color: 'white',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
            }}
          >
            Novo aviso
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '10px 12px',
              background: 'var(--gdg-red-bg)',
              border: '0.5px solid var(--gdg-red)',
              borderRadius: 'var(--radius-md)',
              fontSize: '12px',
              color: 'var(--gdg-red)',
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            background: 'var(--bg-surface)',
            border: '0.5px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
          }}
        >
          {loading ? (
            <div
              style={{
                padding: '40px',
                textAlign: 'center',
                fontSize: '13px',
                color: 'var(--text-tertiary)',
              }}
            >
              Carregando avisos...
            </div>
          ) : announcements.length === 0 ? (
            <div
              style={{
                padding: '40px',
                textAlign: 'center',
                fontSize: '13px',
                color: 'var(--text-tertiary)',
              }}
            >
              Nenhum aviso cadastrado ainda.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '0.5px solid var(--border-default)' }}>
                  {['Título', 'Tipo', 'Prioridade', 'Status', 'Ações'].map((col) => (
                    <th
                      key={col}
                      style={{
                        padding: '10px 16px',
                        textAlign: 'left',
                        fontSize: '11px',
                        fontWeight: 500,
                        color: 'var(--text-tertiary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {announcements.map((item, index) => (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom:
                        index < announcements.length - 1
                          ? '0.5px solid var(--border-default)'
                          : 'none',
                    }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div
                        style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}
                      >
                        {item.title}
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: 'var(--text-tertiary)',
                          marginTop: '2px',
                        }}
                      >
                        {formatDate(item.createdAt._seconds)}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Badge label={kindLabel[item.kind] ?? item.kind} variant="gray" />
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {item.priority}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Badge
                        label={statusLabel[item.status] ?? item.status}
                        variant={statusVariant[item.status] ?? 'gray'}
                      />
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {item.status === 'draft' && (
                          <button
                            onClick={() => handlePublish(item.id)}
                            disabled={actionLoading === item.id}
                            style={{
                              height: '26px',
                              padding: '0 10px',
                              background: 'var(--gdg-green-bg)',
                              border: '0.5px solid var(--gdg-green)',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '11px',
                              fontWeight: 500,
                              color: 'var(--gdg-green)',
                              cursor: 'pointer',
                              fontFamily: 'var(--font-sans)',
                            }}
                          >
                            Publicar
                          </button>
                        )}
                        {item.status !== 'archived' && (
                          <button
                            onClick={() => handleArchive(item.id)}
                            disabled={actionLoading === item.id}
                            style={{
                              height: '26px',
                              padding: '0 10px',
                              background: 'var(--bg-hover)',
                              border: '0.5px solid var(--border-default)',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '11px',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer',
                              fontFamily: 'var(--font-sans)',
                            }}
                          >
                            Arquivar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
