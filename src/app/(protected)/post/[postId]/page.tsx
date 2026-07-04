
import { PostPage } from "@/features/post/pages/PostPage"
import { notFound } from 'next/navigation'

type Props = {
  params: Promise<{
    postId: string
  }>
}

export default async function Page({ params }: Props) {
  const { postId } = await params

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

  if (!uuidRegex.test(postId)) {
    notFound()
  }

  return (
    <div>
      <PostPage postId={postId} />
    </div>
  )
}
