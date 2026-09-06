'use client'

import styles from './SegmentedTabs.module.css'

type TabOption<T extends string> = {
  value: T
  label: string
}

type Props<T extends string> = {
  value: T
  options: readonly TabOption<T>[]
  onChange: (value: T) => void
  ariaLabel: string
  className?: string
}

export function SegmentedTabs<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  className,
}: Props<T>) {
  return (
    <div
      className={`${styles.tabs} ${className ?? ''}`}
      role="tablist"
      aria-label={ariaLabel}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option) => {
        const active = option.value === value

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            className={`${styles.tab} ${active ? styles.active : ''}`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
