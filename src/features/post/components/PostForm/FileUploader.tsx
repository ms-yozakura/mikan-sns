'use client'

import { useEffect, useMemo, useRef } from "react"
import { Icon } from "@iconify/react"
import styles from "./FileUploader.module.css"

interface FileUploaderProps {
  files: File[]
  onChange: (files: File[]) => void
  disabled?: boolean
}

export function FileUploader({ files, onChange, disabled }: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)

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
      <button
        type="button"
        disabled={disabled}
        className={styles.uploadButton}
        onClick={handleUploadClick}
      >
        <Icon icon="mdi:image-plus-outline" aria-hidden="true" />
        <span>写真を追加</span>
      </button>

      {previews.length > 0 && (
        <div className={styles.previewContainer}>
          {previews.map((url, index) => (
            <div key={index} className={styles.previewFrame}>
              <img src={url} alt={`プレビュー ${index + 1}`} className={styles.previewImage} />
            </div>
          ))}
        </div>
      )}

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
