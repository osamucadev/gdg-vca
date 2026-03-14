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

export function BlockFormCtaBanner({ props, onChange }: Props) {
  function update(key: string, value: unknown) {
    onChange({ ...props, [key]: value })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div>
        <label style={labelStyle}>Eyebrow (opcional)</label>
        <input
          type="text"
          value={(props['eyebrow'] as string) ?? ''}
          onChange={(e) => update('eyebrow', e.target.value)}
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
        <label style={labelStyle}>Subtítulo (opcional)</label>
        <input
          type="text"
          value={(props['subtitle'] as string) ?? ''}
          onChange={(e) => update('subtitle', e.target.value)}
          style={inputStyle}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div>
          <label style={labelStyle}>Texto do CTA</label>
          <input
            type="text"
            value={(props['ctaLabel'] as string) ?? ''}
            onChange={(e) => update('ctaLabel', e.target.value)}
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
        <div>
          <label style={labelStyle}>Alinhamento</label>
          <select
            value={(props['contentAlign'] as string) ?? 'center'}
            onChange={(e) => update('contentAlign', e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            <option value="left">Esquerda</option>
            <option value="center">Centro</option>
            <option value="right">Direita</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Fundo</label>
          <select
            value={(props['backgroundVariant'] as string) ?? 'brand'}
            onChange={(e) => update('backgroundVariant', e.target.value)}
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
            value={(props['overlayVariant'] as string) ?? 'none'}
            onChange={(e) => update('overlayVariant', e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            <option value="none">Nenhum</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
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
