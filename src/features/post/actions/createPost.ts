'use server'

import { createClient } from '@/infrastructure/supabase/server'
import { revalidatePath } from 'next/cache'


type State = {
  error: string
  success: boolean
  post?: any
}


export async function createPost(
  prevState: State,
  formData: FormData
): Promise<State> {


  const supabase = await createClient()

  const body = formData.get('body') as string

  const visibility=formData.get("visibility") as string

  const images = JSON.parse(formData.get('images') as string ?? "[]")
  const mikans = JSON.parse(
    formData.get("mikans") as string ?? "[]"
  )

  if (!body.trim()) {
    return {
      error: '本文を入力してね',
      success: false
    }
  }
  const { data: { user } } = await supabase.auth.getUser()


  if (!user) {
    return {
      error: 'ログインしてください',
      success: false
    }
  }

  try {
    // 投稿を作成
    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        body,
        visibility
      })
      .select()
      .single()
    if (error || !post) throw error

    // 投稿に紐づくみかん記録を作成
    if (mikans.length) {
      const { error } = await supabase
        .from("post_mikans")
        .insert(
          mikans.map((m: any) => ({
            post_id: post.id,
            variety_id: m.variety_id,
            quantity: Number(m.quantity),
            satisfaction: m.satisfaction
          }))
        )
      if (error) throw error
    }

    // 投稿に紐づく画像データを保存
    if (images.length) {
      const { error: imageError } = await supabase
        .from('post_images')
        .insert(
          images.map(
            (img: any) => ({
              post_id: post.id, 
              url: img.url, 
              thumbnail_url: img.thumbnail_url,
              order_index: img.order_index
            })
          )
        )
      if (imageError) throw imageError
    }

    // 投稿全体を取得し直す
    const { data: newpost } = await supabase
      .from("posts")
      .select(`
        *,
        users(*),
        post_images(*),
        post_mikans(
          *,
          mikan_varieties(*)
        ) 
      `)
      .eq("id", post.id)
      .single()

    // トップページのキャッシュを更新（一応）
    revalidatePath('/home')

    return {
      error: '',
      success: true,
      post: newpost
    }
  } catch (e) {
    return {
      error:
        e instanceof Error
          ? e.message
          : '投稿失敗',
      success: false
    }
  }
}
