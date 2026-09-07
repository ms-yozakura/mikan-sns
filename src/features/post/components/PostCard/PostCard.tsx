'use client'

import type { MouseEvent } from 'react'
import { useModal } from '@/providers/ModalProvider'
import { CommentComposerModal } from '../CommentComposerModal/CommentComposerModal'
import { PostCard as BasePostCard } from './PostCardBase'

export function PostCard(props: {
  post: any
  enableCommentForm?: boolean
  enablePostLink?: boolean
}) {
  const { openModal } = useModal()

  const handleClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (props.enableCommentForm === false) return

    const target = event.target as HTMLElement
    const commentButton = target.closest('button[aria-label="コメント"]')

    if (!commentButton || !event.currentTarget.contains(commentButton)) return

    event.preventDefault()
    event.stopPropagation()

    openModal({
      children: <CommentComposerModal post={props.post} />,
    })
  }

  return (
    <div style={{ display: 'contents' }} onClickCapture={handleClickCapture}>
      <BasePostCard {...props} enableCommentForm={false} />
    </div>
  )
}
