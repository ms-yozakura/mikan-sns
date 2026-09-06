import { createClient } from "@/infrastructure/supabase/server"
import styles from "./UserPage.module.css"
import { getUserFeed } from "../actions/getUserFeed"
import { ProfileActions } from "../components/ProfileActions"
import { ProfileTabs } from "../components/ProfileTabs"
import defaultAvatar from "@/img/default-avatar.jpg"

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

          <ProfileActions
            isOwnProfile={isOwnProfile}
            targetUserId={data.profile.id}
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
