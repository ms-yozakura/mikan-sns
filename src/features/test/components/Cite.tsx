import { ChildProcess } from "child_process"
import { ReactNode } from "react"

import styles from "./Cite.module.css"


type CiteProps={
  children:ReactNode
}

export function Cite({children}:CiteProps){
  return (
    <div className={styles.citeWrapper}>
      {children}
    </div>
  )
}
