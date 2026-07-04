// actions/getMikanVarieties.ts

'use server'

import { createClient } from "@/infrastructure/supabase/server"

export async function getMikanVarieties() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("mikan_varieties")
    .select("id,name,color,shape")
    .order("name")

  console.log(data)

  if (error) throw error

  return data
}
