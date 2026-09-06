'use client'

import { useEffect, useState, useTransition } from 'react'
import {
  deletePushSubscription,
  savePushSubscription,
  type PushSubscriptionInput,
} from '../actions/pushSubscription'
import styles from './PushNotificationControl.module.css'

type PushState =
  | 'loading'
  | 'unsupported'
  | 'install-required'
  | 'denied'
  | 'disabled'
  | 'enabled'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
}

function serializeSubscription(subscription: PushSubscription): PushSubscriptionInput | null {
  const json = subscription.toJSON()
  const p256dh = json.keys?.p256dh
  const auth = json.keys?.auth

  if (!json.endpoint || !p256dh || !auth) return null

  return {
    endpoint: json.endpoint,
    keys: { p256dh, auth },
  }
}

function isIosDevice() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

function isStandalone() {
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean }
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    navigatorWithStandalone.standalone === true
  )
}

export function PushNotificationControl() {
  const [state, setState] = useState<PushState>('loading')
  const [message, setMessage] = useState('')
  const [isPending, startTransition] = useTransition()
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

  useEffect(() => {
    const initialize = async () => {
      if (
        !('serviceWorker' in navigator) ||
        !('PushManager' in window) ||
        !('Notification' in window)
      ) {
        setState('unsupported')
        return
      }

      if (isIosDevice() && !isStandalone()) {
        setState('install-required')
        return
      }

      if (Notification.permission === 'denied') {
        setState('denied')
        return
      }

      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (!subscription) {
        setState('disabled')
        return
      }

      setState('enabled')

      const serialized = serializeSubscription(subscription)
      if (serialized) {
        void savePushSubscription(serialized)
      }
    }

    void initialize()
  }, [])

  const enablePush = () => {
    startTransition(async () => {
      setMessage('')

      if (!publicKey) {
        setMessage('プッシュ通知のサーバー設定がまだ完了していません。')
        return
      }

      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setState(permission === 'denied' ? 'denied' : 'disabled')
        return
      }

      try {
        const registration = await navigator.serviceWorker.ready
        const existing = await registration.pushManager.getSubscription()
        const subscription =
          existing ??
          (await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
          }))

        const serialized = serializeSubscription(subscription)
        if (!serialized) {
          throw new Error('Push subscription could not be serialized')
        }

        const result = await savePushSubscription(serialized)
        if (!result.success) {
          await subscription.unsubscribe()
          setMessage(result.error)
          setState('disabled')
          return
        }

        setState('enabled')
        setMessage('この端末へのプッシュ通知をオンにしました。')
      } catch (error) {
        console.error('PUSH SUBSCRIBE ERROR:', error)
        setState('disabled')
        setMessage('プッシュ通知をオンにできませんでした。')
      }
    })
  }

  const disablePush = () => {
    startTransition(async () => {
      setMessage('')

      try {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()

        if (subscription) {
          const result = await deletePushSubscription(subscription.endpoint)
          if (!result.success) {
            setMessage(result.error)
            return
          }
          await subscription.unsubscribe()
        }

        setState('disabled')
        setMessage('この端末へのプッシュ通知をオフにしました。')
      } catch (error) {
        console.error('PUSH UNSUBSCRIBE ERROR:', error)
        setMessage('プッシュ通知をオフにできませんでした。')
      }
    })
  }

  if (state === 'loading') {
    return <div className={styles.card}>通知設定を確認しています…</div>
  }

  if (state === 'unsupported') {
    return <div className={styles.card}>このブラウザではプッシュ通知を利用できません。</div>
  }

  if (state === 'install-required') {
    return (
      <div className={styles.card}>
        iPhone / iPadでは、MikanSNSをホーム画面に追加したアプリからプッシュ通知をオンにできます。
      </div>
    )
  }

  if (state === 'denied') {
    return (
      <div className={styles.card}>
        ブラウザ側で通知がブロックされています。端末の通知設定からMikanSNSを許可してください。
      </div>
    )
  }

  return (
    <div className={styles.card}>
      <div className={styles.copy}>
        <strong>プッシュ通知</strong>
        <span>{state === 'enabled' ? 'この端末で受け取ります' : 'この端末ではオフです'}</span>
      </div>
      <button
        type="button"
        className={state === 'enabled' ? styles.secondaryButton : styles.primaryButton}
        onClick={state === 'enabled' ? disablePush : enablePush}
        disabled={isPending}
      >
        {isPending ? '変更中…' : state === 'enabled' ? 'オフにする' : 'オンにする'}
      </button>
      {message ? <p className={styles.message}>{message}</p> : null}
    </div>
  )
}
