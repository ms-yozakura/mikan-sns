import styles from "./Loading.module.css"


export default function Loading() {
  return (
    <div className={styles.spinnerWrapper}>
      <div className={styles.spinner}></div>
    </div>)
}
