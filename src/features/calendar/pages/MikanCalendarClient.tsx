'use client'

import { useEffect, useMemo, useState } from 'react'
import { Icon } from '@iconify/react'
import { MikanIcon } from '@/features/mikan/components/MikanIcon'
import { SegmentedTabs } from '@/shared/ui/SegmentedTabs'
import {
  getMikanCalendarData,
  type MikanCalendarData,
  type VarietyDiscovery,
} from '../actions/getMikanCalendarData'
import styles from './MikanCalendarPage.module.css'
import detailStyles from './MikanVarietyDetail.module.css'
import dictionaryStyles from './MikanDictionaryControls.module.css'

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

function defaultSelectedDay(data: MikanCalendarData, today: ReturnType<typeof currentJstDate>) {
  return today.year === data.year && today.month === data.month
    ? today.day
    : data.dayRecords[0]?.day ?? null
}

function parentLabel(variety: VarietyDiscovery) {
  if (variety.parent1 && variety.parent2) {
    return `${variety.parent1.name} × ${variety.parent2.name}`
  }
  return variety.parent1?.name ?? variety.parent2?.name ?? '親情報なし'
}

export function MikanCalendarClient({ data: initialData }: { data: MikanCalendarData }) {
  const [data, setData] = useState(initialData)
  const [view, setView] = useState<View>('calendar')
  const [monthLoading, setMonthLoading] = useState(false)
  const [selectedVariety, setSelectedVariety] = useState<VarietyDiscovery | null>(null)
  const [showIntermediate, setShowIntermediate] = useState(false)
  const today = currentJstDate()
  const [selectedDay, setSelectedDay] = useState<number | null>(() => defaultSelectedDay(initialData, today))

  useEffect(() => {
    if (!selectedVariety) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedVariety(null)
    }
    document.addEventListener('keydown', onKeyDown)
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = originalOverflow
    }
  }, [selectedVariety])

  const dayMap = useMemo(
    () => new Map(data.dayRecords.map((record) => [record.day, record])),
    [data.dayRecords]
  )

  const dictionaryVarieties = useMemo(
    () => data.varieties.filter((variety) => showIntermediate || variety.varietyType !== 'intermediate'),
    [data.varieties, showIntermediate]
  )

  const dictionaryDiscoveredCount = useMemo(
    () => dictionaryVarieties.filter((variety) => variety.discovered).length,
    [dictionaryVarieties]
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

  async function loadMonth(year: number, month: number) {
    if (monthLoading || (year === data.year && month === data.month)) return

    setMonthLoading(true)
    try {
      const nextData = await getMikanCalendarData(year, month)
      setData(nextData)
      setSelectedDay(defaultSelectedDay(nextData, today))

      const url = new URL(window.location.href)
      url.searchParams.set('year', String(nextData.year))
      url.searchParams.set('month', String(nextData.month))
      window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`)
    } finally {
      setMonthLoading(false)
    }
  }

  function moveMonth(delta: number) {
    const next = new Date(Date.UTC(data.year, data.month - 1 + delta, 1))
    void loadMonth(next.getUTCFullYear(), next.getUTCMonth() + 1)
  }

  function goCurrentMonth() {
    void loadMonth(today.year, today.month)
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <div>
            <p className={styles.eyebrow}>わたしの記録</p>
            <h1>みかんログ</h1>
          </div>
          <span className={styles.headerFruit} aria-hidden="true">
            <MikanIcon size={58} />
          </span>
        </div>
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
              <button
                type="button"
                className={styles.iconButton}
                onClick={() => moveMonth(-1)}
                aria-label="前の月"
                disabled={monthLoading}
              >
                <Icon icon="mdi:chevron-left" aria-hidden="true" />
              </button>
              <h2>{data.year}年 {data.month}月</h2>
              <div className={styles.monthActions}>
                <button
                  type="button"
                  className={styles.iconButton}
                  onClick={() => moveMonth(1)}
                  aria-label="次の月"
                  disabled={monthLoading}
                >
                  <Icon icon="mdi:chevron-right" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={styles.todayButton}
                  onClick={goCurrentMonth}
                  disabled={monthLoading || (data.year === today.year && data.month === today.month)}
                >
                  今月
                </button>
              </div>
            </div>

            <div className={styles.weekdays} aria-hidden="true">
              {WEEKDAYS.map((weekday) => <span key={weekday}>{weekday}</span>)}
            </div>

            <div className={styles.calendarGrid} aria-busy={monthLoading}>
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
              <h2>みかん図鑑</h2>
            </div>
            <div className={styles.progressBadge}>
              <strong>{dictionaryDiscoveredCount}</strong>
              <span>/ {dictionaryVarieties.length} 品種</span>
            </div>
          </div>

          <div className={dictionaryStyles.controls}>
            <label className={dictionaryStyles.toggleLabel}>
              <span>中間種を表示</span>
              <input
                type="checkbox"
                checked={showIntermediate}
                onChange={(event) => setShowIntermediate(event.target.checked)}
              />
              <span className={dictionaryStyles.toggleTrack} aria-hidden="true" />
            </label>
          </div>

          <div className={styles.dictionaryGrid}>
            {dictionaryVarieties.map((variety) => (
              <button
                type="button"
                key={variety.id}
                className={`${styles.varietyCard} ${detailStyles.clickableCard} ${variety.discovered ? styles.discoveredCard : styles.undiscoveredCard}`}
                onClick={() => setSelectedVariety(variety)}
                aria-label={`${variety.name}の詳細を見る`}
              >
                <div className={styles.varietyIcon}>
                  <MikanIcon
                    color={variety.discovered ? variety.color : '#d8d2c7'}
                    shape={variety.discovered ? variety.shape : 'unknown'}
                    size={54}
                  />
                </div>
                <div className={styles.varietyCopy}>
                  {variety.varietyType === 'intermediate' ? (
                    <span className={dictionaryStyles.intermediateBadge}>中間種</span>
                  ) : null}
                  <h3>{variety.name}</h3>
                  <p>{variety.discovered ? `${variety.quantity}個 記録済み` : 'まだ未記録'}</p>
                </div>
                {variety.discovered ? (
                  <Icon icon="mdi:check-circle" className={styles.discoveredIcon} aria-label="記録済み" />
                ) : null}
                <Icon icon="mdi:chevron-right" className={detailStyles.detailHint} aria-hidden="true" />
              </button>
            ))}
          </div>
        </section>
      )}

      {selectedVariety ? (
        <div
          className={detailStyles.modalBackdrop}
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setSelectedVariety(null)
          }}
        >
          <section
            className={detailStyles.detailModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="variety-detail-title"
          >
            <button
              type="button"
              className={detailStyles.modalClose}
              onClick={() => setSelectedVariety(null)}
              aria-label="閉じる"
            >
              <Icon icon="mdi:close" aria-hidden="true" />
            </button>

            <div className={detailStyles.modalHero}>
              <div className={detailStyles.modalFruit}>
                <MikanIcon color={selectedVariety.color} shape={selectedVariety.shape} size={76} />
              </div>
              <div className={detailStyles.modalTitleBlock}>
                <span className={detailStyles.statusPill}>
                  {selectedVariety.discovered ? `${selectedVariety.quantity}個 記録済み` : 'まだ未記録'}
                </span>
                {selectedVariety.varietyType === 'intermediate' ? (
                  <span className={dictionaryStyles.intermediateBadge}>中間種</span>
                ) : null}
                <h2 id="variety-detail-title">{selectedVariety.name}</h2>
                {selectedVariety.aliases.length > 0 ? (
                  <p className={detailStyles.aliases}>{selectedVariety.aliases.join('・')}</p>
                ) : null}
              </div>
            </div>

            <div className={detailStyles.detailSection}>
              <h3>親品種</h3>
              <p className={detailStyles.parentLine}>
                <Icon icon="mdi:source-branch" aria-hidden="true" />
                {parentLabel(selectedVariety)}
              </p>
            </div>

            <div className={detailStyles.detailSection}>
              <h3>品種について</h3>
              <p>{selectedVariety.description ?? '説明はまだありません。'}</p>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  )
}
