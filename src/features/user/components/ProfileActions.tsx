"use client"

import { useState } from "react"
import styles from "../pages/UserPage.module.css"
import { useRouter } from "next/navigation"

type ProfileActionsProps = {
  isOwnProfile: boolean
}

export function ProfileActions({ isOwnProfile }: ProfileActionsProps) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [showHiddenPosts, setShowHiddenPosts] = useState(false)
  const router = useRouter()

  const handleFollow = () => {
    setIsFollowing(!isFollowing)
    // ここにフォロー処理のAPIコールなどを記述
  }

  const handleEditProfile = () => {
    router.push("/setting")
  }

  return (
    <div className={styles.actionContainer}>
      {isOwnProfile ? (
        <div className={styles.ownActions}>
          <button className={styles.editButton} onClick={handleEditProfile}>
            Edit Profile
          </button>
        </div>
      ) : (
        <button
          className={`${styles.followButton} ${isFollowing ? styles.following : ""}`}
          onClick={handleFollow}
        >
          {isFollowing ? "Following" : "Follow"}
        </button>
      )}
    </div>
  )
}
