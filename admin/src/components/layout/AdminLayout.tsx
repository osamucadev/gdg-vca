'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

interface AdminLayoutProps {
  children: React.ReactNode
  title: string
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: 'var(--bg-base)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '4px',
            width: '24px',
          }}
        >
          <div
            style={{
              width: '10px',
              height: '10px',
              background: 'var(--gdg-blue)',
              borderRadius: '2px',
              animation: 'pulse 1.2s ease-in-out infinite',
            }}
          />
          <div
            style={{
              width: '10px',
              height: '10px',
              background: 'var(--gdg-red)',
              borderRadius: '2px',
              animation: 'pulse 1.2s ease-in-out 0.2s infinite',
            }}
          />
          <div
            style={{
              width: '10px',
              height: '10px',
              background: 'var(--gdg-yellow)',
              borderRadius: '2px',
              animation: 'pulse 1.2s ease-in-out 0.4s infinite',
            }}
          />
          <div
            style={{
              width: '10px',
              height: '10px',
              background: 'var(--gdg-green)',
              borderRadius: '2px',
              animation: 'pulse 1.2s ease-in-out 0.6s infinite',
            }}
          />
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: 'var(--bg-base)',
      }}
    >
      <Sidebar />
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        <Header title={title} />
        <main
          style={{
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
