'use client'

import { FloatingActionButton } from "@/shared/ui/FloatingActionButton"
import { PostForm } from "@/features/post/components/PostForm/PostForm"
import postStyles from "@/features/post/components/PostForm/PostForm.module.css"
import { Icon } from "@iconify/react"
import { useModal } from "@/providers/ModalProvider"
import { useRouter } from "next/navigation"

export function FloatingPostButton({ onSuccess }: { onSuccess: (post: any) => void }) {
  const router = useRouter()
  const { openModal, closeModal } = useModal()

  return (
    <FloatingActionButton
      onClick={() =>
        openModal({
          className: postStyles.postModal,
          hideCloseButton: true,
          children: (
            <PostForm
              onClose={closeModal}
              onSuccess={(post: any) => {
                closeModal()
                router.refresh()
                onSuccess(post)
              }}
            />
          ),
        })
      }
    >
      <Icon icon="material-symbols:add-rounded" aria-hidden="true" />
      <span>投稿する</span>
    </FloatingActionButton>
  )
}
