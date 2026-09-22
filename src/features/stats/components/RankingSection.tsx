import Link from "next/link"
import defaultAvatar from "@/img/default-avatar.jpg"
import { MikanIcon } from "@/features/mikan/components/MikanIcon"
import type {
  GlobalStatsRankingItem,
  GlobalStatsUserRankingItem,
} from "../types/types"
import styles from "./RankingSection.module.css"

type VarietyRankingProps = {
  title: string
  eyebrow: string
  items: GlobalStatsRankingItem[]
  emptyMessage?: string
}

type UserRankingProps = {
  title: string
  eyebrow: string
  items: GlobalStatsUserRankingItem[]
  emptyMessage?: string
}

function Medal({ rank }: { rank: number }) {
  return <span className={styles.rank}>{rank}</span>
}

export function VarietyRankingSection({
  title,
  eyebrow,
  items,
  emptyMessage = "品種別の記録はまだありません",
}: VarietyRankingProps) {
  return (
    <section className={styles.rankingSection}>
      <div className={styles.heading}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 className={styles.sectionTitle}>{title}</h2>
      </div>
      {items.length > 0 ? (
        <ol className={styles.rankingList}>
          {items.map((item, index) => (
            <li key={item.id} className={`${styles.rankingItem} ${index < 3 ? styles.podium : ""}`}>
              <Medal rank={index + 1} />
              <span className={styles.visual} aria-hidden="true">
                <MikanIcon
                  color={item.color ?? "#ff9800"}
                  shape={item.shape ?? "normal"}
                  size={index === 0 ? 54 : 44}
                />
              </span>
              <div className={styles.itemBody}>
                <span className={styles.itemName}>{item.name}</span>
                <span className={styles.itemMeta}>{item.count.toLocaleString("ja-JP")}個 食べられました</span>
              </div>
              <strong className={styles.count}>{item.count.toLocaleString("ja-JP")}</strong>
            </li>
          ))}
        </ol>
      ) : (
        <p className={styles.empty}>{emptyMessage}</p>
      )}
    </section>
  )
}

export function UserRankingSection({
  title,
  eyebrow,
  items,
  emptyMessage = "ユーザー別の記録はまだありません",
}: UserRankingProps) {
  return (
    <section className={styles.rankingSection}>
      <div className={styles.heading}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 className={styles.sectionTitle}>{title}</h2>
      </div>
      {items.length > 0 ? (
        <ol className={styles.rankingList}>
          {items.map((item, index) => (
            <li key={item.id} className={`${styles.rankingItem} ${index < 3 ? styles.podium : ""}`}>
              <Medal rank={index + 1} />
              <Link href={`/user/${item.id}`} className={styles.avatarLink}>
                <img
                  src={item.avatarUrl ?? defaultAvatar.src}
                  alt=""
                  className={`${styles.avatar} ${index === 0 ? styles.avatarFirst : ""}`}
                />
              </Link>
              <div className={styles.itemBody}>
                <Link href={`/user/${item.id}`} className={styles.itemName}>
                  {item.name}
                </Link>
                <span className={styles.itemMeta}>{item.count.toLocaleString("ja-JP")}個を記録</span>
              </div>
              <strong className={styles.count}>{item.count.toLocaleString("ja-JP")}</strong>
            </li>
          ))}
        </ol>
      ) : (
        <p className={styles.empty}>{emptyMessage}</p>
      )}
    </section>
  )
}
