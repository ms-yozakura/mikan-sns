import { FormEvent } from "react"
import { Icon } from "@iconify/react"

import styles from "./SearchForm.module.css"

type SearchFormProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: (query: string) => void | Promise<void>
}

export function SearchForm({
  value, onChange, onSubmit
}: SearchFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void onSubmit(value)
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <Icon
        icon="mdi:magnify"
        className={styles.searchIcon}
      />


      <input
        className={styles.input}
        type="search"
        placeholder="投稿・ユーザーを検索"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </form>
  )
}
