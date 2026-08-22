export type GlobalStatsRankingItem = {
  id: string
  name: string
  count: number
}

export type GlobalStatsTrendItem = {
  key: string
  label: string
  count: number
}

export type GlobalStats = {
  periodLabel: string
  monthlyCount: number
  monthlyPosts: number
  activeUsers: number
  averageSatisfaction: number
  ranking: GlobalStatsRankingItem[]
  monthlyTrend: GlobalStatsTrendItem[]
}
