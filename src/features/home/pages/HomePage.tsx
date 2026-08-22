import { getFeed } from "../actions/getFeed"
import { HomePageClient } from "./HomePageClient"
import { getGlobalStats } from "@/features/stats/actions/getGlobalStats"

export async function HomePage() {
  const [initialPosts, stats] = await Promise.all([getFeed(), getGlobalStats()])

  return <HomePageClient initialPosts={initialPosts} stats={stats} />
}
