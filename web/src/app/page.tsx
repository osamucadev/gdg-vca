import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { getEnabledHomeBlocks } from '@/lib/data/homeBlocks'
import { getPublishedEvents } from '@/lib/data/events'
import { getPublishedAnnouncements } from '@/lib/data/announcements'
import type { Metadata } from 'next'
import type { PublicEvent } from '@/lib/data/events'
import type { PublicAnnouncement } from '@/lib/data/announcements'
import { ContactForm } from '@/components/home/ContactForm'

export const metadata: Metadata = {
  title: 'GDG Vitória da Conquista',
  description: 'Comunidade de desenvolvedores do sudoeste baiano',
}

function str(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function num(value: unknown, fallback: number): number {
  return typeof value === 'number' ? value : fallback
}

export default async function HomePage() {
  const [blocks, events, announcements] = await Promise.all([
    getEnabledHomeBlocks(),
    getPublishedEvents(),
    getPublishedAnnouncements(),
  ])

  const featuredAnnouncements = announcements.filter((a) => a.featuredOnHome)

  return (
    <>
      <Header />
      <main>
        {blocks.map((block) => {
          switch (block.type) {
            case 'top-bar':
              return <TopBar key={block.id} props={block.props} />
            case 'hero':
              return <Hero key={block.id} props={block.props} />
            case 'countdown-banner':
              return <CountdownBanner key={block.id} props={block.props} events={events} />
            case 'events-carousel':
              return <EventsCarousel key={block.id} props={block.props} events={events} />
            case 'announcements-carousel':
              return (
                <AnnouncementsCarousel
                  key={block.id}
                  props={block.props}
                  announcements={featuredAnnouncements}
                />
              )
            case 'cta-banner':
              return <CtaBanner key={block.id} props={block.props} />
            case 'contact-form':
              return <ContactFormBlock key={block.id} props={block.props} />
            default:
              return null
          }
        })}
      </main>
      <Footer />
    </>
  )
}

function TopBar({ props }: { props: Record<string, unknown> }) {
  const variantColors: Record<string, { bg: string; text: string }> = {
    brand: { bg: '#4285F4', text: 'white' },
    info: { bg: '#E8F0FE', text: '#4285F4' },
    warning: { bg: '#FEF7E0', text: '#B06000' },
    success: { bg: '#E6F4EA', text: '#34A853' },
  }
  const variant = str(props['variant']) || 'brand'
  const colors = variantColors[variant] ?? variantColors['brand']

  return (
    <div
      style={{
        background: colors.bg,
        color: colors.text,
        padding: '8px 24px',
        textAlign: 'center',
        fontSize: '13px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
      }}
    >
      <span>{str(props['text'])}</span>
      {str(props['linkLabel']) && str(props['linkUrl']) && (
        <a
          href={str(props['linkUrl'])}
          target={str(props['linkTarget']) === 'new_tab' ? '_blank' : '_self'}
          rel="noopener noreferrer"
          style={{ color: colors.text, fontWeight: 500, textDecoration: 'underline' }}
        >
          {str(props['linkLabel'])}
        </a>
      )}
    </div>
  )
}

function Hero({ props }: { props: Record<string, unknown> }) {
  const desktopImage = props['desktopImage'] as { url: string; alt: string } | undefined
  const themeVariant = str(props['themeVariant']) || 'dark'
  const isDark = themeVariant === 'dark' || themeVariant === 'brand'
  const overlayVariant = str(props['overlayVariant']) || 'dark'
  const contentAlign = str(props['contentAlign']) || 'center'
  const overlayOpacity = overlayVariant === 'none' ? 0 : overlayVariant === 'light' ? 0.3 : 0.6

  return (
    <section
      style={{
        position: 'relative',
        minHeight: '480px',
        display: 'flex',
        alignItems: 'center',
        background: desktopImage
          ? `url(${desktopImage.url}) center/cover no-repeat`
          : isDark
            ? '#1A1A1A'
            : '#F8F9FA',
      }}
    >
      {overlayOpacity > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              overlayVariant === 'light'
                ? `rgba(255,255,255,${overlayOpacity})`
                : `rgba(0,0,0,${overlayOpacity})`,
          }}
        />
      )}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '80px 24px',
          width: '100%',
          textAlign: contentAlign as 'left' | 'center' | 'right',
        }}
      >
        {str(props['eyebrow']) && (
          <div
            style={{
              fontSize: '12px',
              fontWeight: 500,
              color: '#4285F4',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '12px',
            }}
          >
            {str(props['eyebrow'])}
          </div>
        )}
        <h1
          style={{
            fontSize: '48px',
            fontWeight: 700,
            color: isDark ? 'white' : '#1A1A1A',
            lineHeight: 1.1,
            margin: contentAlign === 'center' ? '0 auto 16px' : '0 0 16px',
            maxWidth: contentAlign === 'center' ? '700px' : 'none',
          }}
        >
          {str(props['title'])}
        </h1>
        {str(props['subtitle']) && (
          <p
            style={{
              fontSize: '18px',
              color: isDark ? 'rgba(255,255,255,0.8)' : '#5F6368',
              lineHeight: 1.6,
              margin: contentAlign === 'center' ? '0 auto 32px' : '0 0 32px',
              maxWidth: contentAlign === 'center' ? '600px' : 'none',
            }}
          >
            {str(props['subtitle'])}
          </p>
        )}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent:
              contentAlign === 'center'
                ? 'center'
                : contentAlign === 'right'
                  ? 'flex-end'
                  : 'flex-start',
            flexWrap: 'wrap',
          }}
        >
          {str(props['ctaLabel']) && (
            <a
              href={str(props['ctaUrl'])}
              target={str(props['ctaTarget']) === 'new_tab' ? '_blank' : '_self'}
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
              {str(props['ctaLabel'])}
            </a>
          )}
          {str(props['secondaryCtaLabel']) && (
            <a
              href={str(props['secondaryCtaUrl'])}
              target={str(props['secondaryCtaTarget']) === 'new_tab' ? '_blank' : '_self'}
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                height: '44px',
                padding: '0 24px',
                background: 'transparent',
                color: isDark ? 'white' : '#1A1A1A',
                border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.2)'}`,
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              {str(props['secondaryCtaLabel'])}
            </a>
          )}
        </div>
      </div>
    </section>
  )
}

function CountdownBanner({
  props,
  events,
}: {
  props: Record<string, unknown>
  events: PublicEvent[]
}) {
  const mode = str(props['mode']) || 'next_upcoming'
  const now = Math.floor(Date.now() / 1000)

  let targetEvent: PublicEvent | undefined
  if (mode === 'linked_event') {
    targetEvent = events.find((e) => e.id === str(props['linkedEventId']))
  } else {
    targetEvent = events
      .filter((e) => e.startAt._seconds > now)
      .sort((a, b) => a.startAt._seconds - b.startAt._seconds)[0]
  }

  if (!targetEvent) return null

  const themeVariant = str(props['themeVariant']) || 'brand'
  const isDark = themeVariant === 'dark' || themeVariant === 'brand'

  const eventDate = new Date(targetEvent.startAt._seconds * 1000)
  const dateStr = eventDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <section
      style={{
        background:
          themeVariant === 'brand' ? '#4285F4' : themeVariant === 'dark' ? '#1A1A1A' : '#F8F9FA',
        padding: '32px 24px',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {str(props['eyebrow']) && (
          <div
            style={{
              fontSize: '11px',
              fontWeight: 500,
              color: isDark ? 'rgba(255,255,255,0.6)' : '#9AA0A6',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '8px',
            }}
          >
            {str(props['eyebrow'])}
          </div>
        )}
        <h2
          style={{
            fontSize: '24px',
            fontWeight: 600,
            color: isDark ? 'white' : '#1A1A1A',
            marginBottom: '8px',
          }}
        >
          {targetEvent.title}
        </h2>
        <p
          style={{
            fontSize: '14px',
            color: isDark ? 'rgba(255,255,255,0.7)' : '#5F6368',
            marginBottom: '16px',
          }}
        >
          {str(props['label']) ? `${str(props['label'])} ` : ''}
          {dateStr}
        </p>
        {str(props['ctaLabel']) && (
          <a
            href={str(props['ctaUrl']) || `/eventos/${targetEvent.slug}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              height: '38px',
              padding: '0 20px',
              background: isDark ? 'white' : '#4285F4',
              color: isDark ? '#4285F4' : 'white',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            {str(props['ctaLabel'])}
          </a>
        )}
      </div>
    </section>
  )
}

function EventsCarousel({
  props,
  events,
}: {
  props: Record<string, unknown>
  events: PublicEvent[]
}) {
  const mode = str(props['mode']) || 'upcoming'
  const maxItems = num(props['maxItems'], 6)
  const now = Math.floor(Date.now() / 1000)

  let filtered = events
  if (mode === 'upcoming') filtered = events.filter((e) => e.startAt._seconds > now)
  else if (mode === 'past') filtered = events.filter((e) => e.startAt._seconds < now)
  else if (mode === 'featured') filtered = events.filter((e) => e.featuredOnHome)

  const displayed = filtered.slice(0, maxItems)

  if (displayed.length === 0) return null

  return (
    <section style={{ padding: '64px 24px', background: 'white' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {str(props['title']) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '32px',
            }}
          >
            <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#1A1A1A' }}>
              {str(props['title'])}
            </h2>
            {str(props['ctaLabel']) && (
              <a
                href={str(props['ctaUrl'])}
                style={{
                  fontSize: '13px',
                  color: '#4285F4',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                {str(props['ctaLabel'])} →
              </a>
            )}
          </div>
        )}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          {displayed.map((event) => {
            const date = new Date(event.startAt._seconds * 1000)
            const dateStr = date.toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })

            return (
              <a
                key={event.id}
                href={`/eventos/slug?slug=${event.slug}`}
                style={{
                  display: 'block',
                  background: '#F8F9FA',
                  border: '0.5px solid rgba(0,0,0,0.08)',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  textDecoration: 'none',
                }}
              >
                {event.coverImage ? (
                  <div
                    style={{
                      height: '160px',
                      background: `url(${event.coverImage.url}) center/cover no-repeat`,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      height: '160px',
                      background: 'linear-gradient(135deg, #E8F0FE 0%, #FCE8E6 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
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
                <div style={{ padding: '16px' }}>
                  <div style={{ fontSize: '11px', color: '#9AA0A6', marginBottom: '6px' }}>
                    {dateStr} · {event.location.name}
                  </div>
                  <div
                    style={{
                      fontSize: '15px',
                      fontWeight: 500,
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
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {event.summary}
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function AnnouncementsCarousel({
  props,
  announcements,
}: {
  props: Record<string, unknown>
  announcements: PublicAnnouncement[]
}) {
  const maxItems = num(props['maxItems'], 4)
  const displayed = announcements.slice(0, maxItems)

  if (displayed.length === 0) return null

  return (
    <section style={{ padding: '64px 24px', background: '#F8F9FA' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {str(props['title']) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '32px',
            }}
          >
            <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#1A1A1A' }}>
              {str(props['title'])}
            </h2>
            {str(props['ctaLabel']) && (
              <a
                href={str(props['ctaUrl'])}
                style={{
                  fontSize: '13px',
                  color: '#4285F4',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                {str(props['ctaLabel'])} →
              </a>
            )}
          </div>
        )}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '16px',
          }}
        >
          {displayed.map((item) => (
            <div
              key={item.id}
              style={{
                background: 'white',
                border: '0.5px solid rgba(0,0,0,0.08)',
                borderRadius: '10px',
                padding: '16px',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  color: '#9AA0A6',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '8px',
                }}
              >
                {item.kind}
              </div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#1A1A1A',
                  marginBottom: '8px',
                  lineHeight: 1.3,
                }}
              >
                {item.title}
              </div>
              <div style={{ fontSize: '13px', color: '#5F6368', lineHeight: 1.5 }}>
                {item.summary}
              </div>
              {item.cta && (
                <a
                  href={item.cta.url}
                  style={{
                    display: 'inline-block',
                    marginTop: '12px',
                    fontSize: '12px',
                    color: '#4285F4',
                    fontWeight: 500,
                    textDecoration: 'none',
                  }}
                >
                  {item.cta.label} →
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CtaBanner({ props }: { props: Record<string, unknown> }) {
  const bgVariant = str(props['backgroundVariant']) || 'brand'
  const contentAlign = str(props['contentAlign']) || 'center'
  const desktopImage = props['desktopImage'] as { url: string } | undefined

  const bgColors: Record<string, string> = {
    brand: '#4285F4',
    dark: '#1A1A1A',
    light: '#F8F9FA',
    accent: '#EA4335',
  }

  const isDark = bgVariant === 'brand' || bgVariant === 'dark' || bgVariant === 'accent'
  const bg = bgColors[bgVariant] ?? bgColors['brand']

  return (
    <section
      style={{
        padding: '80px 24px',
        background: desktopImage ? `url(${desktopImage.url}) center/cover no-repeat` : bg,
        position: 'relative',
      }}
    >
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: contentAlign as 'left' | 'center' | 'right',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {str(props['eyebrow']) && (
          <div
            style={{
              fontSize: '11px',
              fontWeight: 500,
              color: isDark ? 'rgba(255,255,255,0.6)' : '#9AA0A6',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '12px',
            }}
          >
            {str(props['eyebrow'])}
          </div>
        )}
        <h2
          style={{
            fontSize: '32px',
            fontWeight: 700,
            color: isDark ? 'white' : '#1A1A1A',
            marginBottom: '12px',
          }}
        >
          {str(props['title'])}
        </h2>
        {str(props['subtitle']) && (
          <p
            style={{
              fontSize: '16px',
              color: isDark ? 'rgba(255,255,255,0.8)' : '#5F6368',
              marginBottom: '28px',
              lineHeight: 1.6,
            }}
          >
            {str(props['subtitle'])}
          </p>
        )}
        {str(props['ctaLabel']) && (
          <a
            href={str(props['ctaUrl'])}
            target={str(props['ctaTarget']) === 'new_tab' ? '_blank' : '_self'}
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              height: '44px',
              padding: '0 24px',
              background: isDark ? 'white' : '#4285F4',
              color: isDark ? '#4285F4' : 'white',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            {str(props['ctaLabel'])}
          </a>
        )}
      </div>
    </section>
  )
}

function ContactFormBlock({ props }: { props: Record<string, unknown> }) {
  return (
    <ContactForm
      title={str(props['title'])}
      subtitle={str(props['subtitle'])}
      submitLabel={str(props['submitLabel'])}
      successMessage={str(props['successMessage'])}
      privacyNote={str(props['privacyNote'])}
    />
  )
}
