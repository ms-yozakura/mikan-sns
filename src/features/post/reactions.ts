export const REACTIONS = [
  {
    type: 'like',
    label: 'いいね',
    icon: 'iconamoon:heart',
    activeIcon: 'iconamoon:heart-fill',
  },
  {
    type: 'delicious',
    label: 'おいしい',
    icon: 'emojione-monotone:face-savoring-food',
    activeIcon: 'emojione:face-savoring-food',
  },
  {
    type: 'mikan',
    label: 'みかん',
    icon: 'emojione-monotone:tangerine',
    activeIcon: 'emojione:tangerine',
  },
  {
    type: 'shine',
    label: '最高',
    icon: 'material-symbols:star-shine-outline',
    activeIcon: 'material-symbols:star-shine',
  },
] as const

export type ReactionType = (typeof REACTIONS)[number]['type']

export type ReactionCounts = Record<ReactionType, number>

export const EMPTY_REACTION_COUNTS: ReactionCounts = {
  like: 0,
  delicious: 0,
  mikan: 0,
  shine: 0,
}

export function isReactionType(value: unknown): value is ReactionType {
  return REACTIONS.some((reaction) => reaction.type === value)
}

export function createReactionCounts(): ReactionCounts {
  return { ...EMPTY_REACTION_COUNTS }
}
