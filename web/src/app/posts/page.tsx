import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { getPublishedPosts } from '@/lib/data/posts'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Posts',
  description: 'Blog e histórico da comunidade GDG Vitória da Conquista',
}

export default async function PostsPage() {
  const posts = await getPublishedPosts()

  return (
    <>
      <Header />
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#1A1A1A', marginBottom: '8px' }}>
          Posts
        </h1>
        <p style={{ fontSize: '14px', color: '#5F6368', marginBottom: '48px' }}>
          Artigos, relatos e histórico da comunidade
        </p>

        {posts.length === 0 ? (
          <div
            style={{ textAlign: 'center', padding: '80px 0', fontSize: '14px', color: '#9AA0A6' }}
          >
            Nenhum post publicado ainda.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '24px',
            }}
          >
            {posts.map((post) => {
              const date = new Date(post.publishedAt._seconds * 1000)
              const dateStr = date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })

              return (
                <a
                  key={post.id}
                  href={`/posts/slug?slug=${post.slug}`}
                  style={{
                    display: 'block',
                    background: 'white',
                    border: '0.5px solid rgba(0,0,0,0.08)',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    textDecoration: 'none',
                  }}
                >
                  {post.coverImage && (
                    <div
                      style={{
                        height: '180px',
                        background: `url(${post.coverImage.url}) center/cover no-repeat`,
                      }}
                    />
                  )}
                  <div style={{ padding: '20px' }}>
                    {post.category && (
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#4285F4',
                          fontWeight: 500,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          marginBottom: '8px',
                        }}
                      >
                        {post.category}
                      </div>
                    )}
                    <div
                      style={{
                        fontSize: '17px',
                        fontWeight: 600,
                        color: '#1A1A1A',
                        marginBottom: '8px',
                        lineHeight: 1.3,
                      }}
                    >
                      {post.title}
                    </div>
                    <div
                      style={{
                        fontSize: '13px',
                        color: '#5F6368',
                        lineHeight: 1.6,
                        marginBottom: '16px',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {post.excerpt}
                    </div>
                    <div style={{ fontSize: '11px', color: '#9AA0A6' }}>{dateStr}</div>
                  </div>
                </a>
              )
            })}
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
