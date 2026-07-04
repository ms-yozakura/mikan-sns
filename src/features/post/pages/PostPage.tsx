'use client'

import styles from "./PostPage.module.css"
import { PostCascade } from "../components/PostCascade"


export function PostPage({ postId}:{postId:string}) {
  return (
    <div className={styles.page}>

      <PostCascade postId={postId}/>

    </div>
  )
}
