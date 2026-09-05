'use server'

import { createClient } from '@/infrastructure/supabase/server'
import { revalidatePath } from 'next/cache'
import { MIKAN_PROFILE_KEYS, type MikanProfileKey } from '../types/mikanProfile'
import type { MikanInput } from '../types/post'

type State = {
  error: string
  success: boolean
  post?: any
}

function parseMikans(value: FormDataEntryValue | null): MikanInput[] {
  const parsed: unknown = JSON.parse(typeof value === 'string' ? value : '[]')
  if (!Array.isArray(parsed)) throw new Error('みかん情報が不正です')

  const evaluatedVarieties = new Set<string>()
  const commentedVarieties = new Set<string>()

  return parsed.map((item): MikanInput => {
    if (!item || typeof item !== 'object') throw new Error('みかん情報が不正です')
    const source = item as Record<string, unknown>
    const quantity = Number(source.quantity)
    const satisfaction = Number(source.satisfaction)
    if (typeof source.variety_id !== 'string' || !Number.isInteger(quantity) || quantity < 0) {
      throw new Error('品種または個数が不正です')
    }
    if (!Number.isInteger(satisfaction) || satisfaction < 1 || satisfaction > 5) {
      throw new Error('満足度が不正です')
    }

    const entries = MIKAN_PROFILE_KEYS.map((key) => [key, source[key]] as const)
    const hasProfile = entries.some(([, score]) => score != null)
    const profile = Object.fromEntries(
      entries.map(([key, rawScore]) => {
        const score = Number(rawScore)
        if (hasProfile && (!Number.isInteger(score) || score < 0 || score > 10)) {
          throw new Error('味の評価は0〜10で入力してください')
        }
        return [key, score]
      })
    ) as Record<MikanProfileKey, number>

    const shortComment = typeof source.short_comment === 'string' ? source.short_comment.trim() : ''
    if (shortComment.length > 20) {
      throw new Error('一言感想は20字以内で入力してください')
    }

    if (hasProfile) {
      if (evaluatedVarieties.has(source.variety_id)) {
        throw new Error('同じ品種には味評価を1つだけ設定できます')
      }
      evaluatedVarieties.add(source.variety_id)
    }

    if (shortComment) {
      if (commentedVarieties.has(source.variety_id)) {
        throw new Error('同じ品種には一言感想を1つだけ設定できます')
      }
      commentedVarieties.add(source.variety_id)
    }

    return {
      variety_id: source.variety_id,
      quantity,
      satisfaction,
      ...(shortComment ? { short_comment: shortComment } : {}),
      ...(hasProfile ? profile : {}),
    }
  })
}

export async function createPost(prevState: State, formData: FormData): Promise<State> {
  const supabase = await createClient()
  const body = (formData.get('body') as string | null)?.trim() ?? ''
  const visibility = formData.get('visibility') as string
  const images = JSON.parse((formData.get('images') as string) ?? '[]')

  let mikans: MikanInput[]
  try {
    mikans = parseMikans(formData.get('mikans'))
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'みかん情報が不正です',
      success: false,
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'ログインしてください', success: false }
  }

  try {
    const { data: post, error } = await supabase
      .from('posts')
      .insert({ user_id: user.id, body, visibility })
      .select()
      .single()
    if (error || !post) throw error

    if (mikans.length) {
      const { error: mikanError } = await supabase.from('post_mikans').insert(
        mikans.map((m) => ({
          post_id: post.id,
          variety_id: m.variety_id,
          quantity: Number(m.quantity),
          satisfaction: m.satisfaction,
          short_comment: m.short_comment ?? null,
          sweetness: m.sweetness ?? null,
          tartness: m.tartness ?? null,
          umami: m.umami ?? null,
          juiciness: m.juiciness ?? null,
          thinness: m.thinness ?? null,
          aroma: m.aroma ?? null,
          texture: m.texture ?? null,
        }))
      )
      if (mikanError) throw mikanError
    }

    if (images.length) {
      const { error: imageError } = await supabase.from('post_images').insert(
        images.map((img: any) => ({
          post_id: post.id,
          url: img.url,
          thumbnail_url: img.thumbnail_url,
          order_index: img.order_index,
        }))
      )
      if (imageError) throw imageError
    }

    const { data: newpost } = await supabase
      .from('posts')
      .select(`
        *,
        users(*),
        post_images(*),
        post_mikans(
          *,
          mikan_varieties(*)
        )
      `)
      .eq('id', post.id)
      .single()

    revalidatePath('/home')

    return { error: '', success: true, post: newpost }
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : '投稿失敗',
      success: false,
    }
  }
}
