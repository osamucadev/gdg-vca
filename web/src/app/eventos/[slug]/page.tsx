import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { getPublishedEvents, getEventBySlug } from '@/lib/data/events'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const event = await getEventBySlug(slug)
  if (!event) return {}
  return {
    title: event.seo?.title ?? event.title,
    description: event.seo?.description ?? event.summary,
    openGraph: {
      title: event.seo?.title ?? event.title,
      description: event.seo?.description ?? event.summary,
      images: event.seo?.ogImage
        ? [event.seo.ogImage]
        : event.coverImage
          ? [event.coverImage.url]
          : [],
    },
  }
}

export default async function EventoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await getEventBySlug(slug)

  if (!event) notFound()

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
    <>
      <Header />
      <main>
        {event.coverImage && (
          <div
            style={{
              height: '360px',
              background: `url(${event.coverImage.url}) center/cover no-repeat`,
              position: 'relative',
            }}
          >
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
          </div>
        )}

        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px' }}>
          <div style={{ marginBottom: '32px' }}>
            <div
              style={{ fontSize: '13px', color: '#4285F4', fontWeight: 500, marginBottom: '8px' }}
            >
              {dateStr}
            </div>
            <h1
              style={{
                fontSize: '36px',
                fontWeight: 700,
                color: '#1A1A1A',
                lineHeight: 1.2,
                marginBottom: '16px',
              }}
            >
              {event.title}
            </h1>
            <p style={{ fontSize: '16px', color: '#5F6368', lineHeight: 1.7 }}>{event.summary}</p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '40px',
              padding: '20px',
              background: '#F8F9FA',
              borderRadius: '10px',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '11px',
                  color: '#9AA0A6',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '4px',
                }}
              >
                Local
              </div>
              <div style={{ fontSize: '14px', color: '#1A1A1A', fontWeight: 500 }}>
                {event.location.name}
              </div>
              <div style={{ fontSize: '12px', color: '#5F6368' }}>{event.location.address}</div>
            </div>
            {event.endAt && (
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    color: '#9AA0A6',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: '4px',
                  }}
                >
                  Término
                </div>
                <div style={{ fontSize: '14px', color: '#1A1A1A', fontWeight: 500 }}>
                  {new Date(event.endAt._seconds * 1000).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            )}
          </div>

          {event.registrationUrl && (
            <div style={{ marginBottom: '40px' }}>
              <a
                href={event.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  height: '44px',
                  padding: '0 24px',
                  background: '#4285F4',
                  color: 'white',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  textDecoration: 'none',
                }}
              >
                Inscrever-se
              </a>
            </div>
          )}

          {event.content?.html &&
            event.content.html !== JSON.stringify({ type: 'doc', content: [] }) && (
              <div
                style={{ fontSize: '16px', lineHeight: 1.8, color: '#1A1A1A' }}
                dangerouslySetInnerHTML={{ __html: event.content.html }}
              />
            )}

          {event.speakers && event.speakers.length > 0 && (
            <div style={{ marginTop: '48px' }}>
              <h2
                style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  color: '#1A1A1A',
                  marginBottom: '24px',
                }}
              >
                Palestrantes
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {event.speakers.map((speaker, i) => (
                  <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    {speaker.avatarUrl ? (
                      <img
                        src={speaker.avatarUrl}
                        alt={speaker.name}
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          background: '#E8F0FE',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '16px',
                          fontWeight: 500,
                          color: '#4285F4',
                          flexShrink: 0,
                        }}
                      >
                        {speaker.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 500, color: '#1A1A1A' }}>
                        {speaker.name}
                      </div>
                      {speaker.bio && (
                        <div
                          style={{
                            fontSize: '13px',
                            color: '#5F6368',
                            marginTop: '4px',
                            lineHeight: 1.5,
                          }}
                        >
                          {speaker.bio}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

export const dynamicParams = false

export async function generateStaticParams() {
  try {
    const events = await getPublishedEvents()
    return events.map((e) => ({ slug: e.slug }))
  } catch (err) {
    console.error('generateStaticParams error:', err)
    return []
  }
}
