
import { MikanIcon } from './MikanIcon';
import styles from './MikanTag.module.css';
import { Variety } from '../types/Variety';

type MikanReport = {
  name: string;
  quantity: number;
  satisfaction: number;
};

export default function MikanTag({
  mikan,
  variety,
  hasTasteReview = false,
  slim = false,
}: {
  mikan: MikanReport
  variety?: Variety
  hasTasteReview?: boolean
  slim?: boolean
}) {
  return (
    <div className={`${styles.mikanTag} ${slim ? styles.slim : ""}`}>
      <span className={styles.iconBox}>
        <MikanIcon color={variety?.color} shape={variety?.shape} size={30} />
      </span>

      <span className={styles.content}>
        <span className={styles.heading}>
          <span className={styles.name}>{mikan.name}</span>
          <span className={styles.quantity}>{mikan.quantity}個</span>
        </span>
        <span className={styles.meta}>
          <span className={styles.satisfaction} aria-label={`満足度 ${mikan.satisfaction} / 5`}>
            {[1, 2, 3, 4, 5].map(star => (
              <span key={star} className={star <= mikan.satisfaction ? styles.starFilled : styles.starEmpty}>
                ★
              </span>
            ))}
          </span>
          {hasTasteReview && (
            <span className={styles.reviewBadge}>
              <span className={styles.reviewMark} aria-hidden="true">◆</span>
              味レビューあり
            </span>
          )}
        </span>
      </span>
    </div>
  )
}
