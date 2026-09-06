import webpush from 'web-push'
import { createAdminClient } from '@/infrastructure/supabase/admin'

type PushPayload = {
  title: string
  body: string
  url: string
  tag?: string
}

type StoredPushSubscription = {
  id: string
  endpoint: string
  p256dh: string
  auth: string
}

function configureWebPush() {
  const subject = process.env.VAPID_SUBJECT
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY

  if (!subject || !publicKey || !privateKey) {
    return false
  }

  webpush.setVapidDetails(subject, publicKey, privateKey)
  return true
}

function getStatusCode(error: unknown) {
  if (typeof error !== 'object' || error === null || !('statusCode' in error)) {
    return undefined
  }

  return Number((error as { statusCode?: number }).statusCode)
}

export async function sendPushToUser(userId: string, payload: PushPayload) {
  if (!configureWebPush()) return

  const admin = createAdminClient()
  if (!admin) return

  const { data, error } = await admin
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .eq('user_id', userId)

  if (error) {
    console.error('PUSH SUBSCRIPTION SELECT ERROR:', error)
    return
  }

  const subscriptions = (data ?? []) as StoredPushSubscription[]

  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          JSON.stringify(payload)
        )
      } catch (error) {
        const statusCode = getStatusCode(error)

        if (statusCode === 404 || statusCode === 410) {
          await admin
            .from('push_subscriptions')
            .delete()
            .eq('id', subscription.id)
          return
        }

        console.error('WEB PUSH SEND ERROR:', error)
      }
    })
  )
}
