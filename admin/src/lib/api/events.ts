import { apiGet, apiPost, apiPut } from './client'

export interface EventListItem {
  id: string
  title: string
  slug: string
  status: 'draft' | 'published' | 'archived'
  startAt: { _seconds: number }
  featuredOnHome: boolean
  coverImage?: { url: string; alt: string }
  createdAt: { _seconds: number }
  updatedAt: { _seconds: number }
}

export interface EventListResponse {
  events: EventListItem[]
  total: number
}

export interface CreateEventData {
  title: string
  slug: string
  summary: string
  content: { json: object }
  startAt: string
  location: {
    name: string
    address: string
    type: 'presential' | 'online' | 'hybrid'
    mapUrl?: string
  }
  endAt?: string
  registrationUrl?: string
  countdownEnabled?: boolean
  featuredOnHome?: boolean
}

export async function listEvents(status?: string): Promise<EventListResponse> {
  const query = status ? `?status=${status}` : ''
  return apiGet<EventListResponse>(`/api/v1/events${query}`)
}

export async function createEvent(
  data: CreateEventData,
): Promise<{ id: string; slug: string; status: string }> {
  return apiPost(`/api/v1/events`, data)
}

export async function publishEvent(eventId: string): Promise<void> {
  return apiPost(`/api/v1/events/${eventId}/publish`)
}

export async function archiveEvent(eventId: string): Promise<void> {
  return apiPost(`/api/v1/events/${eventId}/archive`)
}

export function formatEventDate(seconds: number): string {
  return new Date(seconds * 1000).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
