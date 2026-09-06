"use client"

import { useState } from "react"
import { Icon } from "@iconify/react"
import styles from "../pages/UserPage.module.css"
import { useRouter } from "next/navigation"
import { toggleFollow } from "../actions/toggleFollow"

type ProfileActionsProps = {
  isOwnProfile: boolean
  targetUserId: string
  postCount: number
  initialIsFollowing: boolean
  initialFollowerCount: number
  followingCount: number
}

export function ProfileActions({
  isOwnProfile,
  targetUserId,
  postCount,
  initialIsFollowing,
  initialFollowerCount,
  followingCount,
}: ProfileActionsProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [followerCount, setFollowerCount] = useState(initialFollowerCount)
  const [followPending, setFollowPending] = useState(false)
  const [followError, setFollowError] = useState<string | null>(null)
  const router = useRouter()

  const handleFollow = async () => {
    if (followPending || isOwnProfile) return

    const previousFollowing = isFollowing
    const previousFollowerCount = followerCount
    const nextFollowing = !previousFollowing

    setFollowError(null)
    setIsFollowing(nextFollowing)
    setFollowerCount(
      Math.max(0, previousFollowerCount + (nextFollowing ? 1 : -1))
    )
    setFollowPending(true)

    const result = await toggleFollow(targetUserId)

    if (!result.success) {
      setIsFollowing(previousFollowing)
      setFollowerCount(previousFollowerCount)
      setFollowError(result.error)
      setFollowPending(false)
      return
    }

    if (result.following !== nextFollowing) {
      setIsFollowing(result.following)
      setFollowerCount(previousFollowerCount)
    }

    setFollowPending(false)
  }

  return (
    <div className={styles.actionContainer}>
      <div className={styles.socialStats} aria-label="プロフィール統計">
        <div className={styles.socialStat}>
          <span className={styles.socialLabel}>投稿</span>
          <strong className={styles.socialValue}>{postCount}</strong>
        </div>
        <div className={styles.socialStat}>
          <span className={styles.socialLabel}>フォロー</span>
          <strong className={styles.socialValue}>{followingCount}</strong>
        </div>
        <div className={styles.socialStat}>
          <span className={styles.socialLabel}>フォロワー</span>
          <strong className={styles.socialValue}>{followerCount}</strong>
        </div>
      </div>

      {isOwnProfile ? (
        <div className={styles.ownActions}>
          <button className={styles.editButton} onClick={() => router.push("/setting")}>
            <Icon className={styles.buttonIcon} icon="mdi:account-edit-outline" aria-hidden="true" />
            <span>プロフィールを編集</span>
          </button>
        </div>
      ) : (
        <button
          className={`${styles.followButton} ${isFollowing ? styles.following : ""}`}
          onClick={() => void handleFollow()}
          aria-pressed={isFollowing}
          disabled={followPending}
        >
          {isFollowing ? "Following" : "Follow"}
        </button>
      )}

      {followError && (
        <p className={styles.followError} role="status">
          {followError}
        </p>
      )}
    </div>
  )
}
