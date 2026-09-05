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
  {
    type: 'want',
    label: '食べたい',
    icon: 'mdi:fruit-citrus',
    activeIcon: 'mdi:fruit-citrus',
  },
  {
    type: 'best',
    label: '最高',
    icon: 'mdi:star-four-points-outline',
    activeIcon: 'mdi:star-four-points',
  },
] as const

export type ReactionType = (typeof REACTIONS)[number]['type']

export type ReactionCounts = Record<ReactionType, number>

export const EMPTY_REACTION_COUNTS: ReactionCounts = {
  like: 0,
  delicious: 0,
  want: 0,
  best: 0,
}

export function isReactionType(value: unknown): value is ReactionType {
  return REACTIONS.some((reaction) => reaction.type === value)
}

export function createReactionCounts(): ReactionCounts {
  return { ...EMPTY_REACTION_COUNTS }
}
