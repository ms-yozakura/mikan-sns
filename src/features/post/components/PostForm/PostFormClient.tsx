'use client'

import { useActionState, useEffect, useRef, useState, startTransition } from "react"
import { createPost } from "../../actions/createPost"
import styles from "./PostForm.module.css"
import { createClient } from "@/infrastructure/supabase/client"
import Button from "@/shared/ui/Button"
import { uploadPostImages } from "../../utils/imageUpload"
import type { MikanInput } from "../../types/post"
import { MikanSelector } from "./MikanSelector"
import { MikanList } from "./MikanList"
import { getMikanVarieties } from "../../actions/getMikanVarieties"
import { StarRating } from "./StarRating"
import { FileUploader } from "./FileUploader"
import { DEFAULT_MIKAN_PROFILE, type MikanProfileValues } from "../../types/mikanProfile"
import { MikanProfileEditor } from "./MikanProfileEditor"

const DEFAULT_VARIETY_ID = "a5dab591-9888-420c-be86-b4f4b253153f"

function createDefaultMikan(): MikanInput {
  return { variety_id: DEFAULT_VARIETY_ID, quantity: 1, satisfaction: 3 }
}

const initialState = {
  error: "",
  success: false,
  post: undefined
}

export function PostFormClient({ onSuccess }: { onSuccess: (post: any) => void }) {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction, pending] = useActionState(createPost, initialState)
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [keyword, setKeyword] = useState("")
  const [selectedVariety, setSelectedVariety] = useState(DEFAULT_VARIETY_ID) //初期値は温州
  const [quantity, setQuantity] = useState("1")
  const [satisfaction, setSatisfaction] = useState(3)
  const [isProfileEnabled, setIsProfileEnabled] = useState(false)
  const [profile, setProfile] = useState<MikanProfileValues>({ ...DEFAULT_MIKAN_PROFILE })
  const [postMikans, setPostMikans] = useState<MikanInput[]>([createDefaultMikan()])
  const [editingIndex, setEditingIndex] = useState(0)
  const [varieties, setVarieties] = useState<any[]>([])

  const isMutating = pending || uploading

  useEffect(() => {
    getMikanVarieties().then(setVarieties)
  }, [])

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset()
      setFiles([])
      setPostMikans([createDefaultMikan()])
      setEditingIndex(0)
      setKeyword("")
      setSelectedVariety(DEFAULT_VARIETY_ID)//初期値は温州
      setQuantity("1")
      setSatisfaction(3)
      setIsProfileEnabled(false)
      setProfile({ ...DEFAULT_MIKAN_PROFILE })
      setUploading(false)
      onSuccess?.(state.post)
    }
  }, [state.success])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (uploading) return

    try {
      setUploading(true)
      const formData = new FormData(e.currentTarget)
      const body = formData.get("body") as string
      const visibility = formData.get("visibility") as "public" | "private"

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error("ログインしてください")

      const postId = crypto.randomUUID()
      const images = await uploadPostImages(files, user.id, postId)

      const fd = new FormData()
      fd.append("body", body)
      fd.append("visibility", visibility)
      fd.append("images", JSON.stringify(images))
      fd.append("mikans", JSON.stringify(postMikans))

      startTransition(() => { formAction(fd) })
    } catch (e) {
      console.error(e)
      setUploading(false)
    }
  }

  function updateEditingMikan(patch: Partial<MikanInput>) {
    setPostMikans(prev => prev.map((mikan, index) =>
      index === editingIndex ? { ...mikan, ...patch } : mikan
    ))
  }

  function addAnotherMikan() {
    const nextMikan = createDefaultMikan()
    setPostMikans(prev => [...prev, nextMikan])
    setEditingIndex(postMikans.length)
    setSelectedVariety(DEFAULT_VARIETY_ID)
    setKeyword("")
    setQuantity("1")
    setSatisfaction(3)
    setIsProfileEnabled(false)
    setProfile({ ...DEFAULT_MIKAN_PROFILE })
  }

  function deleteMikan(index: number) {
    if (postMikans.length === 1) return
    const next = postMikans.filter((_, currentIndex) => currentIndex !== index)
    const nextEditingIndex = index < editingIndex
      ? editingIndex - 1
      : Math.min(editingIndex, next.length - 1)
    const editingMikan = next[nextEditingIndex]

    setPostMikans(next)
    setEditingIndex(nextEditingIndex)
    setSelectedVariety(editingMikan.variety_id)
    setQuantity(String(editingMikan.quantity))
    setSatisfaction(editingMikan.satisfaction)
    const hasProfile = typeof editingMikan.sweetness === "number"
    setIsProfileEnabled(hasProfile)
    setProfile(hasProfile ? {
      sweetness: editingMikan.sweetness!, tartness: editingMikan.tartness!,
      umami: editingMikan.umami!, juiciness: editingMikan.juiciness!,
      thinness: editingMikan.thinness!, aroma: editingMikan.aroma!,
      texture: editingMikan.texture!,
    } : { ...DEFAULT_MIKAN_PROFILE })
  }

  return (
    <div className={styles.formContainer}>
      <form ref={formRef} onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.visibilityWrapper}>
          <div className={styles.visibilityButton}>
            <input
              id="visibility-public"
              type="radio"
              name="visibility"
              value="public"
              defaultChecked
            />
            <label htmlFor="visibility-public">全体公開</label>
          </div>

          <div className={styles.visibilityButton}>
            <input
              id="visibility-private"
              type="radio"
              name="visibility"
              value="private"
            />
            <label htmlFor="visibility-private">非公開</label>
          </div>
        </div>
        <div className={styles.mikanBox}>
          <MikanSelector
            varieties={varieties}
            keyword={keyword}
            setKeyword={setKeyword}
            selectedVariety={selectedVariety}
            setSelectedVariety={(id) => {
              setSelectedVariety(id)
              updateEditingMikan({ variety_id: id })
            }}
          />

          <div className={styles.mikanInfo}>
            <label>
              個数
              <input
                type="number"
                min={0}
                value={quantity}
                className={styles.quantityInput}
                onChange={e => {
                  setQuantity(e.target.value)
                  updateEditingMikan({ quantity: Number(e.target.value) })
                }}
              />
            </label>

            <label>
              満足度
              <StarRating value={satisfaction} onChange={(star) => {
                setSatisfaction(star)
                updateEditingMikan({ satisfaction: star })
              }} />
            </label>

            <Button className={styles.addMikan} type="button" size="sm" onClick={addAnotherMikan}>
              ＋ 他のみかんを追加
            </Button>
          </div>

          <details className={styles.profileDetails} onToggle={(event) => {
            if (!event.currentTarget.open || isProfileEnabled) return
            setIsProfileEnabled(true)
            updateEditingMikan(profile)
          }}>
            <summary>
              <span>味を詳しく評価</span>
              <span className={styles.optionalLabel}>任意</span>
            </summary>
            {isProfileEnabled && <MikanProfileEditor values={profile} onChange={(values) => {
              setProfile(values)
              updateEditingMikan(values)
            }} />}
          </details>

        </div>

        <MikanList
          mikans={postMikans}
          varieties={varieties}
          onDelete={deleteMikan}
        />
        <label>
          感想
          <textarea
            name="body"
            placeholder="フレッシュな感想を呟こう..."
            required
            disabled={isMutating}
            className={styles.textarea}
            rows={3}
          />
        </label>

        <label className={styles.fileULWrapper}>
          ファイル
          <FileUploader
            files={files}
            onChange={setFiles}
            disabled={isMutating}
          />
        </label>

        <div className={styles.submitButtonWrapper}>
          <Button type="submit" disabled={isMutating} className={styles.submitButton}>
            {isMutating ? "送信中..." : "みかんを投げる"}
          </Button>
        </div>



        {state.error && <span className={styles.errorText}>⚠️ {state.error}</span>}
      </form>
    </div>
  )
}
