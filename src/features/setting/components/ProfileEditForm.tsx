"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/infrastructure/supabase/client"

import { updateProfile } from "../actions/updateProfile"
import { uploadAvatar } from "../actions/uploadAvatar"

import { AvatarUploader } from "./AvatarUploader"
import styles from "./ProfileEditForm.module.css"

export function ProfileEditForm() {
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [avatar, setAvatar] = useState<File>()
  const [avatarUrl, setAvatarUrl] = useState("")
  const [display_name, setDisplayName] = useState("")
  const [bio, setBio] = useState("")
  const [region, setRegion] = useState("")
  const [generation, setGeneration] = useState<number | "">("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data } = await supabase
        .from("users")
        .select(`
          display_name,
          avatar_url,
          profiles(
            bio,
            region,
            generation
          )
        `)
        .eq("id", user.id)
        .single()

      if (data) {
        setDisplayName(data.display_name ?? "")
        setAvatarUrl(data.avatar_url ?? "")

        const profile = data.profiles as unknown as {
          bio: string | null
          region: string | null
          generation: number | null
        }

        setBio(profile?.bio ?? "")
        setRegion(profile?.region ?? "")
        setGeneration(profile?.generation ?? "")
      }

      setLoading(false)
    }

    load()
  }, [supabase])

  async function save() {
    try {
      setIsSaving(true)

      let url = avatarUrl


      if (avatar) {
        const formData = new FormData()
        formData.append('file', avatar)


        url = await uploadAvatar(formData)
      }

      await updateProfile({
        display_name,
        bio,
        region,
        generation: generation === "" ? null : generation,
        avatarUrl: url,
      })

      setAvatarUrl(url)

      alert("プロフィールを更新しました")
    } catch (e) {
      console.error(e)
      alert("エラーが発生しました")
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <span className={styles.loadingText}>Loading...</span>
      </div>
    )
  }

  return (
    <div>
      <h2 className={styles.title}>Edit Profile</h2>

      <div className={styles.formGroupContainer}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Profile Picture</label>
          <AvatarUploader
            url={avatarUrl}
            onChange={setAvatar}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Display Name</label>
          <input
            className={styles.input}
            value={display_name}
            placeholder="Your name"
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Bio</label>
          <textarea
            className={`${styles.input} ${styles.textarea}`}
            value={bio}
            placeholder="Tell us about yourself"
            onChange={(e) => setBio(e.target.value)}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Region</label>
          <input
            className={styles.input}
            value={region}
            placeholder="Tokyo"
            onChange={(e) => setRegion(e.target.value)}
          />
        </div>


        <div className={styles.formGroup}>
          <label className={styles.label}>Generation</label>
          <select
            className={styles.input}
            value={generation}
            onChange={(e) =>
              setGeneration(e.target.value === "" ? "" : Number(e.target.value))
            }
          >
            <option value="">Select your generation</option>
            {Array.from({ length: 30 }, (_, i) => i + 1).map((gen) => (
              <option key={gen} value={gen}>
                {gen}期
              </option>
            ))}
          </select>
        </div >

        <div className={styles.actions}>
          <button
            className={styles.saveButton}
            onClick={save}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  )
}
