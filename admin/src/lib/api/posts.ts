import { apiGet, apiPost, apiPut } from './client'

export interface PostListItem {
  id: string
  title: string
  slug: string
  status: 'draft' | 'published' | 'archived'
  excerpt: string
  featuredOnHome: boolean
  showInCommunityHistory: boolean
  coverImage?: { url: string; alt: string }
  publishedAt?: { _seconds: number }
  createdAt: { _seconds: number }
  updatedAt: { _seconds: number }
}

export interface PostListResponse {
  posts: PostListItem[]
  total: number
}

export interface CreatePostData {
  title: string
  slug: string
  excerpt: string
  content: { json: object }
  visibility?: 'public' | 'private'
  tags?: string[]
  category?: string
  relatedEventId?: string
  showInCommunityHistory?: boolean
  historyDate?: string
  featuredOnHome?: boolean
}

export async function listPosts(status?: string): Promise<PostListResponse> {
  const query = status ? `?status=${status}` : ''
  return apiGet<PostListResponse>(`/api/v1/posts${query}`)
}

export async function createPost(
  data: CreatePostData,
): Promise<{ id: string; slug: string; status: string }> {
  return apiPost(`/api/v1/posts`, data)
}

export async function publishPost(postId: string): Promise<void> {
  return apiPost(`/api/v1/posts/${postId}/publish`)
}

export async function archivePost(postId: string): Promise<void> {
  return apiPost(`/api/v1/posts/${postId}/archive`)
}

export function formatDate(seconds: number): string {
  return new Date(seconds * 1000).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
