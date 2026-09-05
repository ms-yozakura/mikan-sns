import type { MikanProfileValues } from './mikanProfile'

export type MikanInput = {
  variety_id: string
  quantity: number
  satisfaction: number
  short_comment?: string
} & Partial<MikanProfileValues>

export type UploadedImage = {
  url: string
  thumbnail_url: string
  order_index: number
}
