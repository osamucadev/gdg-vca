import { apiGet, apiPost } from './client'

export interface AnnouncementListItem {
  id: string
  title: string
  slug: string
  status: 'draft' | 'published' | 'archived'
  kind: string
  summary: string
  priority: number
  featuredOnHome: boolean
  startsAt?: { _seconds: number }
  endsAt?: { _seconds: number }
  createdAt: { _seconds: number }
  updatedAt: { _seconds: number }
}

export interface AnnouncementListResponse {
  announcements: AnnouncementListItem[]
  total: number
}

export interface CreateAnnouncementData {
  title: string
  slug: string
  kind: string
  summary: string
  content: { json: object }
  visibility?: 'public' | 'private'
  startsAt?: string
  endsAt?: string
  featuredOnHome?: boolean
  homeZones?: string[]
  priority?: number
  countdownEnabled?: boolean
  cta?: { label: string; url: string }
}

export async function listAnnouncements(status?: string): Promise<AnnouncementListResponse> {
  const query = status ? `?status=${status}` : ''
  return apiGet<AnnouncementListResponse>(`/api/v1/announcements${query}`)
}

export async function createAnnouncement(
  data: CreateAnnouncementData,
): Promise<{ id: string; slug: string; status: string }> {
  return apiPost(`/api/v1/announcements`, data)
}

export async function publishAnnouncement(id: string): Promise<void> {
  return apiPost(`/api/v1/announcements/${id}/publish`)
}

export async function archiveAnnouncement(id: string): Promise<void> {
  return apiPost(`/api/v1/announcements/${id}/archive`)
}

export function formatDate(seconds: number): string {
  return new Date(seconds * 1000).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
