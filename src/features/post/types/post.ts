
import type { MikanProfileValues } from "./mikanProfile"

/*　そうしんでーた　*/

export type MikanInput = {
  variety_id: string
  quantity: number
  satisfaction: number
} & Partial<MikanProfileValues>


export type UploadedImage = {
  url: string
  thumbnail_url: string
  order_index: number
}
