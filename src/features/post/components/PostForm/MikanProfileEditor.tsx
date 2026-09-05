'use client'

import { MIKAN_AXES_CONFIG, type MikanProfileKey, type MikanProfileValues } from '../../types/mikanProfile'
import styles from './MikanProfileEditor.module.css'

export function MikanProfileEditor({
  values,
  onChange,
  shortComment = '',
  onShortCommentChange,
}: {
  values: MikanProfileValues
  onChange: (values: MikanProfileValues) => void
  shortComment?: string
  onShortCommentChange?: (value: string) => void
}) {
  return (
    <div className={styles.editor}>
      <div className={styles.controls}>
        {MIKAN_AXES_CONFIG.map((axis) => {
          const key = axis.key as MikanProfileKey
          return (
            <label key={key} className={styles.control}>
              <span className={styles.controlHeader}>
                <span>{axis.label}</span>
                <output>{values[key]}</output>
              </span>
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={values[key]}
                aria-label={axis.label}
                onChange={(event) => onChange({ ...values, [key]: Number(event.target.value) })}
              />
            </label>
          )
        })}
      </div>

      <label className={styles.shortCommentField}>
        <span className={styles.shortCommentHeader}>
          <span>一言感想</span>
          <span>{shortComment.length}/20</span>
        </span>
        <input
          type="text"
          value={shortComment}
          maxLength={20}
          placeholder="例：香りが最高！"
          onChange={(event) => onShortCommentChange?.(event.target.value)}
        />
      </label>
    </div>
  )
}
