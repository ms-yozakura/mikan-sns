'use client'

import { PostFormClient } from "./PostFormClient"

export function PostForm({ onSuccess }: { onSuccess: (post: any) => void }) {

  return (
    <PostFormClient onSuccess={onSuccess} />
  )
}
