import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { getPublishedPosts, getPostBySlug } from '@/lib/data/posts'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return {}
  return {
    title: post.seo?.title ?? post.title,
    description: post.seo?.description ?? post.excerpt,
    openGraph: {
      title: post.seo?.title ?? post.title,
      description: post.seo?.description ?? post.excerpt,
      images: post.seo?.ogImage ? [post.seo.ogImage] : post.coverImage ? [post.coverImage.url] : [],
    },
  }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) notFound()

  const date = new Date(post.publishedAt._seconds * 1000)
  const dateStr = date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <>
      <Header />
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
          <div style={{ marginBottom: '40px' }}>
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
            <p
              style={{ fontSize: '18px', color: '#5F6368', lineHeight: 1.6, marginBottom: '20px' }}
            >
              {post.excerpt}
            </p>
            <div style={{ fontSize: '12px', color: '#9AA0A6' }}>
              {dateStr}
              {post.tags && post.tags.length > 0 && <span> · {post.tags.join(', ')}</span>}
            </div>
          </div>

          {post.content?.html &&
            post.content.html !== JSON.stringify({ type: 'doc', content: [] }) && (
              <div
                style={{ fontSize: '17px', lineHeight: 1.8, color: '#1A1A1A' }}
                dangerouslySetInnerHTML={{ __html: post.content.html }}
              />
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
    const posts = await getPublishedPosts()
    return posts.map((p) => ({ slug: p.slug }))
  } catch (err) {
    console.error('generateStaticParams error:', err)
    return []
  }
}
