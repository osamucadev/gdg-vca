'use client'

import { useState, useRef } from 'react'
import HCaptcha from '@hcaptcha/react-hcaptcha'

interface Props {
  title?: string
  subtitle?: string
  submitLabel?: string
  successMessage?: string
  privacyNote?: string
}

export function ContactForm({ title, subtitle, submitLabel, successMessage, privacyNote }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const captchaRef = useRef<HCaptcha>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!captchaToken) {
      setError('Por favor, complete o captcha.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`${process.env['NEXT_PUBLIC_API_URL']}/api/v1/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message, captchaToken }),
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.error?.message ?? 'Erro ao enviar mensagem.')
        captchaRef.current?.resetCaptcha()
        setCaptchaToken(null)
        return
      }

      setSuccess(true)
      setName('')
      setEmail('')
      setSubject('')
      setMessage('')
      setCaptchaToken(null)
      captchaRef.current?.resetCaptcha()
    } catch (_err) {
      setError('Erro ao enviar mensagem. Tente novamente.')
      captchaRef.current?.resetCaptcha()
      setCaptchaToken(null)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    height: '40px',
    padding: '0 12px',
    border: '0.5px solid rgba(0,0,0,0.15)',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit',
  }

  const labelStyle = {
    display: 'block' as const,
    fontSize: '12px',
    color: '#5F6368',
    marginBottom: '6px',
  }

  if (success) {
    return (
      <section id="contato" style={{ padding: '80px 24px', background: 'white' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: '#E6F4EA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '20px',
            }}
          >
            ✓
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1A1A1A', marginBottom: '8px' }}>
            Mensagem enviada!
          </h2>
          <p style={{ fontSize: '14px', color: '#5F6368', lineHeight: 1.6 }}>
            {successMessage ?? 'Em breve entraremos em contato.'}
          </p>
        </div>
      </section>
    )
  }

  return (
    <section id="contato" style={{ padding: '80px 24px', background: 'white' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>
        {title && (
          <h2
            style={{
              fontSize: '28px',
              fontWeight: 600,
              color: '#1A1A1A',
              marginBottom: '8px',
              textAlign: 'center',
            }}
          >
            {title}
          </h2>
        )}
        {subtitle && (
          <p
            style={{
              fontSize: '14px',
              color: '#5F6368',
              marginBottom: '32px',
              textAlign: 'center',
              lineHeight: 1.6,
            }}
          >
            {subtitle}
          </p>
        )}
        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Nome</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Assunto</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Mensagem</label>
            <textarea
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ ...inputStyle, height: 'auto', padding: '10px 12px', resize: 'vertical' }}
            />
          </div>
          {privacyNote && (
            <p style={{ fontSize: '11px', color: '#9AA0A6', lineHeight: 1.5 }}>{privacyNote}</p>
          )}
          <HCaptcha
            ref={captchaRef}
            sitekey={process.env['NEXT_PUBLIC_HCAPTCHA_SITE_KEY'] ?? ''}
            onVerify={(token) => setCaptchaToken(token)}
            onExpire={() => setCaptchaToken(null)}
          />
          {error && (
            <div
              style={{
                padding: '10px 12px',
                background: '#FCE8E6',
                border: '0.5px solid #EA4335',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#EA4335',
              }}
            >
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading || !captchaToken}
            style={{
              height: '44px',
              background: loading || !captchaToken ? '#9AA0A6' : '#4285F4',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              color: 'white',
              cursor: loading || !captchaToken ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {loading ? 'Enviando...' : (submitLabel ?? 'Enviar mensagem')}
          </button>
        </form>
      </div>
    </section>
  )
}
