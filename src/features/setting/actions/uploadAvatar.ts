"use server"

import sharp from "sharp"
import crypto from "crypto"
import { createClient } from "@/infrastructure/supabase/server"

const MAX_AVATAR_BYTES = 2 * 1024 * 1024
const MAX_AVATAR_PIXELS = 16_000_000
const ALLOWED_FORMATS = new Map([
  ["jpeg", "image/jpeg"],
  ["png", "image/png"],
  ["gif", "image/gif"],
])

export async function uploadAvatar(formData: FormData) {
  const file = formData.get("file")
  if (!(file instanceof File)) throw new Error("画像ファイルを選択してください。")

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Client-side checks can be bypassed, so validate again before decoding.
  if (file.size === 0 || file.size > MAX_AVATAR_BYTES) {
    throw new Error("画像は2MB以下にしてください。")
  }
  if (![...ALLOWED_FORMATS.values()].includes(file.type)) {
    throw new Error("JPG、PNG、GIF形式の画像のみアップロードできます。")
  }

  const input = new Uint8Array(await file.arrayBuffer())
  const options = { limitInputPixels: MAX_AVATAR_PIXELS, failOn: "error" as const }
  let metadata: { format?: string; width?: number; height?: number }
  try {
    metadata = await sharp(input, options).metadata()
  } catch {
    throw new Error("画像を読み取れませんでした。")
  }

  // Verify the actual decoded format, not just the client-provided MIME type.
  const expectedType = metadata.format && ALLOWED_FORMATS.get(metadata.format)
  if (!expectedType || expectedType !== file.type) {
    throw new Error("画像形式が正しくありません。")
  }
  if (!metadata.width || !metadata.height ||
      metadata.width * metadata.height > MAX_AVATAR_PIXELS) {
    throw new Error("画像の解像度が大きすぎます。")
  }

  // Convert the first frame to a small, standardized WebP avatar.
  const buffer = await sharp(input, options)
    .rotate()
    .resize(216, 216, { fit: "cover", position: "centre" })
    .webp({ quality: 85 })
    .toBuffer()

  const path = `${user.id}/avatar_${crypto.randomUUID()}.webp`
  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, buffer, { contentType: "image/webp", upsert: true })
  if (error) throw error

  return supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl
}
