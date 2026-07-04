// AvatarUploader.tsx
"use client"

import { useState } from "react"
import styles from "./AvatarUploader.module.css"

type Props = {
  url?: string
  onChange: (file: File) => void
}

export function AvatarUploader({ url, onChange }: Props) {
  const [preview, setPreview] = useState(url)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // 1. ファイル形式（MIMEタイプ）のチェック
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      alert("JPG, PNG, GIF 形式の画像のみアップロード可能です。")
      e.target.value = "" // 選択をリセット
      return
    }

    // 2. ファイルサイズのチェック (2MB = 2 * 1024 * 1024 バイト)
    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      alert("ファイルサイズは 2MB 以下にしてください。")
      e.target.value = "" // 選択をリセット
      return
    }

    // パスした場合はプレビューを表示して親に渡す
    setPreview(URL.createObjectURL(file))
    onChange(file)
  }
  return (
    <div className={styles.uploaderContainer}>
      {/* クリックで隠しinputを発火させるカスタムラベル */}
      <label className={styles.avatarLabel}>
        <img
          src={preview ?? "@/img/default-avatar.jpg"}
          alt="Avatar preview"
          className={styles.avatarImage}
        />

        {/* ホバー時に重なるレイヤー */}
        <div className={styles.overlay}>
          <span className={styles.overlayText}>Change</span>
        </div>

        {/* 実際のファイル選択は非表示 */}
        <input
          type="file"
          accept="image/*"
          onChange={handleChange}
          className={styles.hiddenInput}
        />
      </label>

      <div className={styles.infoContainer}>
        <p className={styles.infoText}>
          JPG, PNG, GIF。最大容量 2MB まで。
        </p>
      </div>
    </div>
  )
}
