import { redirect } from "next/navigation"
import { createClient } from "@/infrastructure/supabase/server"

export default async function Page() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profileUser, error } = await supabase
    .from("users")
    .select("username")
    .eq("id", user.id)
    .maybeSingle()

  if (error) {
    console.error("Failed to resolve current user profile", error)
  }

  const metadataUsername =
    typeof user.user_metadata?.username === "string"
      ? user.user_metadata.username
      : null
  const username = profileUser?.username ?? metadataUsername

  if (!username) {
    redirect("/setting")
  }

  redirect(`/user/${encodeURIComponent(username)}`)
}
