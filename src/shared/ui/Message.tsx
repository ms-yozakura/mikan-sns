import styles from './Message.module.css'

type AlertProps = {
  children: React.ReactNode
  type?: 'error' | 'success' 
  onClick?: () => void
}

export default function Alert({
  children,
  type = 'error',
  onClick,
}: AlertProps) {
  let typeClass=styles.messageError;
  switch(type){
    case 'error':
      typeClass=styles.messageError;
      break;
    case 'success':
      typeClass=styles.messageSuccess;
      break;
  }
  return (
    <div
      onClick={onClick}
      className={`${styles.message}  ${typeClass}`}
    >
      {children}
    </div>
  )
}

