import { auth } from '@/lib/firebase/auth'

const API_URL =
  process.env['NEXT_PUBLIC_API_URL'] ?? 'http://127.0.0.1:5001/gdg-vca/us-central1/api'

async function getAuthHeaders(): Promise<HeadersInit> {
  const user = auth.currentUser
  if (!user) throw new Error('User not authenticated')
  const token = await user.getIdToken()
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const headers = await getAuthHeaders()
  const res = await fetch(`${API_URL}${path}`, { method: 'GET', headers })
  const data = await res.json()
  if (!data.success) throw new Error(data.error?.message ?? 'Request failed')
  return data.data as T
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const headers = await getAuthHeaders()
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json()
  if (!data.success) throw new Error(data.error?.message ?? 'Request failed')
  return data.data as T
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const headers = await getAuthHeaders()
  const res = await fetch(`${API_URL}${path}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!data.success) throw new Error(data.error?.message ?? 'Request failed')
  return data.data as T
}
