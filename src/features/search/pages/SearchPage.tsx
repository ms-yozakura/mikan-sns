"use client"

import Link from "next/link"
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react"

import { Feed, type FeedPost } from "@/features/home/components/Feed"
import { HomeStatsSummary } from "@/features/stats/components/HomeStatsSummary"
import { createClient } from "@/infrastructure/supabase/client"
import styles from "./SearchPage.module.css"
import Button from "@/shared/ui/Button"
import { Icon } from "@iconify/react"

const RESULT_LIMIT = 20
const DEBOUNCE_MS = 1000

type SearchPageProps = {
  query?: string
}

type SearchUser = {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
}

type SearchResults = {
  posts: FeedPost[]
  users: SearchUser[]
}

const emptyResults: SearchResults = {
  posts: [],
  users: [],
}

function escapeSearchTerm(term: string) {
  return term.replaceAll("%", "\\%").replaceAll("_", "\\_")
}

function updateSearchUrl(query: string) {
  const nextUrl = new URL(window.location.href)

  if (query) {
    nextUrl.searchParams.set("q", query)
  } else {
    nextUrl.searchParams.delete("q")
  }

  window.history.replaceState(null, "", `${nextUrl.pathname}${nextUrl.search}`)
}

export function SearchPage({ query = "" }: SearchPageProps) {
  const initialQuery = query.trim()
  const supabase = useMemo(() => createClient(), [])
  const requestIdRef = useRef(0)
  const [inputValue, setInputValue] = useState(initialQuery)
  const [searchedQuery, setSearchedQuery] = useState(initialQuery)
  const [results, setResults] = useState<SearchResults>(emptyResults)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const hasQuery = searchedQuery.length > 0
  const hasPosts = results.posts.length > 0
  const hasUsers = results.users.length > 0

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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void runSearch(inputValue)
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void runSearch(inputValue)
    }, DEBOUNCE_MS)

    return () => window.clearTimeout(timer)
  }, [runSearch])

  useEffect(() => {
    function handlePopState() {
      const nextQuery = new URLSearchParams(window.location.search).get("q") ?? ""
      setInputValue(nextQuery)
    }

    window.addEventListener("popstate", handlePopState)

    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  return (
    <main className={styles.search}>
      <div className={styles.mobileStats}>
        <HomeStatsSummary variant="mobile" />
      </div>

      <section className={styles.header}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <Icon
            icon="mdi:magnify"
            className={styles.searchIcon}
          />


          <input
            className={styles.input}
            type="search"
            placeholder="投稿・ユーザーを検索"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
          />
        </form>
      </section>

      {errorMessage && (
        <p className={styles.errorMessage}>{errorMessage}</p>
      )}

      {!hasQuery && (
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>みかんの話題をさがそう</p>
          <p className={styles.emptyText}>投稿・ユーザーを検索できます</p>
        </div>
      )}

      {hasQuery && (
        <div className={styles.results}>
          <div className={styles.messageLight}>"{searchedQuery}"の検索結果</div>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>ユーザー</h2>
              <span className={styles.resultCount}>{results.users.length}</span>
            </div>

            {loading ? (
              <p className={styles.noResults}>検索しています...</p>
            ) : hasUsers ? (
              <div className={styles.userList}>
                {results.users.map((user) => (
                  <Link
                    key={user.id}
                    href={`/user/${user.username}`}
                    className={styles.userItem}
                  >
                    <div className={styles.avatarWrapper}>
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={`${user.display_name ?? user.username}のアバター`}
                          className={styles.avatarImage}
                        />
                      ) : (
                        <div className={styles.avatarPlaceholder}>🍊</div>
                      )}
                    </div>
                    <div className={styles.userInfo}>
                      <span className={styles.displayName}>
                        {user.display_name || "No name"}
                      </span>
                      <span className={styles.username}>@{user.username}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className={styles.noResults}>一致するユーザーは見つかりませんでした。</p>
            )}
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>投稿</h2>
              <span className={styles.resultCount}>{results.posts.length}</span>
            </div>

            {loading ? (
              <p className={styles.noResults}>検索しています...</p>
            ) : hasPosts ? (
              <Feed contents={results.posts} />
            ) : (
              <p className={styles.noResults}>一致する投稿は見つかりませんでした。</p>
            )}
          </section>
        </div>
      )}
    </main>
  )
}
