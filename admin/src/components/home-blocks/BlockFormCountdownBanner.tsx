interface Props {
  props: Record<string, unknown>
  onChange: (props: Record<string, unknown>) => void
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

export function BlockFormCountdownBanner({ props, onChange }: Props) {
  function update(key: string, value: unknown) {
    onChange({ ...props, [key]: value })
  }

  const mode = (props['mode'] as string) ?? 'next_upcoming'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div>
        <label style={labelStyle}>Eyebrow (opcional)</label>
        <input
          type="text"
          value={(props['eyebrow'] as string) ?? ''}
          onChange={(e) => update('eyebrow', e.target.value)}
          placeholder="Ex: Próximo evento"
          style={inputStyle}
        />
      </div>
      <div>
        <label style={labelStyle}>Título</label>
        <input
          type="text"
          value={(props['title'] as string) ?? ''}
          onChange={(e) => update('title', e.target.value)}
          style={inputStyle}
        />
      </div>
      <div>
        <label style={labelStyle}>Label do countdown (opcional)</label>
        <input
          type="text"
          value={(props['label'] as string) ?? ''}
          onChange={(e) => update('label', e.target.value)}
          placeholder="Ex: Faltam"
          style={inputStyle}
        />
      </div>
      <div>
        <label style={labelStyle}>Modo</label>
        <select
          value={mode}
          onChange={(e) => update('mode', e.target.value)}
          style={{ ...inputStyle, cursor: 'pointer' }}
        >
          <option value="next_upcoming">Próximo evento automaticamente</option>
          <option value="linked_event">Evento específico</option>
        </select>
      </div>
      {mode === 'linked_event' && (
        <div>
          <label style={labelStyle}>ID do evento</label>
          <input
            type="text"
            value={(props['linkedEventId'] as string) ?? ''}
            onChange={(e) => update('linkedEventId', e.target.value)}
            placeholder="ID do Firestore"
            style={inputStyle}
          />
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div>
          <label style={labelStyle}>Tema</label>
          <select
            value={(props['themeVariant'] as string) ?? 'brand'}
            onChange={(e) => update('themeVariant', e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="brand">Brand</option>
            <option value="accent">Accent</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Overlay</label>
          <select
            value={(props['overlayVariant'] as string) ?? 'dark'}
            onChange={(e) => update('overlayVariant', e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            <option value="none">Nenhum</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div>
          <label style={labelStyle}>Texto do CTA (opcional)</label>
          <input
            type="text"
            value={(props['ctaLabel'] as string) ?? ''}
            onChange={(e) => update('ctaLabel', e.target.value)}
            placeholder="Ver evento"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>URL do CTA</label>
          <input
            type="text"
            value={(props['ctaUrl'] as string) ?? ''}
            onChange={(e) => update('ctaUrl', e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>
      <div>
        <label style={labelStyle}>URL da imagem desktop</label>
        <input
          type="text"
          value={((props['desktopImage'] as Record<string, string>) ?? {})['url'] ?? ''}
          onChange={(e) =>
            update('desktopImage', {
              ...((props['desktopImage'] as object) ?? {}),
              url: e.target.value,
            })
          }
          style={inputStyle}
        />
      </div>
      <div>
        <label style={labelStyle}>URL da imagem mobile</label>
        <input
          type="text"
          value={((props['mobileImage'] as Record<string, string>) ?? {})['url'] ?? ''}
          onChange={(e) =>
            update('mobileImage', {
              ...((props['mobileImage'] as object) ?? {}),
              url: e.target.value,
            })
          }
          style={inputStyle}
        />
      </div>
    </div>
  )
}
