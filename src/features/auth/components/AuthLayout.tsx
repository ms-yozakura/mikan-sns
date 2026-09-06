import { MikanIcon } from '@/features/mikan/components/MikanIcon'
import { MikanBrandLogo } from '@/shared/ui/MikanBrandLogo'
import styles from './AuthLayout.module.css'

type AuthLayoutProps = {
  subtitle: string
  children: React.ReactNode
}

export default function AuthLayout({
  subtitle,
  children,
}: AuthLayoutProps) {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <header className={styles.header}>
          <span className={styles.logo} aria-hidden="true">
            <MikanIcon size={52} />
          </span>

          <h1 className={styles.title}>
            <MikanBrandLogo size="large" />
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
