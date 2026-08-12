'use client'

import type { MikanInput } from "../../types/post"
import type { Variety } from "@/features/mikan/types/Variety"
import styles from "./MikanList.module.css"
import MikanTag from "@/features/mikan/components/MikanTag"


export function MikanList({
  mikans,
  varieties,
  onDelete
}: {
  mikans: MikanInput[]
  varieties: Variety[]
  onDelete: (index: number) => void
}) {

  return (
    <div className={styles.mikanList}>
      {
        mikans.map(
          (mikan, index) => {
            const variety = varieties.find(v => v.id === mikan.variety_id)
            return (
              <div
                key={`${mikan.variety_id}-${index}`}
                className={styles.mikanTagContainer}
              >
                <MikanTag mikan={
                  {
                    name: variety?.name || "不明",
                    quantity: mikan.quantity,
                    satisfaction: mikan.satisfaction
                  }
                }
                  variety={variety}
                  hasTasteReview={typeof mikan.sweetness === "number"}
                />
                {mikans.length > 1 && (
                  <button
                    type="button"
                    className={styles.deleteButton}
                    onClick={() => onDelete(index)}
                    aria-label={`${variety?.name || "みかん"}を削除`}
                  >
                    ×
                  </button>
                )}
              </div>
            )
          }
        )
      }
    </div>
  )
}
