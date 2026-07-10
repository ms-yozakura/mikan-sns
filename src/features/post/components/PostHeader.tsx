



export function PostHeader(){
  <Link
        href={`/user/${post.users?.username}`}
        className={styles.postHeader}
        onClick={(e) => {
          e.stopPropagation() // カード全体のクリックイベントを抑止
        }}
      >
        <div className={styles.avatarWrapper}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`${post.users?.display_name}'s avatar`}
              className={styles.avatarImage}
            />
          ) : (
            <div className={styles.avatarPlaceholder}>🍊</div>
          )}
        </div>
        <div className={styles.postUserInfo}>
          <div className={styles.nameContainer}>
            <h3 className={styles.postAuthor}>{post.users?.display_name || '名無しの柑橘'}</h3>
            <span className={styles.postUsername}>@{post.users?.username || 'user'}</span>
          </div>
          <span className={styles.postDate}>{formattedDate}</span>
        </div>
        {post.visibility != "public" &&
          <div className={styles.visibilityTag}>
            {post.visibility}
          </div>
        }
      </Link>

}
