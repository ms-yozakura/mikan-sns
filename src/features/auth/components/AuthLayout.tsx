import styles from './AuthLayout.module.css'

type AuthLayoutProps = {
  title: string
  subtitle: string
  children: React.ReactNode
}

export default function AuthLayout({
  title,
  subtitle,
  children,
}: AuthLayoutProps) {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <header className={styles.header}>
          <span
            className={styles.logo}
            role="img"
            aria-label="mikan"
          >
            🍊
          </span>

          <h1 className={styles.title}>
            {title}
          </h1>

          <p className={styles.subtitle}>
            {subtitle}
          </p>
        </header>

        {children}
      </div>
    </div>
  )
}
