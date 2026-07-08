import { useCallback, useEffect, useRef, useState } from "react"
import { getFeed } from "../actions/getFeed"

type Cursor = {
  id: number | string
  created_at: string
}

export type InfiniteFeedPost = Cursor & Record<string, unknown>

type FetchMorePosts = (cursor: Cursor) => Promise<InfiniteFeedPost[]>

const DEFAULT_PAGE_SIZE = 10

export function useInfiniteFeed(
  initialPosts: InfiniteFeedPost[],
  fetchMorePosts: FetchMorePosts = getFeed,
  pageSize = DEFAULT_PAGE_SIZE
) {
  const [posts, setPosts] = useState(initialPosts)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialPosts.length >= pageSize)

  const cursorRef = useRef<Cursor | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const last = initialPosts.at(-1)

    if (last) {
      cursorRef.current = {
        id: last.id,
        created_at: last.created_at
      }
    } else {
      cursorRef.current = null
    }
  }, [initialPosts, pageSize])


  const loadMore = useCallback(async () => {
    if (loading || !hasMore || !cursorRef.current) return

    setLoading(true)
    const next = await fetchMorePosts(cursorRef.current)

    if (next.length === 0) {
      setHasMore(false)
      setLoading(false)
      return
    }

    setPosts(prev => [...prev, ...next])

    const last = next.at(-1)
    if (last) {
      cursorRef.current = {
        id: last.id,
        created_at: last.created_at
      }
    }
    if (next.length < pageSize) setHasMore(false) 

    setLoading(false)
  }, [fetchMorePosts, hasMore, loading, pageSize])


  useEffect(() => {
    const target = loadMoreRef.current

    if (!target) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadMore()
        }
      },
      {
        rootMargin: "200px"
      }
    )

    observer.observe(target)

    return () => {
      observer.disconnect()
    }

  }, [loadMore])

  function prependPost(post: InfiniteFeedPost) {
    setPosts(prev => [post, ...prev])
  }

  return {
    posts,
    prependPost,
    loading,
    hasMore,
    loadMoreRef
  }
}
