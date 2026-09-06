'use server'

import { createClient } from '@/infrastructure/supabase/server'
import { createAdminClient } from '@/infrastructure/supabase/admin'

export type PushSubscriptionInput = {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

type PushSubscriptionResult =
  | { success: true }
  | { success: false; error: string }

function isValidSubscription(subscription: PushSubscriptionInput) {
  return Boolean(
    subscription?.endpoint &&
    subscription?.keys?.p256dh &&
    subscription?.keys?.auth
  )
}

export async function savePushSubscription(
  subscription: PushSubscriptionInput
): Promise<PushSubscriptionResult> {
  if (!isValidSubscription(subscription)) {
    return { success: false, error: '通知端末の情報が不正です。' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'ログインが必要です。' }
  }

  const admin = createAdminClient()
  if (!admin) {
    return { success: false, error: 'プッシュ通知のサーバー設定が未完了です。' }
  }

  const { error } = await admin.from('push_subscriptions').upsert(
    {
      user_id: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'endpoint' }
  )

  if (error) {
    console.error('PUSH SUBSCRIPTION UPSERT ERROR:', error)
    return { success: false, error: 'プッシュ通知を登録できませんでした。' }
  }

  return { success: true }
}

export async function deletePushSubscription(
  endpoint: string
): Promise<PushSubscriptionResult> {
  if (!endpoint) {
    return { success: true }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'ログインが必要です。' }
  }

  const admin = createAdminClient()
  if (!admin) {
    return { success: false, error: 'プッシュ通知のサーバー設定が未完了です。' }
  }

  const { error } = await admin
    .from('push_subscriptions')
    .delete()
    .eq('user_id', user.id)
    .eq('endpoint', endpoint)

  if (error) {
    console.error('PUSH SUBSCRIPTION DELETE ERROR:', error)
    return { success: false, error: 'プッシュ通知を解除できませんでした。' }
  }

  return { success: true }
}
