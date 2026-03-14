'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Badge } from '@/components/ui/Badge'
import { listPosts, publishPost, archivePost, formatDate, type PostListItem } from '@/lib/api/posts'

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

export default function PostsPage() {
  const [posts, setPosts] = useState<PostListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const router = useRouter()

  async function loadPosts() {
    try {
      setLoading(true)
      const res = await listPosts()
      setPosts(res.posts)
    } catch (_err) {
      setError('Erro ao carregar posts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPosts()
  }, [])

  async function handlePublish(postId: string) {
    setActionLoading(postId)
    try {
      await publishPost(postId)
      await loadPosts()
    } catch (_err) {
      setError('Erro ao publicar post')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleArchive(postId: string) {
    setActionLoading(postId)
    try {
      await archivePost(postId)
      await loadPosts()
    } catch (_err) {
      setError('Erro ao arquivar post')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <AdminLayout title="Posts">
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
              Posts
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Blog e histórico da comunidade
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard/posts/novo')}
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
            Novo post
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
              Carregando posts...
            </div>
          ) : posts.length === 0 ? (
            <div
              style={{
                padding: '40px',
                textAlign: 'center',
                fontSize: '13px',
                color: 'var(--text-tertiary)',
              }}
            >
              Nenhum post cadastrado ainda.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '0.5px solid var(--border-default)' }}>
                  {['Título', 'Criado em', 'Flags', 'Status', 'Ações'].map((col) => (
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
                {posts.map((post, index) => (
                  <tr
                    key={post.id}
                    style={{
                      borderBottom:
                        index < posts.length - 1 ? '0.5px solid var(--border-default)' : 'none',
                    }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div
                        style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}
                      >
                        {post.title}
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: 'var(--text-tertiary)',
                          marginTop: '2px',
                        }}
                      >
                        /{post.slug}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {formatDate(post.createdAt._seconds)}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {post.featuredOnHome && <Badge label="home" variant="blue" />}
                        {post.showInCommunityHistory && <Badge label="histórico" variant="green" />}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Badge
                        label={statusLabel[post.status] ?? post.status}
                        variant={statusVariant[post.status] ?? 'gray'}
                      />
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {post.status === 'draft' && (
                          <button
                            onClick={() => handlePublish(post.id)}
                            disabled={actionLoading === post.id}
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
                        {post.status !== 'archived' && (
                          <button
                            onClick={() => handleArchive(post.id)}
                            disabled={actionLoading === post.id}
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
