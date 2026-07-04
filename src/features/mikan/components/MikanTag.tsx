
import { MikanIcon } from './MikanIcon';
import styles from './MikanTag.module.css';
import { Variety } from '../types/Variety';

type MikanReport = {
  name: string;
  quantity: number;
  satisfaction: number;
};

export default function MikanTag({ mikan, variety }: { mikan: MikanReport, variety?: Variety }) {
  return (
    <div
      className={styles.mikanTag}
    >
      <MikanIcon
        color={variety?.color}
        shape={variety?.shape}
      />

      <span className={styles.name}>
        {mikan.name}
      </span>

      <span className={styles.quantity} >
        {mikan.quantity}個
      </span>

      <span className={styles.satisfaction}>
        {[1, 2, 3, 4, 5].map(star => {
          return (
            star <= mikan.satisfaction ? "★" : "☆"
          )
        })}
      </span>

    </div>)
}
