'use client'

import { useEffect, useMemo, useRef } from "react"
import styles from "./FileUploader.module.css" // 専用のCSSに切り分け
import Button from "@/shared/ui/Button"

interface FileUploaderProps {
  files: File[]
  onChange: (files: File[]) => void
  disabled?: boolean
}

export function FileUploader({ files, onChange, disabled }: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  // filesの変更を検知してプレビューURLを生成・クリーンアップ
  const previews = useMemo(() => {
    return files.map(file => URL.createObjectURL(file))
  }, [files])

  useEffect(() => {
    return () => previews.forEach(url => URL.revokeObjectURL(url))
  }, [previews])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).slice(0, 4)
      onChange(selectedFiles)
    }
  }

  const handleUploadClick = () => {
    if (disabled) return
    inputRef.current?.click()
  }

  return (
    <div className={styles.fileInputSection}>

      <div className={`${styles.fileUploadLabel} ${disabled ? styles.disabled : ""}`}>
        <Button type="button" size="s" disabled={disabled} onClick={handleUploadClick}>
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

      </div>

      <input
        ref={inputRef}
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
