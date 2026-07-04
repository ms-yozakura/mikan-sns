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

const initialState = {
  error: "",
  success: false,
  post: undefined
}

export function PostFormClient({ onSuccess }: { onSuccess: (post:any) => void }) {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction, pending] = useActionState(createPost, initialState)
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [keyword, setKeyword] = useState("")
  const [selectedVariety, setSelectedVariety] = useState("a5dab591-9888-420c-be86-b4f4b253153f") //初期値は温州
  const [quantity, setQuantity] = useState("1")
  const [satisfaction, setSatisfaction] = useState(3)
  const [postMikans, setPostMikans] = useState<MikanInput[]>([])
  const [varieties, setVarieties] = useState<any[]>([])

  const isMutating = pending || uploading

  useEffect(() => {
    getMikanVarieties().then(setVarieties)
  }, [])

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset()
      setFiles([])
      setPostMikans([])
      setKeyword("")
      setSelectedVariety("a5dab591-9888-420c-be86-b4f4b253153f")//初期値は温州
      setQuantity("1")
      setSatisfaction(3)
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
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error("ログインしてください")

      const postId = crypto.randomUUID()
      const images = await uploadPostImages(files, user.id, postId)

      const fd = new FormData()
      fd.append("body", body)
      fd.append("images", JSON.stringify(images))
      fd.append("mikans", JSON.stringify(postMikans))

      startTransition(() => { formAction(fd) })
    } catch (e) {
      console.error(e)
      setUploading(false)
    }
  }

  function addMikan() {
    if (!selectedVariety) {
      console.warn("品種が選択されていません")
      return
    }
    const name = varieties.find(v => v.id === selectedVariety)?.name ?? ""
    setPostMikans(prev => {
      const index = prev.findIndex(m => m.variety_id === selectedVariety)
      if (index !== -1) {
        const copy = [...prev]
        copy[index] = { variety_id: selectedVariety, quantity: Number(quantity), satisfaction }
        return copy
      }
      return [...prev, { variety_id: selectedVariety, quantity: Number(quantity), satisfaction }]
    })
    setSelectedVariety("")
    setKeyword("")
    setQuantity("1")
    setSatisfaction(3)
  }

  return (
    <div className={styles.formContainer}>
      <form ref={formRef} onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.mikanBox}>
          <MikanSelector
            varieties={varieties}
            keyword={keyword}
            setKeyword={setKeyword}
            selectedVariety={selectedVariety}
            setSelectedVariety={setSelectedVariety}
          />

          <div className={styles.row}>
            <label>
              個数
              <input
                type="number"
                min={0}
                value={quantity}
                className={styles.quantityInput}
                onChange={e => setQuantity(e.target.value)}
              />
            </label>

            <label>
              満足度
              <StarRating value={satisfaction} onChange={(star) => setSatisfaction(star)} />
            </label>

            <Button type="button" size="sm" onClick={addMikan}>
              ＋ 品種を追加
            </Button>
          </div>

        </div>

        <MikanList
          mikans={postMikans}
          varieties={varieties}
          onDelete={index => setPostMikans(prev => prev.filter((_, i) => i !== index))}
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
