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

export function BlockFormAnnouncementsCarousel({ props, onChange }: Props) {
  function update(key: string, value: unknown) {
    onChange({ ...props, [key]: value })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div>
        <label style={labelStyle}>Título (opcional)</label>
        <input
          type="text"
          value={(props['title'] as string) ?? ''}
          onChange={(e) => update('title', e.target.value)}
          placeholder="Ex: Avisos"
          style={inputStyle}
        />
      </div>
      <div>
        <label style={labelStyle}>Zona</label>
        <select
          value={(props['zone'] as string) ?? 'home_carousel'}
          onChange={(e) => update('zone', e.target.value)}
          style={{ ...inputStyle, cursor: 'pointer' }}
        >
          <option value="home_banner">Banner da Home</option>
          <option value="home_carousel">Carrossel da Home</option>
          <option value="announcements_page">Página de avisos</option>
        </select>
      </div>
      <div>
        <label style={labelStyle}>Máximo de itens</label>
        <input
          type="number"
          value={(props['maxItems'] as number) ?? 4}
          onChange={(e) => update('maxItems', parseInt(e.target.value))}
          min="1"
          max="12"
          style={inputStyle}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div>
          <label style={labelStyle}>Texto do CTA (opcional)</label>
          <input
            type="text"
            value={(props['ctaLabel'] as string) ?? ''}
            onChange={(e) => update('ctaLabel', e.target.value)}
            placeholder="Ver todos"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>URL do CTA</label>
          <input
            type="text"
            value={(props['ctaUrl'] as string) ?? ''}
            onChange={(e) => update('ctaUrl', e.target.value)}
            placeholder="/avisos"
            style={inputStyle}
          />
        </div>
      </div>
    </div>
  )
}
