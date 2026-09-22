'use server'

import { createClient } from "@/infrastructure/supabase/server"
import { cache } from "react"
import type { GlobalStats } from "../types/types"

const EMPTY_STATS: GlobalStats = {
  periodLabel: new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    timeZone: "Asia/Tokyo",
  }).format(new Date()),
  monthlyCount: 0,
  monthlyPosts: 0,
  activeUsers: 0,
  averageSatisfaction: 0,
  ranking: [],
  userRanking: [],
  monthlyTrend: [],
}

const loadGlobalStats = cache(async (): Promise<GlobalStats> => {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("get_global_stats")

  if (error) {
    console.error("Failed to load global stats", error)
    return EMPTY_STATS
  }

  return {
    ...EMPTY_STATS,
    ...(data as Partial<GlobalStats>),
  }
})

export async function getGlobalStats(): Promise<GlobalStats> {
  return loadGlobalStats()
}
