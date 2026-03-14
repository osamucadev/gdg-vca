'use client'

import { useState } from 'react'
import { BlockFormTopBar } from './BlockFormTopBar'
import { BlockFormHero } from './BlockFormHero'
import { BlockFormCountdownBanner } from './BlockFormCountdownBanner'
import { BlockFormEventsCarousel } from './BlockFormEventsCarousel'
import { BlockFormAnnouncementsCarousel } from './BlockFormAnnouncementsCarousel'
import { BlockFormImageCarousel } from './BlockFormImageCarousel'
import { BlockFormCtaBanner } from './BlockFormCtaBanner'
import { BlockFormContactForm } from './BlockFormContactForm'
import { updateHomeBlock } from '@/lib/api/homeBlocks'

interface Props {
  blockId: string
  type: string
  initialProps: Record<string, unknown>
  onClose: () => void
  onSaved: () => void
}

const blockLabels: Record<string, string> = {
  'top-bar': 'Barra superior',
  hero: 'Hero',
  'countdown-banner': 'Countdown',
  'events-carousel': 'Carrossel de eventos',
  'announcements-carousel': 'Carrossel de avisos',
  'image-carousel': 'Carrossel de imagens',
  'cta-banner': 'Banner CTA',
  'contact-form': 'Formulário de contato',
}

export function HomeBlockPanel({ blockId, type, initialProps, onClose, onSaved }: Props) {
  const [props, setProps] = useState<Record<string, unknown>>(initialProps)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    setError(null)
    setLoading(true)
    try {
      await updateHomeBlock(blockId, { props })
      onSaved()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setLoading(false)
    }
  }

  function renderForm() {
    switch (type) {
      case 'top-bar':
        return <BlockFormTopBar props={props} onChange={setProps} />
      case 'hero':
        return <BlockFormHero props={props} onChange={setProps} />
      case 'countdown-banner':
        return <BlockFormCountdownBanner props={props} onChange={setProps} />
      case 'events-carousel':
        return <BlockFormEventsCarousel props={props} onChange={setProps} />
      case 'announcements-carousel':
        return <BlockFormAnnouncementsCarousel props={props} onChange={setProps} />
      case 'image-carousel':
        return <BlockFormImageCarousel props={props} onChange={setProps} />
      case 'cta-banner':
        return <BlockFormCtaBanner props={props} onChange={setProps} />
      case 'contact-form':
        return <BlockFormContactForm props={props} onChange={setProps} />
      default:
        return (
          <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
            Tipo de bloco desconhecido
          </div>
        )
    }
  }

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.3)',
          zIndex: 40,
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '420px',
          background: 'var(--bg-surface)',
          borderLeft: '0.5px solid var(--border-default)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '0.5px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
            {blockLabels[type] ?? type}
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '18px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              lineHeight: 1,
              padding: '0 4px',
            }}
          >
            ×
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>{renderForm()}</div>

        {error && (
          <div
            style={{
              margin: '0 20px 12px',
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
            padding: '16px 20px',
            borderTop: '0.5px solid var(--border-default)',
            display: 'flex',
            gap: '8px',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onClose}
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
            onClick={handleSave}
            disabled={loading}
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
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </>
  )
}
