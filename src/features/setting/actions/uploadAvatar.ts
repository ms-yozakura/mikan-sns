"use server"

import sharp from "sharp"
import { createClient } from "@/infrastructure/supabase/server"

export async function uploadAvatar(formData: FormData) {
  const file = formData.get("file") as File
  if (!file) throw new Error("No file provided")

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  // File → Buffer
  const arrayBuffer = await file.arrayBuffer()
  const uint8Array = new Uint8Array(arrayBuffer)

  sharp.cache(false)

  // 512x512 WebPへ変換
  const buffer = await sharp(uint8Array)
    .rotate()
    .resize(216, 216, {
      fit: "cover",
      position: "centre",
    })
    .webp({
      quality: 85,
    })
    .toBuffer()

  const path = `${user.id}/avatar_${window.crypto.randomUUID()}.webp`

  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, buffer, {
      contentType: "image/webp",
      upsert: true,
    })

  if (error) throw error

  return supabase.storage
    .from("avatars")
    .getPublicUrl(path)
    .data.publicUrl
}
