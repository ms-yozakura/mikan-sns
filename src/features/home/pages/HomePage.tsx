import { getFeed } from "../actions/getFeed"
import { HomePageClient } from "./HomePageClient"

export async function HomePage() {
  const initialPosts = await getFeed()

  return <HomePageClient initialPosts={initialPosts} />
}
