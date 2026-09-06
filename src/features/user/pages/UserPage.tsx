import Link from "next/link"
import { Icon } from "@iconify/react"
import { createClient } from "@/infrastructure/supabase/server"
import { MikanIcon } from "@/features/mikan/components/MikanIcon"
import styles from "./UserPage.module.css"
import { getUserFeed } from "../actions/getUserFeed"
import { ProfileActions } from "../components/ProfileActions"
import { ProfileTabs } from "../components/ProfileTabs"
import defaultAvatar from "@/img/default-avatar.jpg"

type FavoriteMikan = {
  position: number
  mikan_varieties: {
    id: string
    name: string
    aliases: string[] | null
    color: string
    shape: "normal" | "round" | "flat" | "egg" | "deko" | "unknown"
  } | null
}

export default async function UserPage({ userId }: { userId: string }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const data = await getUserFeed({ username: userId })

  if (!data) {
    return (
      <main className={styles.container}>
        <div className={styles.notFoundCard}>
          <p className={styles.notFoundText}>ユーザーが見つかりませんでした。</p>
        </div>
      </main>
    )
  }

  const isOwnProfile = user ? user.id === data.profile.id : false

  const privateProfile = data.profile.profiles as unknown as {
    bio: string | null
    region: string | null
    generation: number | null
  }

  const favoriteMikans = ((data.profile.favorite_mikans ?? []) as unknown as FavoriteMikan[])
    .filter((item) => item.mikan_varieties)
    .sort((a, b) => a.position - b.position)

  return (
    <main className={styles.container}>
      <div className={styles.profileCard}>
        <div className={styles.coverHeader} />

        <div className={styles.profileContent}>
          <div className={styles.avatarWrapper}>
            <img
              src={data.profile.avatar_url ?? defaultAvatar.src}
              alt={`${data.profile.display_name}'s avatar`}
              className={styles.avatarImage}
            />
          </div>

          <h1 className={styles.displayName}>
            {data.profile.display_name || "No name"}
          </h1>

          <div className={styles.regionAndGen}>
            <span>{privateProfile?.region}</span>
            {privateProfile?.region != "" &&
              privateProfile?.generation != null &&
              "・"}
            <span>
              {privateProfile?.generation && privateProfile.generation + "期"}
            </span>
          </div>

          {favoriteMikans.length > 0 && (
            <div className={styles.favoriteMikans} aria-label="推しみかん">
              <span className={styles.favoriteMikansLabel}>推しみかん</span>
              <div className={styles.favoriteMikanList}>
                {favoriteMikans.map((item) => {
                  const variety = item.mikan_varieties!
                  const displayName = variety.aliases?.includes("紅まどんな")
                    ? "紅まどんな"
                    : variety.name

                  return (
                    <span key={variety.id} className={styles.favoriteMikanChip}>
                      <MikanIcon color={variety.color} shape={variety.shape} size={22} />
                      {displayName}
                    </span>
                  )
                })}
              </div>
            </div>
          )}

          <ProfileActions
            isOwnProfile={isOwnProfile}
            targetUserId={data.profile.id}
            postCount={data.social.postCount}
            initialIsFollowing={data.social.isFollowing}
            initialFollowerCount={data.social.followersCount}
            followingCount={data.social.followingCount}
          />

          <div className={styles.bioSection}>
            <h2 className={styles.bioTitle}>About</h2>
            <p
              className={
                privateProfile?.bio ? styles.bioText : styles.bioPlaceholder
              }
            >
              {privateProfile?.bio || "自己紹介はまだ登録されていません。"}
            </p>
          </div>

          {isOwnProfile && (
            <Link href="/calendar" className={styles.mikanLogButton}>
              <span className={styles.mikanLogIconWrap} aria-hidden="true">
                <Icon icon="mdi:calendar-month-outline" className={styles.mikanLogIcon} />
              </span>
              <span className={styles.mikanLogText}>
                <strong>みかんログ</strong>
                <small>食べたみかんの記録を見る</small>
              </span>
              <Icon icon="mdi:chevron-right" className={styles.mikanLogChevron} aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>

      <ProfileTabs
        key={userId}
        username={userId}
        posts={data.posts}
      />
    </main>
  )
}
