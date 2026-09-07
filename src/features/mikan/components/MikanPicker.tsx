'use client'

import { Icon } from '@iconify/react'
import { MikanIcon } from './MikanIcon'
import styles from './MikanPicker.module.css'

export type MikanPickerVariety = {
  id: string
  name: string
  reading: string | null
  aliases: string[] | null
  alias_readings: string[] | null
  color: string
  shape: 'normal' | 'round' | 'flat' | 'egg' | 'deko' | 'unknown'
}

export const DEFAULT_MIKAN_LABELS = [
  '温州みかん',
  'せとか',
  '紅まどんな',
  '甘平',
  '甘夏',
  '不知火',
  '媛小春',
  'ブラッドオレンジ',
] as const

function normalize(value: string) {
  return value
    .normalize('NFKC')
    .trim()
    .toLocaleLowerCase('ja-JP')
    .replace(/[ァ-ヶ]/g, (character) =>
      String.fromCharCode(character.charCodeAt(0) - 0x60)
    )
}

function matchesLabel(variety: MikanPickerVariety, label: string) {
  const normalizedLabel = normalize(label)
  return normalize(variety.name) === normalizedLabel
    || (variety.aliases ?? []).some((alias) => normalize(alias) === normalizedLabel)
}

export function getMikanDisplayName(variety: MikanPickerVariety, preferredLabel?: string) {
  if (preferredLabel && matchesLabel(variety, preferredLabel)) return preferredLabel
  return variety.name
}

function getSearchTexts(variety: MikanPickerVariety) {
  return [
    variety.name,
    variety.reading,
    ...(variety.aliases ?? []),
    ...(variety.alias_readings ?? []),
  ].filter((value): value is string => Boolean(value))
}

function getResultLabel(variety: MikanPickerVariety, normalizedKeyword: string) {
  if (!normalizedKeyword) {
    return DEFAULT_MIKAN_LABELS.find((label) => matchesLabel(variety, label)) ?? variety.name
  }

  if (normalize(variety.name).includes(normalizedKeyword)) return variety.name
  if (variety.reading && normalize(variety.reading).includes(normalizedKeyword)) return variety.name

  const aliases = variety.aliases ?? []
  const aliasMatchIndex = aliases.findIndex((alias) => normalize(alias).includes(normalizedKeyword))
  if (aliasMatchIndex >= 0) return aliases[aliasMatchIndex]

  const aliasReadings = variety.alias_readings ?? []
  const aliasReadingMatchIndex = aliasReadings.findIndex((reading) =>
    normalize(reading).includes(normalizedKeyword)
  )
  if (aliasReadingMatchIndex >= 0) return aliases[aliasReadingMatchIndex] ?? variety.name

  return variety.name
}

export function MikanPicker({
  varieties,
  keyword,
  onKeywordChange,
  selectedIds = [],
  onSelect,
  maxResults = 10,
  ariaLabel = 'みかんの品種を検索',
  placeholder = 'みかんを検索...',
}: {
  varieties: MikanPickerVariety[]
  keyword: string
  onKeywordChange: (value: string) => void
  selectedIds?: string[]
  onSelect: (variety: MikanPickerVariety) => void
  maxResults?: number
  ariaLabel?: string
  placeholder?: string
}) {
  const normalizedKeyword = normalize(keyword)
  const selectedIdSet = new Set(selectedIds)

  const visibleVarieties = normalizedKeyword
    ? varieties
      .filter((variety) =>
        getSearchTexts(variety).some((value) => normalize(value).includes(normalizedKeyword))
      )
      .slice(0, maxResults)
    : DEFAULT_MIKAN_LABELS
      .map((label) => varieties.find((variety) => matchesLabel(variety, label)))
      .filter((variety): variety is MikanPickerVariety => Boolean(variety))

  return (
    <div className={styles.picker}>
      <div className={styles.searchBox}>
        <Icon icon="mdi:magnify" className={styles.searchIcon} aria-hidden="true" />
        <input
          type="search"
          aria-label={ariaLabel}
          placeholder={placeholder}
          value={keyword}
          className={styles.searchInput}
          onChange={(event) => onKeywordChange(event.target.value)}
        />
      </div>

      <div className={styles.varietyGrid}>
        {visibleVarieties.map((variety) => {
          const isSelected = selectedIdSet.has(variety.id)

          return (
            <button
              key={variety.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(variety)}
              className={`${styles.varietyCard} ${isSelected ? styles.selected : ''}`}
            >
              <MikanIcon color={variety.color} shape={variety.shape} size={42} />
              <span>{getResultLabel(variety, normalizedKeyword)}</span>
              {isSelected && (
                <Icon icon="mdi:check-circle" className={styles.selectedMark} aria-hidden="true" />
              )}
            </button>
          )
        })}
      </div>

      {visibleVarieties.length === 0 && (
        <p className={styles.noResult}>該当する品種が見つかりません</p>
      )}
    </div>
  )
}
