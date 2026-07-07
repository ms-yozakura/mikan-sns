import styles from './Button.module.css'


type Size = 's' | 'sm' | 'm' | 'ml' | 'l'

const sizeClass = {
  s: styles.s,
  sm: styles.sm,
  m: styles.m,
  ml: styles.ml,
  l: styles.l,
} satisfies Record<Size, string>


type ButtonProps = {
  children: React.ReactNode
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  size?: 's' | 'sm' | 'm' | 'ml' | 'l'
  className?: string
  onClick?: React.MouseEventHandler<HTMLButtonElement>
}

export default function Button({
  children,
  type = 'button',
  disabled = false,
  size = 'm',
  className = ``,
  onClick,
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`
        ${styles.button} 
        ${sizeClass[size ?? 'm']} 
        ${className} `}
    >
      {children}
    </button>
  )
}
