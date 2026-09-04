'use client'

import { Icon } from "@iconify/react"
import { MikanIcon } from "@/features/mikan/components/MikanIcon"
import styles from "./PostForm.module.css"

type Variety = {
  id: string
  name: string
  color: string
  shape: "normal" | "round" | "flat" | "egg" | "deko" | "unknown"
}

export function MikanSelector({
  varieties,
  keyword,
  setKeyword,
  selectedVariety,
  setSelectedVariety
}: {
  varieties: Variety[]
  keyword: string
  setKeyword: (value: string) => void
  selectedVariety: string
  setSelectedVariety: (id: string) => void
}) {
  const normalizedKeyword = keyword.trim().toLocaleLowerCase("ja-JP")
  const selected = varieties.find(v => v.id === selectedVariety)
  const visibleVarieties = normalizedKeyword
    ? varieties
      .filter(v => v.name.toLocaleLowerCase("ja-JP").includes(normalizedKeyword))
      .slice(0, 8)
    : [
      ...(selected ? [selected] : []),
      ...varieties.filter(v => v.id !== selectedVariety),
    ].slice(0, 8)

  return (
    <div className={styles.mikanSelector}>
      <div className={styles.searchBox}>
        <Icon
          icon="mdi:magnify"
          className={styles.searchIcon}
          aria-hidden="true"
        />
        <input
          type="search"
          aria-label="みかんの品種を検索"
          placeholder="みかんを検索..."
          value={keyword}
          className={styles.mikanSearchInput}
          onChange={e => setKeyword(e.target.value)}
        />
      </div>

      <div className={styles.varietyGrid}>
        {visibleVarieties.map(v => {
          const isSelected = v.id === selectedVariety

          return (
            <button
              key={v.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setSelectedVariety(v.id)}
              className={`${styles.varietyCard} ${isSelected ? styles.selected : ""}`}
            >
              <MikanIcon color={v.color} shape={v.shape} size={42} />
              <span>{v.name}</span>
              {isSelected && (
                <Icon icon="mdi:check-circle" className={styles.selectedMark} aria-hidden="true" />
              )}
            </button>
          )
        })}
      </div>

      {visibleVarieties.length === 0 && (
        <p className={styles.noVarietyResult}>該当する品種が見つかりません</p>
      )}
    </div>
  )
}
