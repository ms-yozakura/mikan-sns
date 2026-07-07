"use client"

import Link from "next/link"
import { useEffect } from "react"

import { Feed } from "@/features/home/components/Feed"
import { HomeStatsSummary } from "@/features/stats/components/HomeStatsSummary"
import styles from "./SearchPage.module.css"
import { SearchPageProps } from "../types/types"
import { useSearch } from "../hooks/useSearch"
import { SearchForm } from "../components/SearchForm"

const DEBOUNCE_MS = 1000

export function SearchPage({ query = "" }: SearchPageProps) {
  const {
    inputValue,
    setInputValue,
    searchedQuery,
    results,
    loading,
    errorMessage,
    runSearch,
  } = useSearch({ query })

  const hasQuery = searchedQuery.length > 0
  const hasPosts = results.posts.length > 0
  const hasUsers = results.users.length > 0

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void runSearch(inputValue)
    }, DEBOUNCE_MS)

    return () => window.clearTimeout(timer)
  }, [inputValue, runSearch])

  useEffect(() => {
    function handlePopState() {
      const nextQuery = new URLSearchParams(window.location.search).get("q") ?? ""
      setInputValue(nextQuery)
    }

    window.addEventListener("popstate", handlePopState)

    return () => window.removeEventListener("popstate", handlePopState)
  }, [setInputValue])

  return (
    <main className={styles.search}>
      {/*<div className={styles.mobileStats}>
        <HomeStatsSummary variant="mobile" />
      </div>*/}

      <section className={styles.header}>
        <SearchForm value={inputValue} onSubmit={runSearch} onChange={setInputValue} />
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
          <div className={styles.messageLight}>「{searchedQuery}」の検索結果</div>
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
