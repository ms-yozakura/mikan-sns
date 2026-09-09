'use server'

import { createClient } from '@/infrastructure/supabase/server'
import { createAdminClient } from '@/infrastructure/supabase/admin'

type StorageEntry = {
  name: string
  id?: string | null
  metadata?: Record<string, unknown> | null
}

async function collectFiles(
  admin: NonNullable<ReturnType<typeof createAdminClient>>,
  bucket: string,
  path: string,
): Promise<string[]> {
  const { data, error } = await admin.storage.from(bucket).list(path, { limit: 1000 })

  if (error) throw error

  const files: string[] = []

  for (const entry of (data ?? []) as StorageEntry[]) {
    const entryPath = path ? `${path}/${entry.name}` : entry.name
    const isFolder = !entry.id && !entry.metadata

    if (isFolder) {
      files.push(...await collectFiles(admin, bucket, entryPath))
    } else {
      files.push(entryPath)
    }
  }

  return files
}

async function removeUserStorage(
  admin: NonNullable<ReturnType<typeof createAdminClient>>,
  userId: string,
) {
  for (const bucket of ['avatars', 'post_images']) {
    const files = await collectFiles(admin, bucket, userId)
    if (files.length === 0) continue

    const { error } = await admin.storage.from(bucket).remove(files)
    if (error) throw error
  }
}

export async function deleteAccount() {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { success: false, error: 'ログイン状態を確認できませんでした。再度ログインしてください。' }
  }

  const admin = createAdminClient()
  if (!admin) {
    return { success: false, error: 'アカウント削除機能の設定が不足しています。' }
  }

  try {
    // Supabase Authは所有中のStorageオブジェクトがあるユーザーを削除できないため先に消す。
    await removeUserStorage(admin, user.id)

    // DB側は auth.users -> public.users -> posts 以下を ON DELETE CASCADE で連鎖削除する。
    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id)
    if (deleteError) {
      return { success: false, error: deleteError.message }
    }

    // Cookieに残ったセッションも破棄する。ユーザー削除後なので失敗しても削除自体は完了済み。
    await supabase.auth.signOut().catch(() => undefined)

    return { success: true, error: '' }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'アカウントを削除できませんでした。',
    }
  }
}
