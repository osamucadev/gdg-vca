import { apiGet, apiPut } from './client'

export interface HomeBlock {
  id: string
  type: string
  enabled: boolean
  order: number
  props: Record<string, unknown>
  updatedAt: { _seconds: number }
}

export interface HomeBlocksResponse {
  blocks: HomeBlock[]
}

export async function listHomeBlocks(): Promise<HomeBlocksResponse> {
  return apiGet<HomeBlocksResponse>('/api/v1/home-blocks')
}

export async function updateHomeBlock(
  blockId: string,
  data: { enabled?: boolean; order?: number; props?: Record<string, unknown> },
): Promise<void> {
  return apiPut(`/api/v1/home-blocks/${blockId}`, data)
}
