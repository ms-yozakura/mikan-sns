"use client"

import { useState } from "react"
import { Feed, type FeedPost } from "@/features/home/components/Feed"
import styles from "../pages/UserPage.module.css"

type ProfileTabsProps = {
  posts: FeedPost[]
  isOwnProfile: boolean
}

type TabType = "feed" | "bookmark" | "zukan"

export function ProfileTabs({ posts, isOwnProfile }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("feed")

  return (
    <div className={styles.tabsContainer}>
      {/* タブナビゲーション */}
      <div className={styles.tabList}>
        <button
          className={`${styles.tabButton} ${activeTab === "feed" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("feed")}
        >
          投稿
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === "bookmark" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("bookmark")}
        >
          ブックマーク
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === "zukan" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("zukan")}
        >
          品種図鑑
        </button>
      </div>

      {/* タブコンテンツ */}
      <div className={styles.tabContent}>
        {activeTab === "feed" && (
          <Feed contents={posts} />
        )}

        {activeTab === "bookmark" && (
          <div className={styles.emptyState}>
            <p>
              {isOwnProfile
                ? "ブックマークされた投稿はまだありません。"
                : "ブックマークは公開されていません。"}
            </p>
          </div>
        )}

        {activeTab === "zukan" && (
          <div className={styles.zukanContainer}>
            <div className={styles.zukanHeader}>
              <h3>登録した品種 & ランキング</h3>
            </div>
            <div className={styles.emptyState}>
              <p>登録された品種データがありません。</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
