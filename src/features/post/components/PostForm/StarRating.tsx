'use client'

import styles from "./StarRating.module.css"

type Props = {
  value: number
  onChange: (value: number) => void
}

export function StarRating({
  value,
  onChange
}: Props) {

  return (
    <div className={styles.satisfactionWrapper}>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          className={styles.satisfactionStar}
          onClick={() =>
            onChange(star)
          }
        >
          {star <= value ? "★" : "☆"}
        </button>
      ))}
    </div>
  )
}
