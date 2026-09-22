export type GlobalStatsRankingItem = {
  id: string
  name: string
  count: number
  color?: string | null
  shape?: "normal" | "round" | "flat" | "egg" | "deko" | "unknown" | null
}

export type GlobalStatsUserRankingItem = {
  id: string
  name: string
  count: number
  avatarUrl?: string | null
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
  userRanking: GlobalStatsUserRankingItem[]
  monthlyTrend: GlobalStatsTrendItem[]
}
