'use client'

import { useActionState, useEffect, useRef, useState, startTransition } from "react"
import { Icon } from "@iconify/react"
import { createPost } from "../../actions/createPost"
import styles from "./PostForm.module.css"
import { createClient } from "@/infrastructure/supabase/client"
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

export function PostFormClient({
  onSuccess,
  onClose,
}: {
  onSuccess: (post: any) => void
  onClose?: () => void
}) {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction, pending] = useActionState(createPost, initialState)
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [keyword, setKeyword] = useState("")
  const [selectedVariety, setSelectedVariety] = useState(DEFAULT_VARIETY_ID)
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
      setSelectedVariety(DEFAULT_VARIETY_ID)
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

  function updateQuantity(nextQuantity: number) {
    const normalizedQuantity = Math.max(0, Math.floor(nextQuantity))
    setQuantity(String(normalizedQuantity))
    updateEditingMikan({ quantity: normalizedQuantity })
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
        <header className={styles.formHeader}>
          <button
            type="button"
            className={styles.headerCloseButton}
            onClick={onClose}
            aria-label="投稿作成を閉じる"
          >
            <Icon icon="mdi:close" aria-hidden="true" />
          </button>
          <h2>みかんの記録を投稿</h2>
          <button
            type="submit"
            className={styles.headerSubmitButton}
            disabled={isMutating}
          >
            {isMutating ? "投稿中" : "投稿"}
          </button>
        </header>

        <div className={styles.formBody}>
          {state.error && (
            <div className={styles.errorBanner} role="alert">
              <Icon icon="mdi:alert-circle-outline" aria-hidden="true" />
              <span>{state.error}</span>
            </div>
          )}

          <section className={styles.formSection}>
            <div className={styles.sectionTitleRow}>
              <h3>みかんを選ぶ</h3>
              <span className={styles.selectedCount}>{postMikans.length}種類</span>
            </div>
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
          </section>

          <section className={`${styles.formSection} ${styles.compactSection}`}>
            <div className={styles.recordControls}>
              <div className={styles.controlGroup}>
                <span className={styles.controlLabel}>個数</span>
                <div className={styles.quantityStepper}>
                  <button
                    type="button"
                    aria-label="個数を減らす"
                    onClick={() => updateQuantity(Number(quantity) - 1)}
                    disabled={Number(quantity) <= 0}
                  >
                    <Icon icon="mdi:minus" aria-hidden="true" />
                  </button>
                  <input
                    aria-label="みかんの個数"
                    inputMode="numeric"
                    min={0}
                    type="number"
                    value={quantity}
                    onChange={e => updateQuantity(Number(e.target.value || 0))}
                  />
                  <button
                    type="button"
                    aria-label="個数を増やす"
                    onClick={() => updateQuantity(Number(quantity) + 1)}
                  >
                    <Icon icon="mdi:plus" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className={styles.controlGroup}>
                <span className={styles.controlLabel}>満足度</span>
                <StarRating value={satisfaction} onChange={(star) => {
                  setSatisfaction(star)
                  updateEditingMikan({ satisfaction: star })
                }} />
              </div>
            </div>

            <div className={styles.secondaryActions}>
              <button type="button" className={styles.addMikanButton} onClick={addAnotherMikan}>
                <Icon icon="mdi:plus" aria-hidden="true" />
                他のみかんを追加
              </button>
            </div>

            {postMikans.length > 1 && (
              <div className={styles.mikanListArea}>
                <span className={styles.subtleLabel}>追加したみかん</span>
                <MikanList
                  mikans={postMikans}
                  varieties={varieties}
                  onDelete={deleteMikan}
                />
              </div>
            )}
          </section>

          <section className={styles.formSection}>
            <label className={styles.fieldLabel} htmlFor="post-body">
              <span>味のレビュー</span>
              <span className={styles.optionalLabel}>任意</span>
            </label>
            <textarea
              id="post-body"
              name="body"
              placeholder="みかんの味・感想を書いてみましょう..."
              disabled={isMutating}
              className={styles.textarea}
              rows={4}
            />
          </section>

          <section className={`${styles.formSection} ${styles.compactSection}`}>
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
          </section>

          <section className={styles.formSection}>
            <div className={styles.fieldLabel}>
              <span>写真</span>
              <span className={styles.optionalLabel}>任意・4枚まで</span>
            </div>
            <FileUploader
              files={files}
              onChange={setFiles}
              disabled={isMutating}
            />
          </section>

          <section className={`${styles.formSection} ${styles.visibilitySection}`}>
            <span className={styles.controlLabel}>公開範囲</span>
            <div className={styles.visibilityWrapper}>
              <div className={styles.visibilityButton}>
                <input
                  id="visibility-public"
                  type="radio"
                  name="visibility"
                  value="public"
                  defaultChecked
                />
                <label htmlFor="visibility-public">
                  <Icon icon="mdi:earth" aria-hidden="true" />
                  全体公開
                </label>
              </div>

              <div className={styles.visibilityButton}>
                <input
                  id="visibility-private"
                  type="radio"
                  name="visibility"
                  value="private"
                />
                <label htmlFor="visibility-private">
                  <Icon icon="mdi:lock-outline" aria-hidden="true" />
                  非公開
                </label>
              </div>
            </div>
          </section>
        </div>
      </form>
    </div>
  )
}
