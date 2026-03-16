import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { getPublishedEvents } from '@/lib/data/events'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Eventos',
  description: 'Eventos da comunidade GDG Vitória da Conquista',
}

export default async function EventosPage() {
  const events = await getPublishedEvents()
  const now = Math.floor(Date.now() / 1000)

  const upcoming = events.filter((e) => e.startAt._seconds >= now)
  const past = events.filter((e) => e.startAt._seconds < now)

  return (
    <>
      <Header />
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#1A1A1A', marginBottom: '8px' }}>
          Eventos
        </h1>
        <p style={{ fontSize: '14px', color: '#5F6368', marginBottom: '48px' }}>
          Meetups, workshops e encontros da comunidade
        </p>

        {upcoming.length > 0 && (
          <div style={{ marginBottom: '64px' }}>
            <h2
              style={{ fontSize: '16px', fontWeight: 500, color: '#1A1A1A', marginBottom: '24px' }}
            >
              Próximos eventos
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {upcoming.map((event) => {
                const date = new Date(event.startAt._seconds * 1000)
                const dateStr = date.toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })

                return (
                  <a
                    key={event.id}
                    href={`/eventos/${event.slug}`}
                    style={{
                      display: 'flex',
                      gap: '20px',
                      background: 'white',
                      border: '0.5px solid rgba(0,0,0,0.08)',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      textDecoration: 'none',
                    }}
                  >
                    {event.coverImage ? (
                      <div
                        style={{
                          width: '200px',
                          minWidth: '200px',
                          background: `url(${event.coverImage.url}) center/cover no-repeat`,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '200px',
                          minWidth: '200px',
                          background: 'linear-gradient(135deg, #E8F0FE 0%, #FCE8E6 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <div
                          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}
                        >
                          <div
                            style={{
                              width: '12px',
                              height: '12px',
                              background: '#4285F4',
                              borderRadius: '3px',
                            }}
                          />
                          <div
                            style={{
                              width: '12px',
                              height: '12px',
                              background: '#EA4335',
                              borderRadius: '3px',
                            }}
                          />
                          <div
                            style={{
                              width: '12px',
                              height: '12px',
                              background: '#FBBC04',
                              borderRadius: '3px',
                            }}
                          />
                          <div
                            style={{
                              width: '12px',
                              height: '12px',
                              background: '#34A853',
                              borderRadius: '3px',
                            }}
                          />
                        </div>
                      </div>
                    )}
                    <div style={{ padding: '20px', flex: 1 }}>
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#4285F4',
                          fontWeight: 500,
                          marginBottom: '6px',
                        }}
                      >
                        {dateStr}
                      </div>
                      <div
                        style={{
                          fontSize: '18px',
                          fontWeight: 600,
                          color: '#1A1A1A',
                          marginBottom: '8px',
                          lineHeight: 1.3,
                        }}
                      >
                        {event.title}
                      </div>
                      <div
                        style={{
                          fontSize: '13px',
                          color: '#5F6368',
                          lineHeight: 1.6,
                          marginBottom: '12px',
                        }}
                      >
                        {event.summary}
                      </div>
                      <div style={{ fontSize: '12px', color: '#9AA0A6' }}>
                        {event.location.name} · {event.location.address}
                      </div>
                    </div>
                  </a>
                )
              })}
            </div>
          </div>
        )}

        {past.length > 0 && (
          <div>
            <h2
              style={{ fontSize: '16px', fontWeight: 500, color: '#1A1A1A', marginBottom: '24px' }}
            >
              Eventos anteriores
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '20px',
              }}
            >
              {past.map((event) => {
                const date = new Date(event.startAt._seconds * 1000)
                const dateStr = date.toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })

                return (
                  <a
                    key={event.id}
                    href={`/eventos/${event.slug}`}
                    style={{
                      display: 'block',
                      background: '#F8F9FA',
                      border: '0.5px solid rgba(0,0,0,0.08)',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      textDecoration: 'none',
                      opacity: 0.8,
                    }}
                  >
                    {event.coverImage ? (
                      <div
                        style={{
                          height: '140px',
                          background: `url(${event.coverImage.url}) center/cover no-repeat`,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          height: '140px',
                          background: 'linear-gradient(135deg, #F1F3F4 0%, #E8EAED 100%)',
                        }}
                      />
                    )}
                    <div style={{ padding: '14px' }}>
                      <div style={{ fontSize: '11px', color: '#9AA0A6', marginBottom: '4px' }}>
                        {dateStr}
                      </div>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: 500,
                          color: '#1A1A1A',
                          lineHeight: 1.3,
                        }}
                      >
                        {event.title}
                      </div>
                    </div>
                  </a>
                )
              })}
            </div>
          </div>
        )}

        {events.length === 0 && (
          <div
            style={{ textAlign: 'center', padding: '80px 0', fontSize: '14px', color: '#9AA0A6' }}
          >
            Nenhum evento publicado ainda.
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
