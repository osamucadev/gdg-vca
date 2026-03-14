'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Badge } from '@/components/ui/Badge'
import { listEvents, publishEvent, archiveEvent, type EventListItem } from '@/lib/api/events'
import { formatEventDate } from '@/lib/api/events'

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

export default function EventosPage() {
  const [events, setEvents] = useState<EventListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const router = useRouter()

  async function loadEvents() {
    try {
      setLoading(true)
      const res = await listEvents()
      setEvents(res.events)
    } catch (_err) {
      setError('Erro ao carregar eventos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEvents()
  }, [])

  async function handlePublish(eventId: string) {
    setActionLoading(eventId)
    try {
      await publishEvent(eventId)
      await loadEvents()
    } catch (_err) {
      setError('Erro ao publicar evento')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleArchive(eventId: string) {
    setActionLoading(eventId)
    try {
      await archiveEvent(eventId)
      await loadEvents()
    } catch (_err) {
      setError('Erro ao arquivar evento')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <AdminLayout title="Eventos">
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
              Eventos
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Gerencie os eventos do GDG Vitória da Conquista
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard/eventos/novo')}
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
            Novo evento
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
              Carregando eventos...
            </div>
          ) : events.length === 0 ? (
            <div
              style={{
                padding: '40px',
                textAlign: 'center',
                fontSize: '13px',
                color: 'var(--text-tertiary)',
              }}
            >
              Nenhum evento cadastrado ainda.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '0.5px solid var(--border-default)' }}>
                  {['Título', 'Data', 'Status', 'Ações'].map((col) => (
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
                {events.map((event, index) => (
                  <tr
                    key={event.id}
                    style={{
                      borderBottom:
                        index < events.length - 1 ? '0.5px solid var(--border-default)' : 'none',
                    }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div
                        style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}
                      >
                        {event.title}
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: 'var(--text-tertiary)',
                          marginTop: '2px',
                        }}
                      >
                        /{event.slug}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {formatEventDate(event.startAt._seconds)}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Badge
                        label={statusLabel[event.status] ?? event.status}
                        variant={statusVariant[event.status] ?? 'gray'}
                      />
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {event.status === 'draft' && (
                          <button
                            onClick={() => handlePublish(event.id)}
                            disabled={actionLoading === event.id}
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
                        {event.status !== 'archived' && (
                          <button
                            onClick={() => handleArchive(event.id)}
                            disabled={actionLoading === event.id}
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
