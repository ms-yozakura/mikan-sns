import { useCallback, useMemo, useRef, useState } from "react"
import { SearchPageProps, SearchResults, SearchUser } from "../types/types"
import { createClient } from "@/infrastructure/supabase/client"
import { FeedPost } from "@/features/home/components/Feed"
import { escapeSearchTerm, updateSearchUrl } from "../utils/searchUtils"



const RESULT_LIMIT = 20
const DEBOUNCE_MS = 1000


const emptyResults: SearchResults = {
  posts: [],
  users: [],
}

export function useSearch({ query = "" }: SearchPageProps) {

  const initialQuery = query.trim()
  const supabase = useMemo(() => createClient(), [])
  const requestIdRef = useRef(0)

  const [inputValue, setInputValue] = useState(initialQuery)
  const [searchedQuery, setSearchedQuery] = useState(initialQuery)
  const [results, setResults] = useState<SearchResults>(emptyResults)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")



  const runSearch = useCallback(async (rawQuery: string) => {
    const nextQuery = rawQuery.trim()
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId

    updateSearchUrl(nextQuery)
    setSearchedQuery(nextQuery)
    setErrorMessage("")

    if (!nextQuery) {
      setResults(emptyResults)
      setLoading(false)
      return
    }

    setLoading(true)

    const pattern = `%${escapeSearchTerm(nextQuery)}%`
    const [postsResult, usersResult] = await Promise.all([
      supabase
        .from("posts")
        .select(`
          *,
          users (
            username,
            display_name,
            avatar_url
          ),
          post_images (
            url,
            thumbnail_url,
            order_index
          ),
          post_mikans(
            id,
            quantity,
            satisfaction,
            mikan_varieties(
              name,
              color,
              shape
            )
          )
        `)
        .ilike("body", pattern)
        .order("created_at", { ascending: false })
        .limit(RESULT_LIMIT),
      supabase
        .from("users")
        .select("id, username, display_name, avatar_url")
        .or(`username.ilike.${pattern},display_name.ilike.${pattern}`)
        .order("username", { ascending: true })
        .limit(RESULT_LIMIT),
    ])

    if (requestId !== requestIdRef.current) return

    setLoading(false)

    if (postsResult.error) {
      console.error("SEARCH POSTS ERROR:", postsResult.error)
      setErrorMessage("投稿の検索に失敗しました。")
      return
    }

    if (usersResult.error) {
      console.error("SEARCH USERS ERROR:", usersResult.error)
      setErrorMessage("ユーザーの検索に失敗しました。")
      return
    }

    const userMap = new Map<string, SearchUser>()

    for (const user of usersResult.data ?? []) {
      userMap.set(user.id, user)
    }


    setResults({
      posts: (postsResult.data ?? []) as FeedPost[],
      users: [...userMap.values()].slice(0, RESULT_LIMIT),
    })
  }, [supabase])

  return {
    inputValue,
    setInputValue,
    searchedQuery,
    results,
    loading,
    errorMessage,
    runSearch,
  }

}
