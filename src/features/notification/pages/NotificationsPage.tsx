import { getNotifications } from '../actions/getNotifications'
import { NotificationsList } from '../components/NotificationsList'
import styles from './NotificationsPage.module.css'

export async function NotificationsPage() {
  const notifications = await getNotifications()

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <h1>通知</h1>
      </header>
      <NotificationsList notifications={notifications} />
    </section>
  )
}

