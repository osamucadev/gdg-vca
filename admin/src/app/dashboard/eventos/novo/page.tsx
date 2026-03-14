'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { createEvent } from '@/lib/api/events'

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
  summary: string
  startAt: string
  endAt: string
  locationName: string
  locationAddress: string
  locationType: 'presential' | 'online' | 'hybrid'
  locationMapUrl: string
  registrationUrl: string
  featuredOnHome: boolean
  countdownEnabled: boolean
}

const initialState: FormState = {
  title: '',
  slug: '',
  summary: '',
  startAt: '',
  endAt: '',
  locationName: '',
  locationAddress: '',
  locationType: 'presential',
  locationMapUrl: '',
  registrationUrl: '',
  featuredOnHome: false,
  countdownEnabled: false,
}

export default function NovoEventoPage() {
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
        summary: form.summary,
        content: { json: { type: 'doc', content: [] } },
        startAt: new Date(form.startAt).toISOString(),
        endAt: form.endAt ? new Date(form.endAt).toISOString() : undefined,
        location: {
          name: form.locationName,
          address: form.locationAddress,
          type: form.locationType,
          mapUrl: form.locationMapUrl || undefined,
        },
        registrationUrl: form.registrationUrl || undefined,
        featuredOnHome: form.featuredOnHome,
        countdownEnabled: form.countdownEnabled,
      }

      const result = await createEvent(payload)

      if (action === 'publish') {
        const { publishEvent } = await import('@/lib/api/events')
        await publishEvent(result.id)
      }

      router.push('/dashboard/eventos')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar evento')
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
    <AdminLayout title="Novo evento">
      <div style={{ maxWidth: '680px' }}>
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => router.push('/dashboard/eventos')}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            ← Voltar para eventos
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
                  placeholder="Ex: Meetup GDG Abril 2026"
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
                  placeholder="meetup-gdg-abril-2026"
                  style={inputStyle}
                />
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                  URL pública: /eventos/{form.slug || 'slug-do-evento'}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Resumo</label>
                <textarea
                  value={form.summary}
                  onChange={(e) => handleChange('summary', e.target.value)}
                  required
                  placeholder="Descrição curta do evento"
                  rows={3}
                  style={{
                    ...inputStyle,
                    height: 'auto',
                    padding: '8px 10px',
                    resize: 'vertical',
                  }}
                />
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
                Data e horário
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Início</label>
                  <input
                    type="datetime-local"
                    value={form.startAt}
                    onChange={(e) => handleChange('startAt', e.target.value)}
                    required
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Término (opcional)</label>
                  <input
                    type="datetime-local"
                    value={form.endAt}
                    onChange={(e) => handleChange('endAt', e.target.value)}
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
                Local
              </div>

              <div>
                <label style={labelStyle}>Nome do local</label>
                <input
                  type="text"
                  value={form.locationName}
                  onChange={(e) => handleChange('locationName', e.target.value)}
                  required
                  placeholder="Ex: Espaço Tech VCA"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Endereço</label>
                <input
                  type="text"
                  value={form.locationAddress}
                  onChange={(e) => handleChange('locationAddress', e.target.value)}
                  required
                  placeholder="Ex: Vitória da Conquista, BA"
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Tipo</label>
                  <select
                    value={form.locationType}
                    onChange={(e) => handleChange('locationType', e.target.value)}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    <option value="presential">Presencial</option>
                    <option value="online">Online</option>
                    <option value="hybrid">Híbrido</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Link do mapa (opcional)</label>
                  <input
                    type="url"
                    value={form.locationMapUrl}
                    onChange={(e) => handleChange('locationMapUrl', e.target.value)}
                    placeholder="https://maps.google.com/..."
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
                Configurações
              </div>

              <div>
                <label style={labelStyle}>Link de inscrição (opcional)</label>
                <input
                  type="url"
                  value={form.registrationUrl}
                  onChange={(e) => handleChange('registrationUrl', e.target.value)}
                  placeholder="https://..."
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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

                <label
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                >
                  <input
                    type="checkbox"
                    checked={form.countdownEnabled}
                    onChange={(e) => handleChange('countdownEnabled', e.target.checked)}
                  />
                  <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                    Ativar countdown
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
                onClick={() => router.push('/dashboard/eventos')}
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
