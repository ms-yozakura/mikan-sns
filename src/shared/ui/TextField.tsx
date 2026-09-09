import styles from './TextField.module.css'

type TextFieldProps = {
  label: string
  name: string
  type?: React.HTMLInputTypeAttribute
  placeholder?: string
  required?: boolean
  defaultValue?: string
  autoComplete?: string
}

export default function TextField({
  label,
  name,
  type = 'text',
  placeholder,
  required = false,
  defaultValue,
  autoComplete,
}: TextFieldProps) {
  return (
    <div className={styles.formGroup}>
      <label htmlFor={name} className={styles.formLabel}>
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        className={styles.formInput}
      />
    </div>
  )
}
