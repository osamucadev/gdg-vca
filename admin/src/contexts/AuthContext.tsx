'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from '@/lib/firebase/auth'

interface AuthContextValue {
  user: User | null
  loading: boolean
  role: string | null
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  role: null,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const tokenResult = await firebaseUser.getIdTokenResult()
        setRole((tokenResult.claims['role'] as string) ?? null)
        setUser(firebaseUser)
      } else {
        setUser(null)
        setRole(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return <AuthContext.Provider value={{ user, loading, role }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
