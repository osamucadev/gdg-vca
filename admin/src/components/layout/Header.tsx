'use client'

import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import { signOut } from '@/lib/firebase/auth'

interface HeaderProps {
  title: string
}

export function Header({ title }: HeaderProps) {
  const { theme, toggleTheme } = useTheme()
  const { user } = useAuth()
  const router = useRouter()

  async function handleSignOut() {
    await signOut()
    router.push('/login')
  }

  return (
    <header
      style={{
        height: '52px',
        minHeight: '52px',
        background: 'var(--bg-surface)',
        borderBottom: '0.5px solid var(--border-default)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: '12px',
      }}
    >
      <div style={{ flex: 1 }}>
        <span
          style={{
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--text-primary)',
          }}
        >
          {title}
        </span>
      </div>

      <button
        onClick={toggleTheme}
        style={{
          background: 'transparent',
          border: '0.5px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          padding: '5px 10px',
          fontSize: '12px',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          fontFamily: 'var(--font-sans)',
          transition: 'background 0.1s',
        }}
      >
        {theme === 'light' ? 'Dark' : 'Light'}
      </button>

      <button
        onClick={handleSignOut}
        style={{
          background: 'transparent',
          border: '0.5px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          padding: '5px 10px',
          fontSize: '12px',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          fontFamily: 'var(--font-sans)',
          transition: 'background 0.1s',
        }}
      >
        Sair
      </button>
    </header>
  )
}
