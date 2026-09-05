export const REACTIONS = [
  {
    type: 'like',
    label: 'いいね',
    icon: 'iconamoon:heart',
    activeIcon: 'iconamoon:heart-fill',
  },
  {
    type: 'delicious',
    label: 'おいしそう',
    icon: 'mdi:emoticon-tongue-outline',
    activeIcon: 'mdi:emoticon-tongue',
  },
] as const

export type ReactionType = (typeof REACTIONS)[number]['type']

export type ReactionCounts = Record<ReactionType, number>

export const EMPTY_REACTION_COUNTS: ReactionCounts = {
  like: 0,
  delicious: 0,
}

export function isReactionType(value: unknown): value is ReactionType {
  return REACTIONS.some((reaction) => reaction.type === value)
}

export function createReactionCounts(): ReactionCounts {
  return { ...EMPTY_REACTION_COUNTS }
}
