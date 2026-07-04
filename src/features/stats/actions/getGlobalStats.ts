'use server'

import type { GlobalStats } from "../types/types"

export async function getGlobalStats(): Promise<GlobalStats> {
  return {
    monthlyCount: 3482,
    monthlyPosts: 421,
    activeUsers: 86,
    averageSatisfaction: 4.58,
    ranking: [
      {
        id: 1,
        name: "せとか",
        count: 542,
      },
      {
        id: 2,
        name: "甘平",
        count: 481,
      },
      {
        id: 3,
        name: "日向夏",
        count: 409,
      },
    ],
  }
}
