
export type Variety = {
  id: string
  name: string
  reading: string | null
  aliases: string[] | null
  alias_readings: string[] | null
  color: string
  shape: 'normal' | 'round' | 'flat' | 'egg' | 'deko' | 'unknown'

  description: string | null
  parent1_id: string | null
  parent2_id: string | null
  is_visible: boolean
  variety_type: string | null
}


