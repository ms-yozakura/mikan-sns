import { SearchPage } from "@/features/search/pages/SearchPage"

type PageProps = {
  searchParams: Promise<{
    q?: string
  }>
}

export default async function Page({ searchParams }: PageProps) {
  const { q = "" } = await searchParams

  return <SearchPage query={q} />
}
