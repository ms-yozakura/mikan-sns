
import UserPage from"@/features/user/pages/UserPage"

type Props = {
  params: Promise<{
    userId: string
  }>
}

export default async function Page({ params }: Props) {
  const { userId } = await params

  return (
    <div>
      <UserPage userId={userId}/>
    </div>
  )
}
