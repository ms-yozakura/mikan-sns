import Loading from "@/shared/ui/Loading";
import styles from "./loading.module.css"


export default function Page() {
  return (<div className={styles.loadingContainer}><Loading /></div>)
}
