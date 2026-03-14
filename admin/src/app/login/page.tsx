'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from '@/lib/firebase/auth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await signIn(email, password)
      router.push('/dashboard')
    } catch (_err) {
      setError('E-mail ou senha incorretos. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--bg-base)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '360px',
          padding: '0 16px',
        }}
      >
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '3px',
              width: '28px',
              margin: '0 auto 16px',
            }}
          >
            <div
              style={{
                width: '12px',
                height: '12px',
                background: 'var(--gdg-blue)',
                borderRadius: '3px',
              }}
            />
            <div
              style={{
                width: '12px',
                height: '12px',
                background: 'var(--gdg-red)',
                borderRadius: '3px',
              }}
            />
            <div
              style={{
                width: '12px',
                height: '12px',
                background: 'var(--gdg-yellow)',
                borderRadius: '3px',
              }}
            />
            <div
              style={{
                width: '12px',
                height: '12px',
                background: 'var(--gdg-green)',
                borderRadius: '3px',
              }}
            />
          </div>
          <div
            style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              marginTop: '4px',
            }}
          >
            GDG Vitória da Conquista
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-surface)',
            border: '0.5px solid var(--border-default)',
            borderRadius: 'var(--radius-xl)',
            padding: '28px',
          }}
        >
          <h1
            style={{
              fontSize: '16px',
              fontWeight: 500,
              color: 'var(--text-primary)',
              marginBottom: '20px',
            }}
          >
            Entrar no painel
          </h1>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '12px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  marginBottom: '6px',
                }}
              >
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                style={{
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
                  transition: 'border-color 0.1s',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--gdg-blue)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border-default)')}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  marginBottom: '6px',
                }}
              >
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={{
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
                  transition: 'border-color 0.1s',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--gdg-blue)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border-default)')}
              />
            </div>

            {error && (
              <div
                style={{
                  marginBottom: '16px',
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

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: '36px',
                background: loading ? 'var(--border-default)' : 'var(--gdg-blue)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                fontWeight: 500,
                color: loading ? 'var(--text-secondary)' : 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-sans)',
                transition: 'background 0.1s',
              }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
