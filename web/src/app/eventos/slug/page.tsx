'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Suspense } from 'react'

interface Event {
  title: string
  summary: string
  content?: { html: string }
  coverImage?: { url: string; alt: string }
  startAt: { _seconds: number }
  endAt?: { _seconds: number }
  location: { name: string; address: string }
  registrationUrl?: string
  speakers?: { name: string; bio?: string; avatarUrl?: string }[]
}

function EventoContent() {
  const searchParams = useSearchParams()
  const slug = searchParams.get('slug')
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) {
      setNotFound(true)
      setLoading(false)
      return
    }
    fetch(
      `https://firestore.googleapis.com/v1/projects/${process.env['NEXT_PUBLIC_FIREBASE_PROJECT_ID']}/databases/(default)/documents/events?pageSize=100`,
    )
      .then((r) => r.json())
      .then((data) => {
        const doc = data.documents?.find(
          (d: any) =>
            d.fields?.slug?.stringValue === slug && d.fields?.status?.stringValue === 'published',
        )
        if (!doc) {
          setNotFound(true)
          return
        }
        const f = doc.fields
        const toSeconds = (ts: string) => Math.floor(new Date(ts).getTime() / 1000)
        setEvent({
          title: f.title?.stringValue ?? '',
          summary: f.summary?.stringValue ?? '',
          content: f.content?.mapValue?.fields
            ? { html: f.content.mapValue.fields.html?.stringValue ?? '' }
            : undefined,
          coverImage: f.coverImage?.mapValue?.fields
            ? {
                url: f.coverImage.mapValue.fields.url?.stringValue ?? '',
                alt: f.coverImage.mapValue.fields.alt?.stringValue ?? '',
              }
            : undefined,
          startAt: { _seconds: toSeconds(f.startAt?.timestampValue ?? '') },
          endAt: f.endAt?.timestampValue
            ? { _seconds: toSeconds(f.endAt.timestampValue) }
            : undefined,
          location: {
            name: f.location?.mapValue?.fields?.name?.stringValue ?? '',
            address: f.location?.mapValue?.fields?.address?.stringValue ?? '',
          },
          registrationUrl: f.registrationUrl?.stringValue,
          speakers:
            f.speakers?.arrayValue?.values?.map((v: any) => ({
              name: v.mapValue?.fields?.name?.stringValue ?? '',
              bio: v.mapValue?.fields?.bio?.stringValue,
              avatarUrl: v.mapValue?.fields?.avatarUrl?.stringValue,
            })) ?? [],
        })
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading)
    return (
      <main
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '80px 24px',
          textAlign: 'center',
          color: '#9AA0A6',
        }}
      >
        Carregando...
      </main>
    )
  if (notFound || !event)
    return (
      <main
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '80px 24px',
          textAlign: 'center',
          color: '#9AA0A6',
        }}
      >
        Evento não encontrado.
      </main>
    )

  const dateStr = new Date(event.startAt._seconds * 1000).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
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
          <div style={{ fontSize: '13px', color: '#4285F4', fontWeight: 500, marginBottom: '8px' }}>
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
        {event.content?.html && (
          <div
            style={{ fontSize: '16px', lineHeight: 1.8, color: '#1A1A1A' }}
            dangerouslySetInnerHTML={{ __html: event.content.html }}
          />
        )}
      </div>
    </main>
  )
}

export default function EventoPage() {
  return (
    <>
      <Header />
      <Suspense
        fallback={
          <main style={{ padding: '80px 24px', textAlign: 'center', color: '#9AA0A6' }}>
            Carregando...
          </main>
        }
      >
        <EventoContent />
      </Suspense>
      <Footer />
    </>
  )
}
