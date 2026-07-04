'use client'

import { FloatingActionButton } from "@/shared/ui/FloatingActionButton"
import { PostForm } from "@/features/post/components/PostForm/PostForm"

import { Icon } from "@iconify/react"

import { useModal } from "@/providers/ModalProvider"
import { useRouter } from "next/navigation"
import { useInfiniteFeed } from "@/features/home/hooks/useInfiniteFeed"

export function FloatingPostButton({ onSuccess }: { onSuccess: (post:any) => void }) {

  const router = useRouter()

  const { openModal, closeModal } = useModal()

  return (
    <FloatingActionButton
      onClick={() =>
        openModal({
          title: "投稿を作成",
          children: (
            <PostForm
              onSuccess={(post:any) => {
                closeModal()
                router.refresh()
                onSuccess(post)
              }}
            />
          ),
        })
      }
    >
      <Icon icon="material-symbols:add-rounded" />
    </FloatingActionButton>
  )
}
