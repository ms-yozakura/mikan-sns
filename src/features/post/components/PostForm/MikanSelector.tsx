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

  const filtered = varieties.filter(v => v.name.includes(keyword))
  const selected = varieties.find(v => v.id === selectedVariety)

  return (
    <div className={styles.mikanSearchWrapper}>
      <label>
        <div className={styles.varietyTitle}>
          品種
          {
            selected && (
              <>
                ：
                <MikanIcon color={selected.color} shape={selected.shape} />
                {selected.name}

              </>
            )
          }
        </div>

        <div className={styles.searchBox}>
          <Icon
            icon="mdi:magnify"
            className={styles.searchIcon}
          />

          <input
            placeholder="みかんを検索"
            value={keyword}
            className={styles.mikanSearchInput}
            onChange={e => setKeyword(e.target.value)}
          />
        </div>
        <div>
          {
            filtered.map(v => (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedVariety(v.id)}
                className={`
                  ${styles.varietyOption}
                  ${v.id === selectedVariety ? styles.selected : ""}
                `}
              >
                {v.name}
              </button>
            ))
          }
        </div>
      </label>
    </div>
  )
}
