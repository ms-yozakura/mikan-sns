export type GlobalStatsRankingItem = {
  id: number
  name: string
  count: number
}

export type GlobalStats = {
  monthlyCount: number
  monthlyPosts: number
  activeUsers: number
  averageSatisfaction: number
  ranking: GlobalStatsRankingItem[]
}
