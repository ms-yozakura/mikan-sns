import { createClient } from "@/infrastructure/supabase/server"
import { getGlobalStats } from "@/features/stats/actions/getGlobalStats"
import { getFeed } from "../actions/getFeed"
import { HomePageClient } from "./HomePageClient"

export async function HomePage() {
  const supabase = await createClient()

  const [initialPosts, initialFollowingPosts, stats, { data: { user } }] = await Promise.all([
    getFeed(),
    getFeed(undefined, 10, "following"),
    getGlobalStats(),
    supabase.auth.getUser(),
  ])

  return (
    <HomePageClient
      initialPosts={initialPosts}
      initialFollowingPosts={initialFollowingPosts}
      stats={stats}
      treeSeed={user?.id ?? "mikan-guest"}
    />
  )
}
