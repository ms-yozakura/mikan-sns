'use client'

import { PostFormClient } from "./PostFormClient"

export function PostForm({
  onSuccess,
  onClose,
}: {
  onSuccess: (post: any) => void
  onClose?: () => void
}) {
  return (
    <PostFormClient onSuccess={onSuccess} onClose={onClose} />
  )
}
