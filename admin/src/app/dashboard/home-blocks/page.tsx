'use client'

import { useEffect, useState } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Badge } from '@/components/ui/Badge'
import { HomeBlockPanel } from '@/components/home-blocks/HomeBlockPanel'
import { listHomeBlocks, updateHomeBlock, type HomeBlock } from '@/lib/api/homeBlocks'

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

export default function HomeBlocksPage() {
  const [blocks, setBlocks] = useState<HomeBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingBlock, setEditingBlock] = useState<HomeBlock | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  async function loadBlocks() {
    try {
      setLoading(true)
      const res = await listHomeBlocks()
      setBlocks(res.blocks.sort((a, b) => a.order - b.order))
    } catch (_err) {
      setError('Erro ao carregar blocos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBlocks()
  }, [])

  async function handleToggleEnabled(block: HomeBlock) {
    setActionLoading(block.id)
    try {
      await updateHomeBlock(block.id, { enabled: !block.enabled })
      await loadBlocks()
    } catch (_err) {
      setError('Erro ao atualizar bloco')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleMoveUp(block: HomeBlock) {
    const index = blocks.findIndex((b) => b.id === block.id)
    if (index === 0) return

    const prev = blocks[index - 1]
    setActionLoading(block.id)
    try {
      await Promise.all([
        updateHomeBlock(block.id, { order: prev.order }),
        updateHomeBlock(prev.id, { order: block.order }),
      ])
      await loadBlocks()
    } catch (_err) {
      setError('Erro ao reordenar')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleMoveDown(block: HomeBlock) {
    const index = blocks.findIndex((b) => b.id === block.id)
    if (index === blocks.length - 1) return

    const next = blocks[index + 1]
    setActionLoading(block.id)
    try {
      await Promise.all([
        updateHomeBlock(block.id, { order: next.order }),
        updateHomeBlock(next.id, { order: block.order }),
      ])
      await loadBlocks()
    } catch (_err) {
      setError('Erro ao reordenar')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <AdminLayout title="Home Blocks">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '800px' }}>
        <div>
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 500,
              color: 'var(--text-primary)',
              marginBottom: '4px',
            }}
          >
            Home Blocks
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Configure os blocos exibidos na página inicial do site
          </p>
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

        <div
          style={{
            background: 'var(--bg-surface)',
            border: '0.5px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
          }}
        >
          {loading ? (
            <div
              style={{
                padding: '40px',
                textAlign: 'center',
                fontSize: '13px',
                color: 'var(--text-tertiary)',
              }}
            >
              Carregando blocos...
            </div>
          ) : (
            blocks.map((block, index) => (
              <div
                key={block.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  borderBottom:
                    index < blocks.length - 1 ? '0.5px solid var(--border-default)' : 'none',
                  opacity: block.enabled ? 1 : 0.6,
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <button
                    onClick={() => handleMoveUp(block)}
                    disabled={index === 0 || actionLoading === block.id}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: index === 0 ? 'default' : 'pointer',
                      color: index === 0 ? 'var(--border-default)' : 'var(--text-tertiary)',
                      fontSize: '10px',
                      lineHeight: 1,
                      padding: '2px',
                    }}
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => handleMoveDown(block)}
                    disabled={index === blocks.length - 1 || actionLoading === block.id}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: index === blocks.length - 1 ? 'default' : 'pointer',
                      color:
                        index === blocks.length - 1
                          ? 'var(--border-default)'
                          : 'var(--text-tertiary)',
                      fontSize: '10px',
                      lineHeight: 1,
                      padding: '2px',
                    }}
                  >
                    ▼
                  </button>
                </div>

                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    background: 'var(--bg-base)',
                    border: '0.5px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    color: 'var(--text-tertiary)',
                    fontWeight: 500,
                    flexShrink: 0,
                  }}
                >
                  {block.order}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {blockLabels[block.type] ?? block.type}
                  </div>
                  <div
                    style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}
                  >
                    {block.type}
                  </div>
                </div>

                <Badge
                  label={block.enabled ? 'ativo' : 'inativo'}
                  variant={block.enabled ? 'green' : 'gray'}
                />

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => handleToggleEnabled(block)}
                    disabled={actionLoading === block.id}
                    style={{
                      height: '26px',
                      padding: '0 10px',
                      background: 'var(--bg-hover)',
                      border: '0.5px solid var(--border-default)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '11px',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-sans)',
                    }}
                  >
                    {block.enabled ? 'Desativar' : 'Ativar'}
                  </button>
                  <button
                    onClick={() => setEditingBlock(block)}
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
                    Editar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {editingBlock && (
        <HomeBlockPanel
          blockId={editingBlock.id}
          type={editingBlock.type}
          initialProps={editingBlock.props}
          onClose={() => setEditingBlock(null)}
          onSaved={loadBlocks}
        />
      )}
    </AdminLayout>
  )
}
