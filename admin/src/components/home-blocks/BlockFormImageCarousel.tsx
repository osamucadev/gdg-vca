interface CarouselImage {
  url: string
  alt: string
  href?: string
  target?: string
}

interface Props {
  props: Record<string, unknown>
  onChange: (props: Record<string, unknown>) => void
}

const inputStyle = {
  width: '100%',
  height: '34px',
  padding: '0 8px',
  background: 'var(--bg-base)',
  border: '0.5px solid var(--border-default)',
  borderRadius: 'var(--radius-md)',
  fontSize: '12px',
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

export function BlockFormImageCarousel({ props, onChange }: Props) {
  function update(key: string, value: unknown) {
    onChange({ ...props, [key]: value })
  }

  const images: CarouselImage[] = (props['images'] as CarouselImage[]) ?? []

  function updateImage(index: number, key: string, value: string) {
    const next = images.map((img, i) => (i === index ? { ...img, [key]: value } : img))
    update('images', next)
  }

  function addImage() {
    update('images', [...images, { url: '', alt: '' }])
  }

  function removeImage(index: number) {
    update(
      'images',
      images.filter((_, i) => i !== index),
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div>
        <label style={labelStyle}>Título (opcional)</label>
        <input
          type="text"
          value={(props['title'] as string) ?? ''}
          onChange={(e) => update('title', e.target.value)}
          style={{ ...inputStyle, height: '36px', fontSize: '13px', padding: '0 10px' }}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div>
          <label style={labelStyle}>Proporção</label>
          <select
            value={(props['aspectRatioVariant'] as string) ?? 'landscape'}
            onChange={(e) => update('aspectRatioVariant', e.target.value)}
            style={{
              ...inputStyle,
              height: '36px',
              fontSize: '13px',
              padding: '0 10px',
              cursor: 'pointer',
            }}
          >
            <option value="landscape">Paisagem</option>
            <option value="square">Quadrado</option>
            <option value="banner">Banner</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '2px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={(props['autoplay'] as boolean) ?? false}
              onChange={(e) => update('autoplay', e.target.checked)}
            />
            <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Autoplay</span>
          </label>
        </div>
      </div>

      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px',
          }}
        >
          <label style={{ ...labelStyle, marginBottom: 0 }}>Imagens</label>
          <button
            type="button"
            onClick={addImage}
            style={{
              height: '26px',
              padding: '0 10px',
              background: 'var(--gdg-blue-bg)',
              border: '0.5px solid var(--gdg-blue)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              fontWeight: 500,
              color: 'var(--gdg-blue)',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
            }}
          >
            + Adicionar
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {images.map((img, index) => (
            <div
              key={index}
              style={{
                padding: '12px',
                background: 'var(--bg-base)',
                border: '0.5px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '4px',
                }}
              >
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                  Imagem {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '11px',
                    color: 'var(--gdg-red)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  Remover
                </button>
              </div>
              <input
                type="text"
                value={img.url}
                onChange={(e) => updateImage(index, 'url', e.target.value)}
                placeholder="URL da imagem"
                style={inputStyle}
              />
              <input
                type="text"
                value={img.alt}
                onChange={(e) => updateImage(index, 'alt', e.target.value)}
                placeholder="Texto alternativo"
                style={inputStyle}
              />
              <input
                type="text"
                value={img.href ?? ''}
                onChange={(e) => updateImage(index, 'href', e.target.value)}
                placeholder="Link (opcional)"
                style={inputStyle}
              />
            </div>
          ))}
          {images.length === 0 && (
            <div
              style={{
                padding: '20px',
                textAlign: 'center',
                fontSize: '12px',
                color: 'var(--text-tertiary)',
              }}
            >
              Nenhuma imagem adicionada ainda
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
