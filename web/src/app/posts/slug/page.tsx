'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Suspense } from 'react'

interface Post {
  title: string
  excerpt: string
  content?: { html: string }
  coverImage?: { url: string; alt: string }
  tags?: string[]
  category?: string
  publishedAt: { _seconds: number }
}

function PostContent() {
  const searchParams = useSearchParams()
  const slug = searchParams.get('slug')
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) {
      setNotFound(true)
      setLoading(false)
      return
    }
    fetch(
      `https://firestore.googleapis.com/v1/projects/${process.env['NEXT_PUBLIC_FIREBASE_PROJECT_ID']}/databases/(default)/documents/posts?pageSize=100`,
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
        setPost({
          title: f.title?.stringValue ?? '',
          excerpt: f.excerpt?.stringValue ?? '',
          content: f.content?.mapValue?.fields
            ? { html: f.content.mapValue.fields.html?.stringValue ?? '' }
            : undefined,
          coverImage: f.coverImage?.mapValue?.fields
            ? {
                url: f.coverImage.mapValue.fields.url?.stringValue ?? '',
                alt: f.coverImage.mapValue.fields.alt?.stringValue ?? '',
              }
            : undefined,
          tags: f.tags?.arrayValue?.values?.map((v: any) => v.stringValue) ?? [],
          category: f.category?.stringValue,
          publishedAt: {
            _seconds: Math.floor(new Date(f.publishedAt?.timestampValue ?? '').getTime() / 1000),
          },
        })
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading)
    return (
      <main
        style={{
          maxWidth: '720px',
          margin: '0 auto',
          padding: '80px 24px',
          textAlign: 'center',
          color: '#9AA0A6',
        }}
      >
        Carregando...
      </main>
    )
  if (notFound || !post)
    return (
      <main
        style={{
          maxWidth: '720px',
          margin: '0 auto',
          padding: '80px 24px',
          textAlign: 'center',
          color: '#9AA0A6',
        }}
      >
        Post não encontrado.
      </main>
    )

  const dateStr = new Date(post.publishedAt._seconds * 1000).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <main>
      {post.coverImage && (
        <div
          style={{
            height: '360px',
            background: `url(${post.coverImage.url}) center/cover no-repeat`,
          }}
        />
      )}
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 24px' }}>
        {post.category && (
          <div
            style={{
              fontSize: '11px',
              fontWeight: 500,
              color: '#4285F4',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '12px',
            }}
          >
            {post.category}
          </div>
        )}
        <h1
          style={{
            fontSize: '36px',
            fontWeight: 700,
            color: '#1A1A1A',
            lineHeight: 1.2,
            marginBottom: '16px',
          }}
        >
          {post.title}
        </h1>
        <p style={{ fontSize: '18px', color: '#5F6368', lineHeight: 1.6, marginBottom: '20px' }}>
          {post.excerpt}
        </p>
        <div style={{ fontSize: '12px', color: '#9AA0A6', marginBottom: '40px' }}>
          {dateStr}
          {post.tags && post.tags.length > 0 && <span> · {post.tags.join(', ')}</span>}
        </div>
        {post.content?.html && (
          <div
            style={{ fontSize: '17px', lineHeight: 1.8, color: '#1A1A1A' }}
            dangerouslySetInnerHTML={{ __html: post.content.html }}
          />
        )}
      </div>
    </main>
  )
}

export default function PostPage() {
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
        <PostContent />
      </Suspense>
      <Footer />
    </>
  )
}
