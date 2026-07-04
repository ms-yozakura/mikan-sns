'use client'

import { useState, useEffect } from "react"
import styles from "./FileUploader.module.css" // 専用のCSSに切り分け
import Button from "@/shared/ui/Button"

interface FileUploaderProps {
  files: File[]
  onChange: (files: File[]) => void
  disabled?: boolean
}

export function FileUploader({ files, onChange, disabled }: FileUploaderProps) {
  const [previews, setPreviews] = useState<string[]>([])

  // filesの変更を検知してプレビューURLを生成・クリーンアップ
  useEffect(() => {
    if (files.length === 0) {
      setPreviews([])
      return
    }

    const objectUrls = files.map(file => URL.createObjectURL(file))
    setPreviews(objectUrls)

    // メモリリーク防止のためのクリーンアップ
    return () => objectUrls.forEach(url => URL.revokeObjectURL(url))
  }, [files])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).slice(0, 4)
      onChange(selectedFiles)
    }
  }

  return (
    <div className={styles.fileInputSection}>

      <label htmlFor="file-upload" className={`${styles.fileUploadLabel} ${disabled ? styles.disabled : ""}`}>
        <Button size="s">
          <span className={styles.uploadText}>+ 写真を選択</span>
        </Button>

        <div className={styles.previewContainer}>
          {previews.map((url, index) => (
            <div key={index} className={styles.previewFrame}>
              <img src={url} alt={`プレビュー ${index + 1}`} className={styles.previewImage} />
            </div>
          ))}
          {[...Array(4 - previews.length)].map((_, index) => (
            <div key={`placeholder-${index}`} className={styles.placeholderFrame}>
              <div className={styles.placeholderIcon} />
            </div>
          ))}
        </div>

      </label>

      <input
        id="file-upload"
        type="file"
        accept="image/*"
        multiple
        disabled={disabled}
        className={styles.visuallyHidden}
        onChange={handleFileChange}
      />
    </div>
  )
}
