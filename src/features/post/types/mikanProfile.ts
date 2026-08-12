export const MIKAN_PROFILE_KEYS = [
  "sweetness",
  "tartness",
  "umami",
  "juiciness",
  "thinness",
  "aroma",
  "texture",
] as const

export type MikanProfileKey = typeof MIKAN_PROFILE_KEYS[number]
export type MikanProfileValues = Record<MikanProfileKey, number>

export const MIKAN_AXES_CONFIG = [
  { key: "sweetness", label: "甘さ", directionLabel: "弱→強", icon: "mdi:candy" },
  { key: "tartness", label: "酸っぱさ", directionLabel: "強→弱", icon: "mdi:fruit-citrus" },
  { key: "umami", label: "コク・旨み", directionLabel: "弱→強", icon: "mdi:sparkles" },
  { key: "juiciness", label: "果汁感", directionLabel: "弱→強", icon: "mdi:water" },
  { key: "thinness", label: "皮の薄さ", directionLabel: "厚→薄", icon: "mdi:layers-outline" },
  { key: "aroma", label: "香り", directionLabel: "弱→強", icon: "mdi:scent" },
  { key: "texture", label: "歯応え", directionLabel: "弱→強", icon: "mdi:food-apple" },
] as const

export const DEFAULT_MIKAN_PROFILE: MikanProfileValues = {
  sweetness: 5,
  tartness: 5,
  umami: 5,
  juiciness: 5,
  thinness: 5,
  aroma: 5,
  texture: 5,
}

export function readMikanProfile(
  source: Partial<Record<MikanProfileKey, unknown>>,
): MikanProfileValues | null {
  const entries = MIKAN_PROFILE_KEYS.map((key) => [key, source[key]] as const)
  if (entries.some(([, value]) => typeof value !== "number")) return null
  return Object.fromEntries(entries) as MikanProfileValues
}
