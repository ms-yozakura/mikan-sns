'use client'

import { Icon } from "@iconify/react"
import type { MikanInput } from "../../types/post"
import type { Variety } from "@/features/mikan/types/Variety"
import { MikanIcon } from "@/features/mikan/components/MikanIcon"
import { StarRating } from "./StarRating"
import styles from "./MikanList.module.css"

export function MikanList({
  mikans,
  varieties,
  editingIndex,
  onSelect,
  onDelete,
  onQuantityChange,
  onSatisfactionChange,
}: {
  mikans: MikanInput[]
  varieties: Variety[]
  editingIndex: number
  onSelect: (index: number) => void
  onDelete: (index: number) => void
  onQuantityChange: (index: number, quantity: number) => void
  onSatisfactionChange: (index: number, satisfaction: number) => void
}) {
  return (
    <div className={styles.mikanList}>
      {mikans.map((mikan, index) => {
        const variety = varieties.find(v => v.id === mikan.variety_id)
        const isActive = index === editingIndex

        return (
          <article
            key={`${mikan.variety_id}-${index}`}
            className={`${styles.mikanCard} ${isActive ? styles.active : styles.compact}`}
          >
            <div className={styles.cardHeader}>
              <button
                type="button"
                className={styles.varietyButton}
                onClick={() => onSelect(index)}
                aria-pressed={isActive}
              >
                <MikanIcon
                  color={variety?.color ?? "#ff9800"}
                  shape={variety?.shape ?? "unknown"}
                  size={isActive ? 34 : 28}
                />
                <span className={styles.varietyText}>
                  <strong>{variety?.name || "不明"}</strong>
                  {!isActive && (
                    <small className={styles.compactSummary}>
                      <span>{mikan.quantity}個</span>
                      <span className={styles.ratingSummary}>
                        <Icon icon="mdi:star" aria-hidden="true" />
                        {mikan.satisfaction}
                      </span>
                    </small>
                  )}
                </span>
              </button>

              {mikans.length > 1 && (
                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={() => onDelete(index)}
                  aria-label={`${variety?.name || "みかん"}を削除`}
                >
                  <Icon icon="mdi:close" aria-hidden="true" />
                </button>
              )}
            </div>

            {isActive && (
              <div className={styles.cardControls}>
                <div className={styles.controlGroup}>
                  <span className={styles.controlLabel}>個数</span>
                  <div className={styles.quantityStepper}>
                    <button
                      type="button"
                      aria-label="個数を減らす"
                      onClick={() => onQuantityChange(index, Math.max(0, mikan.quantity - 1))}
                      disabled={mikan.quantity <= 0}
                    >
                      <Icon icon="mdi:minus" aria-hidden="true" />
                    </button>
                    <input
                      type="number"
                      min={0}
                      inputMode="numeric"
                      aria-label={`${variety?.name || "みかん"}の個数`}
                      value={mikan.quantity}
                      onChange={event => onQuantityChange(index, Math.max(0, Math.floor(Number(event.target.value || 0))))}
                    />
                    <button
                      type="button"
                      aria-label="個数を増やす"
                      onClick={() => onQuantityChange(index, mikan.quantity + 1)}
                    >
                      <Icon icon="mdi:plus" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className={styles.controlGroup}>
                  <span className={styles.controlLabel}>満足度</span>
                  <StarRating
                    value={mikan.satisfaction}
                    onChange={star => onSatisfactionChange(index, star)}
                  />
                </div>
              </div>
            )}
          </article>
        )
      })}
    </div>
  )
}
