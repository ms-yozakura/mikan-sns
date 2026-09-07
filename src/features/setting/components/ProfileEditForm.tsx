"use client"

import { useEffect, useState } from "react"
import { Icon } from "@iconify/react"
import { createClient } from "@/infrastructure/supabase/client"
import { getMikanVarieties } from "@/features/post/actions/getMikanVarieties"
import {
  MikanPicker,
  type MikanPickerVariety,
} from "@/features/mikan/components/MikanPicker"
import { MikanIcon } from "@/features/mikan/components/MikanIcon"

import { updateProfile } from "../actions/updateProfile"
import { uploadAvatar } from "../actions/uploadAvatar"

import { AvatarUploader } from "./AvatarUploader"
import styles from "./ProfileEditForm.module.css"

type Variety = MikanPickerVariety

type PrivateProfile = {
  bio: string | null
  region: string | null
  generation: number | null
}

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
  const [varieties, setVarieties] = useState<Variety[]>([])
  const [favoriteMikanIds, setFavoriteMikanIds] = useState<string[]>(["", "", ""])
  const [activeFavoriteIndex, setActiveFavoriteIndex] = useState(0)
  const [favoriteKeyword, setFavoriteKeyword] = useState("")

  useEffect(() => {
    async function load() {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) throw authError
      if (!user) {
        setLoading(false)
        return
      }

      const [userResult, favoritesResult, varietyRows] = await Promise.all([
        supabase
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
          .maybeSingle(),
        supabase
          .from("favorite_mikans")
          .select("variety_id,position")
          .eq("user_id", user.id)
          .order("position"),
        getMikanVarieties(),
      ])

      if (userResult.error) throw userResult.error
      if (favoritesResult.error) throw favoritesResult.error

      const data = userResult.data
      const metadataDisplayName =
        typeof user.user_metadata?.display_name === "string"
          ? user.user_metadata.display_name
          : ""

      setDisplayName(data?.display_name ?? metadataDisplayName)
      setAvatarUrl(data?.avatar_url ?? "")

      const profile = data?.profiles as unknown as PrivateProfile | null
      setBio(profile?.bio ?? "")
      setRegion(profile?.region ?? "")
      setGeneration(profile?.generation ?? "")

      const nextFavorites = ["", "", ""]
      for (const row of favoritesResult.data ?? []) {
        if (row.position >= 1 && row.position <= 3) {
          nextFavorites[row.position - 1] = row.variety_id
        }
      }
      setFavoriteMikanIds(nextFavorites)
      setVarieties((varietyRows ?? []) as Variety[])
      setLoading(false)
    }

    load().catch((error) => {
      console.error("Failed to load profile edit data", error)
      setLoading(false)
    })
  }, [supabase])

  function updateFavorite(index: number, varietyId: string) {
    setFavoriteMikanIds((current) => {
      const next = [...current]
      if (varietyId) {
        for (let currentIndex = 0; currentIndex < next.length; currentIndex += 1) {
          if (currentIndex !== index && next[currentIndex] === varietyId) {
            next[currentIndex] = ""
          }
        }
      }
      next[index] = varietyId
      return next
    })
  }

  function selectFavorite(variety: Variety) {
    updateFavorite(activeFavoriteIndex, variety.id)
    setFavoriteKeyword("")

    const nextEmptyIndex = favoriteMikanIds.findIndex(
      (id, index) => index !== activeFavoriteIndex && !id
    )
    if (nextEmptyIndex >= 0) setActiveFavoriteIndex(nextEmptyIndex)
  }

  function clearFavorite(index: number) {
    updateFavorite(index, "")
    setActiveFavoriteIndex(index)
    setFavoriteKeyword("")
  }

  async function save() {
    try {
      setIsSaving(true)

      let url = avatarUrl

      if (avatar) {
        const formData = new FormData()
        formData.append("file", avatar)
        url = await uploadAvatar(formData)
      }

      await updateProfile({
        display_name,
        bio,
        region,
        generation: generation === "" ? null : generation,
        avatarUrl: url,
        favorite_mikan_ids: favoriteMikanIds.filter(Boolean),
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
          <AvatarUploader url={avatarUrl} onChange={setAvatar} />
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
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>推しみかん</label>
          <p className={styles.helpText}>3つまで登録できます。枠を選んで、下からみかんを検索してください。</p>

          <div className={styles.favoriteSlots}>
            {favoriteMikanIds.map((varietyId, index) => {
              const variety = varieties.find((item) => item.id === varietyId)
              const isActive = index === activeFavoriteIndex

              return (
                <div key={index} className={styles.favoriteSlotRow}>
                  <button
                    type="button"
                    className={`${styles.favoriteSlot} ${isActive ? styles.favoriteSlotActive : ""}`}
                    onClick={() => {
                      setActiveFavoriteIndex(index)
                      setFavoriteKeyword("")
                    }}
                  >
                    <span className={styles.favoriteSlotNumber}>{index + 1}</span>
                    {variety ? (
                      <>
                        <MikanIcon color={variety.color} shape={variety.shape} size={28} />
                        <span className={styles.favoriteSlotName}>{variety.name}</span>
                      </>
                    ) : (
                      <span className={styles.favoriteSlotPlaceholder}>みかんを選ぶ</span>
                    )}
                  </button>

                  {variety && (
                    <button
                      type="button"
                      className={styles.favoriteClearButton}
                      aria-label={`${variety.name}を推しみかんから外す`}
                      onClick={() => clearFavorite(index)}
                    >
                      <Icon icon="mdi:close" aria-hidden="true" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          <div className={styles.favoritePickerArea}>
            <span className={styles.favoritePickerLabel}>{activeFavoriteIndex + 1}つ目の推しみかん</span>
            <MikanPicker
              varieties={varieties}
              keyword={favoriteKeyword}
              onKeywordChange={setFavoriteKeyword}
              selectedIds={favoriteMikanIds.filter(Boolean)}
              onSelect={selectFavorite}
              ariaLabel={`${activeFavoriteIndex + 1}つ目の推しみかんを検索`}
            />
          </div>
        </div>

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
