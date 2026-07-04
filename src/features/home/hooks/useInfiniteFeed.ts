import { useEffect, useRef, useState } from "react"
import { getFeed } from "../actions/getFeed"

type Cursor = {
  id: number
  created_at: string
}

export function useInfiniteFeed(initialPosts: any[]) {
  const [posts, setPosts] = useState(initialPosts)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const cursorRef = useRef<Cursor | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const last = initialPosts.at(-1)

    if (last) {
      cursorRef.current = {
        id: last.id,
        created_at: last.created_at
      }
    }
  }, [initialPosts])


  async function loadMore() {
    if (loading || !hasMore || !cursorRef.current) return

    setLoading(true)
    const next = await getFeed(cursorRef.current)
    

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
    if (next.length < 10) setHasMore(false) 

    setLoading(false)
    console.log("now, there are " + posts.length + " posts")
  }


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

  }, [])

  function prependPost(post: any) {
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
