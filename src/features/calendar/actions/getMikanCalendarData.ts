'use server'

import { createClient } from "@/infrastructure/supabase/server"
import type { Variety } from "@/features/mikan/types/Variety"

const JST_OFFSET_MS = 9 * 60 * 60 * 1000
const VALID_SHAPES = new Set<Variety['shape']>(['normal', 'round', 'flat', 'egg', 'deko', 'unknown'])

type VarietyType = 'cultivar' | 'intermediate' | 'unknown'

function normalizeShape(shape: string | null | undefined): Variety['shape'] {
  return shape && VALID_SHAPES.has(shape as Variety['shape'])
    ? shape as Variety['shape']
    : 'unknown'
}

function normalizeVarietyType(value: string | null | undefined): VarietyType {
  if (value === 'intermediate' || value === 'unknown') return value
  return 'cultivar'
}

function relationValue<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}

function monthRange(year: number, month: number) {
  const start = new Date(Date.UTC(year, month - 1, 1) - JST_OFFSET_MS)
  const end = new Date(Date.UTC(year, month, 1) - JST_OFFSET_MS)
  return { start: start.toISOString(), end: end.toISOString() }
}

export type CalendarVarietyRecord = Pick<
  Variety,
  'id' | 'name' | 'color' | 'shape'
> & {
  quantity: number
}
export type CalendarDayRecord = {
  day: number
  quantity: number
  varieties: CalendarVarietyRecord[]
}

export type VarietyParent = {
  id: string
  name: string
}

export type VarietyDiscovery = Pick<
  Variety,
  'id' | 'name' | 'aliases' | 'color' | 'shape' | 'description'
> & {
  parent1: VarietyParent | null
  parent2: VarietyParent | null
  quantity: number
  discovered: boolean
  varietyType: Exclude<VarietyType, 'unknown'>
}

export type MikanCalendarData = {
  year: number
  month: number
  totalQuantity: number
  dayRecords: CalendarDayRecord[]
  ranking: CalendarVarietyRecord[]
  varieties: VarietyDiscovery[]
  discoveredCount: number
}

type VarietyCatalogRow = Pick<
  Variety,
  'id' | 'name' | 'aliases' | 'color' | 'shape' | 'description'
> & {
  parent1Id: string | null
  parent2Id: string | null
  isVisible: boolean
  varietyType: VarietyType
}

export async function getMikanCalendarData(year: number, month: number): Promise<MikanCalendarData> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: varietyRows, error: varietyError } = await supabase
    .from('mikan_varieties')
    .select('id,name,aliases,color,shape,description,parent1_id,parent2_id,is_visible,variety_type')
    .order('name')

  if (varietyError) throw varietyError

  const allVarieties: VarietyCatalogRow[] = (varietyRows ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    aliases: row.aliases ?? [],
    color: row.color,
    shape: normalizeShape(row.shape),
    description: row.description,
    parent1Id: row.parent1_id,
    parent2Id: row.parent2_id,
    isVisible: row.is_visible !== false,
    varietyType: normalizeVarietyType(row.variety_type),
  }))
  const varietyById = new Map(allVarieties.map((variety) => [variety.id, variety]))

  const visibleVarieties: Omit<VarietyDiscovery, 'quantity' | 'discovered'>[] = allVarieties
    .filter((variety) => variety.isVisible && variety.varietyType !== 'unknown')
    .map((variety) => {
      const parent1 = variety.parent1Id ? varietyById.get(variety.parent1Id) : null
      const parent2 = variety.parent2Id ? varietyById.get(variety.parent2Id) : null
      return {
        id: variety.id,
        name: variety.name,
        aliases: variety.aliases,
        color: variety.color,
        shape: variety.shape,
        description: variety.description,
        parent1: parent1 ? { id: parent1.id, name: parent1.name } : null,
        parent2: parent2 ? { id: parent2.id, name: parent2.name } : null,
        varietyType: variety.varietyType as Exclude<VarietyType, 'unknown'>,
      }
    })

  if (!user) {
    return {
      year,
      month,
      totalQuantity: 0,
      dayRecords: [],
      ranking: [],
      varieties: visibleVarieties.map((variety) => ({ ...variety, quantity: 0, discovered: false })),
      discoveredCount: 0,
    }
  }

  const { start, end } = monthRange(year, month)

  const monthQuery = supabase
    .from('posts')
    .select(`
      id,
      created_at,
      post_mikans(
        variety_id,
        quantity,
        mikan_varieties(id,name,color,shape)
      )
    `)
    .eq('user_id', user.id)
    .gte('created_at', start)
    .lt('created_at', end)
    .order('created_at', { ascending: true })

  const historyQuery = supabase
    .from('posts')
    .select(`
      post_mikans(
        variety_id,
        quantity
      )
    `)
    .eq('user_id', user.id)

  const [monthResult, historyResult] = await Promise.all([monthQuery, historyQuery])

  if (monthResult.error) throw monthResult.error
  if (historyResult.error) throw historyResult.error

  const byDay = new Map<number, Map<string, CalendarVarietyRecord>>()
  const monthlyTotals = new Map<string, CalendarVarietyRecord>()

  for (const post of monthResult.data ?? []) {
    const jst = new Date(new Date(post.created_at).getTime() + JST_OFFSET_MS)
    const day = jst.getUTCDate()
    const dayMap = byDay.get(day) ?? new Map<string, CalendarVarietyRecord>()

    for (const mikan of post.post_mikans ?? []) {
      if (!mikan.variety_id) continue
      const relation = relationValue(mikan.mikan_varieties)
      if (!relation) continue

      const quantity = Number(mikan.quantity ?? 0)
      const base: CalendarVarietyRecord = {
        id: relation.id,
        name: relation.name,
        color: relation.color,
        shape: normalizeShape(relation.shape),
        quantity,
      }

      const existingDay = dayMap.get(base.id)
      dayMap.set(base.id, existingDay ? { ...existingDay, quantity: existingDay.quantity + quantity } : base)

      const existingMonth = monthlyTotals.get(base.id)
      monthlyTotals.set(
        base.id,
        existingMonth ? { ...existingMonth, quantity: existingMonth.quantity + quantity } : base
      )
    }

    byDay.set(day, dayMap)
  }

  const dayRecords = [...byDay.entries()]
    .map(([day, values]) => {
      const dayVarieties = [...values.values()].sort((a, b) => b.quantity - a.quantity)
      return {
        day,
        quantity: dayVarieties.reduce((sum, item) => sum + item.quantity, 0),
        varieties: dayVarieties,
      }
    })
    .sort((a, b) => a.day - b.day)

  const ranking = [...monthlyTotals.values()].sort((a, b) => b.quantity - a.quantity)
  const totalQuantity = ranking.reduce((sum, item) => sum + item.quantity, 0)

  const historyTotals = new Map<string, number>()
  for (const post of historyResult.data ?? []) {
    for (const mikan of post.post_mikans ?? []) {
      if (!mikan.variety_id) continue
      historyTotals.set(
        mikan.variety_id,
        (historyTotals.get(mikan.variety_id) ?? 0) + Number(mikan.quantity ?? 0)
      )
    }
  }

  const discoveries = visibleVarieties.map((variety) => {
    const quantity = historyTotals.get(variety.id) ?? 0
    return { ...variety, quantity, discovered: quantity > 0 }
  })

  return {
    year,
    month,
    totalQuantity,
    dayRecords,
    ranking,
    varieties: discoveries,
    discoveredCount: discoveries.filter((item) => item.discovered).length,
  }
}
