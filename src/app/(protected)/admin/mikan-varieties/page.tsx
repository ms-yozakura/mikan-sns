import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/infrastructure/supabase/server"
import { MikanVarietyManager } from "@/features/admin/mikan-varieties/MikanVarietyManager"
import { BackButton, Leading } from "@/shared/ui/Leading"
import { Icon } from "@iconify/react"

export default async function MikanVarietiesAdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: currentUser } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single()

  if (currentUser?.role !== "admin") redirect("/home")

  const { data: varieties, error } = await supabase
    .from("mikan_varieties")
    .select("id,name,reading,aliases,alias_readings,color,shape,description,parent1_id,parent2_id,is_visible,variety_type")
    .order("name")

  if (error) throw error

  return (
    <main style={{ width: "100%", maxWidth: 960, margin: "0 auto", paddingBottom: 48 }}>
      <div style={{ marginBottom: 24 }}>
        <BackButton>
          <Icon icon="material-symbols:arrow-back" />
        </BackButton>

        <h1>みかん品種管理</h1>
        <p>品種の追加・編集を行います。変更はすぐにデータベースへ反映されます。</p>
      </div>
      <MikanVarietyManager initialVarieties={varieties ?? []} />
    </main>
  )
}
