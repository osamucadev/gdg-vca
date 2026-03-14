'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { createPost } from '@/lib/api/posts'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

interface FormState {
  title: string
  slug: string
  excerpt: string
  category: string
  tags: string
  relatedEventId: string
  showInCommunityHistory: boolean
  historyDate: string
  featuredOnHome: boolean
}

const initialState: FormState = {
  title: '',
  slug: '',
  excerpt: '',
  category: '',
  tags: '',
  relatedEventId: '',
  showInCommunityHistory: false,
  historyDate: '',
  featuredOnHome: false,
}

export default function NovoPostPage() {
  const [form, setForm] = useState<FormState>(initialState)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  function handleChange(field: keyof FormState, value: string | boolean) {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'title' && !slugManuallyEdited) {
        next.slug = slugify(value as string)
      }
      return next
    })
  }

  function handleSlugChange(value: string) {
    setSlugManuallyEdited(true)
    setForm((prev) => ({ ...prev, slug: slugify(value) }))
  }

  async function handleSubmit(e: React.FormEvent, action: 'save' | 'publish') {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const payload = {
        title: form.title,
        slug: form.slug,
        excerpt: form.excerpt,
        content: { json: { type: 'doc', content: [] } },
        category: form.category || undefined,
        tags: form.tags
          ? form.tags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        relatedEventId: form.relatedEventId || undefined,
        showInCommunityHistory: form.showInCommunityHistory,
        historyDate: form.historyDate ? new Date(form.historyDate).toISOString() : undefined,
        featuredOnHome: form.featuredOnHome,
      }

      const result = await createPost(payload)

      if (action === 'publish') {
        const { publishPost } = await import('@/lib/api/posts')
        await publishPost(result.id)
      }

      router.push('/dashboard/posts')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar post')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    height: '36px',
    padding: '0 10px',
    background: 'var(--bg-base)',
    border: '0.5px solid var(--border-default)',
    borderRadius: 'var(--radius-md)',
    fontSize: '13px',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-sans)',
    outline: 'none',
  }

  const labelStyle = {
    display: 'block' as const,
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginBottom: '6px',
  }

  const sectionStyle = {
    background: 'var(--bg-surface)',
    border: '0.5px solid var(--border-default)',
    borderRadius: 'var(--radius-lg)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '14px',
  }

  return (
    <AdminLayout title="Novo post">
      <div style={{ maxWidth: '680px' }}>
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => router.push('/dashboard/posts')}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              padding: 0,
            }}
          >
            ← Voltar para posts
          </button>
        </div>

        <form onSubmit={(e) => handleSubmit(e, 'save')}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={sectionStyle}>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  marginBottom: '2px',
                }}
              >
                Informações básicas
              </div>

              <div>
                <label style={labelStyle}>Título</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  required
                  placeholder="Título do post"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  required
                  placeholder="titulo-do-post"
                  style={inputStyle}
                />
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                  URL pública: /posts/{form.slug || 'slug-do-post'}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Resumo (excerpt)</label>
                <textarea
                  value={form.excerpt}
                  onChange={(e) => handleChange('excerpt', e.target.value)}
                  required
                  placeholder="Resumo curto exibido nas listagens"
                  rows={3}
                  style={{ ...inputStyle, height: 'auto', padding: '8px 10px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Categoria (opcional)</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    placeholder="Ex: Tutorial, Relato"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Tags (separadas por vírgula)</label>
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e) => handleChange('tags', e.target.value)}
                    placeholder="Ex: android, web, ia"
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            <div style={sectionStyle}>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  marginBottom: '2px',
                }}
              >
                Vínculos e histórico
              </div>

              <div>
                <label style={labelStyle}>ID do evento relacionado (opcional)</label>
                <input
                  type="text"
                  value={form.relatedEventId}
                  onChange={(e) => handleChange('relatedEventId', e.target.value)}
                  placeholder="ID do evento no Firestore"
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                >
                  <input
                    type="checkbox"
                    checked={form.showInCommunityHistory}
                    onChange={(e) => handleChange('showInCommunityHistory', e.target.checked)}
                  />
                  <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                    Incluir no histórico da comunidade
                  </span>
                </label>

                {form.showInCommunityHistory && (
                  <div>
                    <label style={labelStyle}>Data do histórico</label>
                    <input
                      type="date"
                      value={form.historyDate}
                      onChange={(e) => handleChange('historyDate', e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                )}

                <label
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                >
                  <input
                    type="checkbox"
                    checked={form.featuredOnHome}
                    onChange={(e) => handleChange('featuredOnHome', e.target.checked)}
                  />
                  <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                    Destacar na Home
                  </span>
                </label>
              </div>
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

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => router.push('/dashboard/posts')}
                style={{
                  height: '34px',
                  padding: '0 16px',
                  background: 'transparent',
                  border: '0.5px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  height: '34px',
                  padding: '0 16px',
                  background: 'var(--bg-hover)',
                  border: '0.5px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                Salvar rascunho
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={(e) => handleSubmit(e as unknown as React.FormEvent, 'publish')}
                style={{
                  height: '34px',
                  padding: '0 16px',
                  background: 'var(--gdg-blue)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'white',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                {loading ? 'Salvando...' : 'Publicar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
