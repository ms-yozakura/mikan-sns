'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import { MikanIcon } from '@/features/mikan/components/MikanIcon'
import { SegmentedTabs } from '@/shared/ui/SegmentedTabs'
import type { MikanCalendarData } from '../actions/getMikanCalendarData'
import styles from './MikanCalendarPage.module.css'

type View = 'calendar' | 'dictionary'

const VIEW_TABS = [
  { value: 'calendar', label: 'みかんカレンダー' },
  { value: 'dictionary', label: 'みかん図鑑' },
] as const

const WEEKDAYS = ['月', '火', '水', '木', '金', '土', '日']

function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

function mondayIndex(year: number, month: number) {
  const sundayFirst = new Date(Date.UTC(year, month - 1, 1)).getUTCDay()
  return (sundayFirst + 6) % 7
}

function currentJstDate() {
  const jst = new Date(Date.now() + 9 * 60 * 60 * 1000)
  return {
    year: jst.getUTCFullYear(),
    month: jst.getUTCMonth() + 1,
    day: jst.getUTCDate(),
  }
}

export function MikanCalendarClient({ data }: { data: MikanCalendarData }) {
  const router = useRouter()
  const [view, setView] = useState<View>('calendar')
  const today = currentJstDate()
  const defaultSelected =
    today.year === data.year && today.month === data.month
      ? today.day
      : data.dayRecords[0]?.day ?? null
  const [selectedDay, setSelectedDay] = useState<number | null>(defaultSelected)

  const dayMap = useMemo(
    () => new Map(data.dayRecords.map((record) => [record.day, record])),
    [data.dayRecords]
  )

  const cells = useMemo(() => {
    const leading = mondayIndex(data.year, data.month)
    const count = daysInMonth(data.year, data.month)
    const values: Array<number | null> = [
      ...Array.from({ length: leading }, () => null),
      ...Array.from({ length: count }, (_, index) => index + 1),
    ]
    while (values.length % 7 !== 0) values.push(null)
    return values
  }, [data.year, data.month])

  const selectedRecord = selectedDay ? dayMap.get(selectedDay) : undefined

  function moveMonth(delta: number) {
    const next = new Date(Date.UTC(data.year, data.month - 1 + delta, 1))
    router.push(`/calendar?year=${next.getUTCFullYear()}&month=${next.getUTCMonth() + 1}`)
  }

  function goCurrentMonth() {
    router.push(`/calendar?year=${today.year}&month=${today.month}`)
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <div>
            <p className={styles.eyebrow}>MY MIKAN LOG</p>
            <h1>みかんカレンダー</h1>
          </div>
          <span className={styles.headerFruit} aria-hidden="true">
            <MikanIcon size={58} />
          </span>
        </div>
        <p className={styles.description}>食べたみかんを、日付と品種から振り返れます。</p>
      </header>

      <SegmentedTabs
        value={view}
        options={VIEW_TABS}
        onChange={setView}
        ariaLabel="みかん記録の表示切り替え"
        className={styles.viewTabs}
      />

      {view === 'calendar' ? (
        <>
          <section className={styles.calendarCard} aria-label={`${data.year}年${data.month}月のみかんカレンダー`}>
            <div className={styles.monthControls}>
              <button type="button" className={styles.iconButton} onClick={() => moveMonth(-1)} aria-label="前の月">
                <Icon icon="mdi:chevron-left" aria-hidden="true" />
              </button>
              <h2>{data.year}年 {data.month}月</h2>
              <div className={styles.monthActions}>
                <button type="button" className={styles.iconButton} onClick={() => moveMonth(1)} aria-label="次の月">
                  <Icon icon="mdi:chevron-right" aria-hidden="true" />
                </button>
                <button type="button" className={styles.todayButton} onClick={goCurrentMonth}>今月</button>
              </div>
            </div>

            <div className={styles.weekdays} aria-hidden="true">
              {WEEKDAYS.map((weekday) => <span key={weekday}>{weekday}</span>)}
            </div>

            <div className={styles.calendarGrid}>
              {cells.map((day, index) => {
                if (!day) return <span key={`blank-${index}`} className={styles.blankCell} />
                const record = dayMap.get(day)
                const isSelected = selectedDay === day
                const firstVariety = record?.varieties[0]

                return (
                  <button
                    key={day}
                    type="button"
                    className={`${styles.dayCell} ${isSelected ? styles.selectedDay : ''}`}
                    onClick={() => setSelectedDay(day)}
                    aria-label={record ? `${data.month}月${day}日、${record.quantity}個` : `${data.month}月${day}日、記録なし`}
                  >
                    <span className={styles.dayNumber}>{day}</span>
                    {firstVariety ? (
                      <span className={styles.dayFruit} aria-hidden="true">
                        <MikanIcon color={firstVariety.color} shape={firstVariety.shape} size={25} />
                        {record && record.varieties.length > 1 ? (
                          <small>+{record.varieties.length - 1}</small>
                        ) : null}
                      </span>
                    ) : null}
                  </button>
                )
              })}
            </div>

            {selectedDay ? (
              <div className={styles.selectedSummary}>
                <strong>{data.month}月{selectedDay}日</strong>
                {selectedRecord ? (
                  <span>{selectedRecord.quantity}個 ・ {selectedRecord.varieties.map((item) => item.name).join(' / ')}</span>
                ) : (
                  <span>みかんの記録はありません</span>
                )}
              </div>
            ) : null}
          </section>

          <div className={styles.summaryGrid}>
            <section className={styles.summaryCard}>
              <div className={styles.summaryHeading}>
                <h2>{data.month}月の記録</h2>
                <Icon icon="mdi:calendar-check-outline" aria-hidden="true" />
              </div>
              <p className={styles.totalCount}><strong>{data.totalQuantity.toLocaleString('ja-JP')}</strong>個</p>
              <span className={styles.summaryHint}>記録のある日 {data.dayRecords.length}日</span>
            </section>

            <section className={styles.summaryCard}>
              <div className={styles.summaryHeading}>
                <h2>よく食べた品種</h2>
                <Icon icon="mdi:crown-outline" aria-hidden="true" />
              </div>
              {data.ranking.length > 0 ? (
                <ol className={styles.rankingList}>
                  {data.ranking.slice(0, 3).map((item, index) => (
                    <li key={item.id}>
                      <span className={styles.rank}>{index + 1}</span>
                      <MikanIcon color={item.color} shape={item.shape} size={28} />
                      <strong>{item.name}</strong>
                      <span>{item.quantity}個</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className={styles.emptyText}>今月の品種記録はまだありません。</p>
              )}
            </section>
          </div>
        </>
      ) : (
        <section className={styles.dictionarySection}>
          <div className={styles.dictionaryHeader}>
            <div>
              <p className={styles.eyebrow}>MIKAN COLLECTION</p>
              <h2>みかん図鑑</h2>
              <p>Supabase の品種マスターから、登録されているみかんを一覧表示しています。</p>
            </div>
            <div className={styles.progressBadge}>
              <strong>{data.discoveredCount}</strong>
              <span>/ {data.varieties.length} 品種</span>
            </div>
          </div>

          <div className={styles.dictionaryGrid}>
            {data.varieties.map((variety) => (
              <article
                key={variety.id}
                className={`${styles.varietyCard} ${variety.discovered ? styles.discoveredCard : styles.undiscoveredCard}`}
              >
                <div className={styles.varietyIcon}>
                  <MikanIcon
                    color={variety.discovered ? variety.color : '#d8d2c7'}
                    shape={variety.discovered ? variety.shape : 'unknown'}
                    size={54}
                  />
                </div>
                <div className={styles.varietyCopy}>
                  <h3>{variety.name}</h3>
                  <p>{variety.discovered ? `${variety.quantity}個 記録済み` : 'まだ未記録'}</p>
                </div>
                {variety.discovered ? (
                  <Icon icon="mdi:check-circle" className={styles.discoveredIcon} aria-label="記録済み" />
                ) : null}
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
