import { FeedPost } from "@/features/home/components/Feed"

export type SearchPageProps = {
  query?: string
}

export type SearchUser = {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
}

export type SearchResults = {
  posts: FeedPost[]
  users: SearchUser[]
}

