import { Darumadrop_One } from "next/font/google"
import styles from "./MikanBrandLogo.module.css"

const darumadrop = Darumadrop_One({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
})

type Props = {
  size?: "compact" | "default" | "large"
  className?: string
}

export function MikanBrandLogo({ size = "default", className = "" }: Props) {
  return (
    <span
      className={`${darumadrop.className} ${styles.brand} ${styles[size]} ${className}`.trim()}
      aria-label="MikanSNS"
    >
      <span className={styles.mikan}>Mikan</span>
      <span className={styles.sns}>SNS</span>
    </span>
  )
}
