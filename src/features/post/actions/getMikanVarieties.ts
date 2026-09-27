// actions/getMikanVarieties.ts

'use server'

import { createClient } from "@/infrastructure/supabase/server"

export async function getMikanVarieties() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("mikan_varieties")
    .select("id,name,reading,aliases,alias_readings,color,shape,description,parent1_id,parent2_id,is_visible,variety_type")
    .eq("is_visible", true)
    .in("variety_type", ["cultivar", "brand"])
    .order("name")

  if (error) throw error

  return data
}
