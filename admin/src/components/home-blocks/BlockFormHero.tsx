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

const sectionTitleStyle = {
  fontSize: '11px',
  fontWeight: 500,
  color: 'var(--text-tertiary)',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
  marginBottom: '10px',
  marginTop: '4px',
}

export function BlockFormHero({ props, onChange }: Props) {
  function update(key: string, value: unknown) {
    onChange({ ...props, [key]: value })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={sectionTitleStyle}>Conteúdo</div>

      <div>
        <label style={labelStyle}>Eyebrow (opcional)</label>
        <input
          type="text"
          value={(props['eyebrow'] as string) ?? ''}
          onChange={(e) => update('eyebrow', e.target.value)}
          placeholder="Ex: Comunidade local"
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

      <div style={sectionTitleStyle}>CTA principal</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div>
          <label style={labelStyle}>Texto do botão</label>
          <input
            type="text"
            value={(props['ctaLabel'] as string) ?? ''}
            onChange={(e) => update('ctaLabel', e.target.value)}
            placeholder="Ex: Ver eventos"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>URL</label>
          <input
            type="text"
            value={(props['ctaUrl'] as string) ?? ''}
            onChange={(e) => update('ctaUrl', e.target.value)}
            placeholder="/eventos"
            style={inputStyle}
          />
        </div>
      </div>
      <div>
        <label style={labelStyle}>Alvo</label>
        <select
          value={(props['ctaTarget'] as string) ?? 'same_tab'}
          onChange={(e) => update('ctaTarget', e.target.value)}
          style={{ ...inputStyle, cursor: 'pointer' }}
        >
          <option value="same_tab">Mesma aba</option>
          <option value="new_tab">Nova aba</option>
        </select>
      </div>

      <div style={sectionTitleStyle}>CTA secundário (opcional)</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div>
          <label style={labelStyle}>Texto do botão</label>
          <input
            type="text"
            value={(props['secondaryCtaLabel'] as string) ?? ''}
            onChange={(e) => update('secondaryCtaLabel', e.target.value)}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>URL</label>
          <input
            type="text"
            value={(props['secondaryCtaUrl'] as string) ?? ''}
            onChange={(e) => update('secondaryCtaUrl', e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>
      <div>
        <label style={labelStyle}>Alvo</label>
        <select
          value={(props['secondaryCtaTarget'] as string) ?? 'same_tab'}
          onChange={(e) => update('secondaryCtaTarget', e.target.value)}
          style={{ ...inputStyle, cursor: 'pointer' }}
        >
          <option value="same_tab">Mesma aba</option>
          <option value="new_tab">Nova aba</option>
        </select>
      </div>

      <div style={sectionTitleStyle}>Visual</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
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
          <label style={labelStyle}>Tema</label>
          <select
            value={(props['themeVariant'] as string) ?? 'dark'}
            onChange={(e) => update('themeVariant', e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="brand">Brand</option>
            <option value="accent">Accent</option>
          </select>
        </div>
      </div>
      <div>
        <label style={labelStyle}>Overlay da imagem</label>
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

      <div style={sectionTitleStyle}>Imagens</div>

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
          placeholder="https://storage.googleapis.com/..."
          style={inputStyle}
        />
      </div>
      <div>
        <label style={labelStyle}>Alt da imagem desktop</label>
        <input
          type="text"
          value={((props['desktopImage'] as Record<string, string>) ?? {})['alt'] ?? ''}
          onChange={(e) =>
            update('desktopImage', {
              ...((props['desktopImage'] as object) ?? {}),
              alt: e.target.value,
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
          placeholder="https://storage.googleapis.com/..."
          style={inputStyle}
        />
      </div>
      <div>
        <label style={labelStyle}>Alt da imagem mobile</label>
        <input
          type="text"
          value={((props['mobileImage'] as Record<string, string>) ?? {})['alt'] ?? ''}
          onChange={(e) =>
            update('mobileImage', {
              ...((props['mobileImage'] as object) ?? {}),
              alt: e.target.value,
            })
          }
          style={inputStyle}
        />
      </div>
    </div>
  )
}
