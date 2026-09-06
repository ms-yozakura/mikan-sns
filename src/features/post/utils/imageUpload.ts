import imageCompression from "browser-image-compression"
import { createClient } from "@/infrastructure/supabase/client"
import type { UploadedImage } from "../types/post"


export async function uploadPostImages(
  files: File[],
  userId: string,
  postId: string
): Promise<UploadedImage[]> {

  const supabase = createClient()

  const uploadedImages: UploadedImage[] = []


  for (let i = 0; i < files.length; i++) {

    const compressed =
      await imageCompression(
        files[i],
        {
          maxWidthOrHeight: 600,
          fileType: "image/webp",
          initialQuality: 0.85
        }
      )


    const path =
      `${userId}/${postId}/${i}.webp`


    const { error } =
      await supabase.storage
        .from("post_images")
        .upload(
          path,
          compressed,
          {
            contentType: "image/webp"
          }
        )


    if (error) throw error


    const url =
      supabase.storage
        .from("post_images")
        .getPublicUrl(path)
        .data.publicUrl



    const thumb =
      await imageCompression(
        files[i],
        {
          maxWidthOrHeight:512,
          fileType:"image/webp",
          initialQuality:0.75
        }
      )


    const thumbPath =
      `${userId}/${postId}/${i}_thumb.webp`


    const { error: thumbError } =
      await supabase.storage
        .from("post_images")
        .upload(
          thumbPath,
          thumb,
          {
            contentType:"image/webp"
          }
        )


    if (thumbError) throw thumbError


    const thumbnail_url =
      supabase.storage
        .from("post_images")
        .getPublicUrl(thumbPath)
        .data.publicUrl


    uploadedImages.push({
      url,
      thumbnail_url,
      order_index:i
    })
  }


  return uploadedImages
}
