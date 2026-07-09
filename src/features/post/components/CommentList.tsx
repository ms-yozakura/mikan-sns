

export function CommentList({ comments }: { comments: any[] }) {


  return (
    <>
      {comments.map((comment) => {
        return (
          <div>{comment.users.display_name}:{comment.body}</div>
        )
      })}
    </>
  )
}
