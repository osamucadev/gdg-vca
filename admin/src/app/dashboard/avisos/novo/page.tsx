'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { createAnnouncement } from '@/lib/api/announcements'

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
  kind: string
  summary: string
  priority: string
  startsAt: string
  endsAt: string
  featuredOnHome: boolean
  countdownEnabled: boolean
  homeZones: string[]
  ctaLabel: string
  ctaUrl: string
}

const initialState: FormState = {
  title: '',
  slug: '',
  kind: 'general',
  summary: '',
  priority: '0',
  startsAt: '',
  endsAt: '',
  featuredOnHome: false,
  countdownEnabled: false,
  homeZones: [],
  ctaLabel: '',
  ctaUrl: '',
}

const HOME_ZONES = [
  { value: 'home_banner', label: 'Banner da Home' },
  { value: 'home_carousel', label: 'Carrossel da Home' },
  { value: 'announcements_page', label: 'Página de avisos' },
]

export default function NovoAvisoPage() {
  const [form, setForm] = useState<FormState>(initialState)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  function handleChange(field: keyof FormState, value: string | boolean | string[]) {
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

  function handleZoneToggle(zone: string) {
    setForm((prev) => ({
      ...prev,
      homeZones: prev.homeZones.includes(zone)
        ? prev.homeZones.filter((z) => z !== zone)
        : [...prev.homeZones, zone],
    }))
  }

  async function handleSubmit(e: React.FormEvent, action: 'save' | 'publish') {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const payload = {
        title: form.title,
        slug: form.slug,
        kind: form.kind,
        summary: form.summary,
        content: { json: { type: 'doc', content: [] } },
        priority: parseInt(form.priority) || 0,
        startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : undefined,
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : undefined,
        featuredOnHome: form.featuredOnHome,
        countdownEnabled: form.countdownEnabled,
        homeZones: form.homeZones,
        cta: form.ctaLabel && form.ctaUrl ? { label: form.ctaLabel, url: form.ctaUrl } : undefined,
      }

      const result = await createAnnouncement(payload)

      if (action === 'publish') {
        const { publishAnnouncement } = await import('@/lib/api/announcements')
        await publishAnnouncement(result.id)
      }

      router.push('/dashboard/avisos')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar aviso')
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
    <AdminLayout title="Novo aviso">
      <div style={{ maxWidth: '680px' }}>
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => router.push('/dashboard/avisos')}
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
            ← Voltar para avisos
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
                  placeholder="Título do aviso"
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
                  placeholder="titulo-do-aviso"
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Tipo</label>
                  <select
                    value={form.kind}
                    onChange={(e) => handleChange('kind', e.target.value)}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    <option value="general">Geral</option>
                    <option value="reminder">Lembrete</option>
                    <option value="opportunity">Oportunidade</option>
                    <option value="highlight">Destaque</option>
                    <option value="partner">Parceiro</option>
                    <option value="call">Chamada</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Prioridade</label>
                  <input
                    type="number"
                    value={form.priority}
                    onChange={(e) => handleChange('priority', e.target.value)}
                    min="0"
                    max="100"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Resumo</label>
                <textarea
                  value={form.summary}
                  onChange={(e) => handleChange('summary', e.target.value)}
                  required
                  placeholder="Descrição curta do aviso"
                  rows={3}
                  style={{ ...inputStyle, height: 'auto', padding: '8px 10px', resize: 'vertical' }}
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
                Período de exibição
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Início (opcional)</label>
                  <input
                    type="datetime-local"
                    value={form.startsAt}
                    onChange={(e) => handleChange('startsAt', e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Término (opcional)</label>
                  <input
                    type="datetime-local"
                    value={form.endsAt}
                    onChange={(e) => handleChange('endsAt', e.target.value)}
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
                CTA (opcional)
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Texto do botão</label>
                  <input
                    type="text"
                    value={form.ctaLabel}
                    onChange={(e) => handleChange('ctaLabel', e.target.value)}
                    placeholder="Ex: Saiba mais"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>URL</label>
                  <input
                    type="url"
                    value={form.ctaUrl}
                    onChange={(e) => handleChange('ctaUrl', e.target.value)}
                    placeholder="https://..."
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
                Configurações de exibição
              </div>

              <div>
                <label style={labelStyle}>Zonas da Home</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {HOME_ZONES.map((zone) => (
                    <label
                      key={zone.value}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={form.homeZones.includes(zone.value)}
                        onChange={() => handleZoneToggle(zone.value)}
                      />
                      <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                        {zone.label}
                      </span>
                    </label>
                  ))}
                </div>
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
                onClick={() => router.push('/dashboard/avisos')}
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
