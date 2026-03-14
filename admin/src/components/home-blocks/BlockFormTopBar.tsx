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

export function BlockFormTopBar({ props, onChange }: Props) {
  function update(key: string, value: unknown) {
    onChange({ ...props, [key]: value })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div>
        <label style={labelStyle}>Texto</label>
        <input
          type="text"
          value={(props['text'] as string) ?? ''}
          onChange={(e) => update('text', e.target.value)}
          style={inputStyle}
        />
      </div>
      <div>
        <label style={labelStyle}>Variante</label>
        <select
          value={(props['variant'] as string) ?? 'brand'}
          onChange={(e) => update('variant', e.target.value)}
          style={{ ...inputStyle, cursor: 'pointer' }}
        >
          <option value="brand">Brand</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="success">Success</option>
        </select>
      </div>
      <div>
        <label style={labelStyle}>Texto do link (opcional)</label>
        <input
          type="text"
          value={(props['linkLabel'] as string) ?? ''}
          onChange={(e) => update('linkLabel', e.target.value)}
          placeholder="Ex: Saiba mais"
          style={inputStyle}
        />
      </div>
      <div>
        <label style={labelStyle}>URL do link (opcional)</label>
        <input
          type="text"
          value={(props['linkUrl'] as string) ?? ''}
          onChange={(e) => update('linkUrl', e.target.value)}
          placeholder="https://..."
          style={inputStyle}
        />
      </div>
      <div>
        <label style={labelStyle}>Alvo do link</label>
        <select
          value={(props['linkTarget'] as string) ?? 'same_tab'}
          onChange={(e) => update('linkTarget', e.target.value)}
          style={{ ...inputStyle, cursor: 'pointer' }}
        >
          <option value="same_tab">Mesma aba</option>
          <option value="new_tab">Nova aba</option>
        </select>
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={(props['closable'] as boolean) ?? false}
          onChange={(e) => update('closable', e.target.checked)}
        />
        <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
          Pode ser fechado pelo usuário
        </span>
      </label>
    </div>
  )
}
