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

export function BlockFormContactForm({ props, onChange }: Props) {
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
          placeholder="Entre em contato"
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
      <div>
        <label style={labelStyle}>Texto do botão de envio</label>
        <input
          type="text"
          value={(props['submitLabel'] as string) ?? ''}
          onChange={(e) => update('submitLabel', e.target.value)}
          placeholder="Enviar mensagem"
          style={inputStyle}
        />
      </div>
      <div>
        <label style={labelStyle}>Mensagem de sucesso</label>
        <input
          type="text"
          value={(props['successMessage'] as string) ?? ''}
          onChange={(e) => update('successMessage', e.target.value)}
          placeholder="Mensagem enviada!"
          style={inputStyle}
        />
      </div>
      <div>
        <label style={labelStyle}>Nota de privacidade (opcional)</label>
        <input
          type="text"
          value={(props['privacyNote'] as string) ?? ''}
          onChange={(e) => update('privacyNote', e.target.value)}
          placeholder="Ao enviar, você concorda..."
          style={inputStyle}
        />
      </div>
    </div>
  )
}
