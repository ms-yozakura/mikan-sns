


export function escapeSearchTerm(term: string) {
  return term.replaceAll("%", "\\%").replaceAll("_", "\\_")
}

export function updateSearchUrl(query: string) {
  const nextUrl = new URL(window.location.href)

  if (query) {
    nextUrl.searchParams.set("q", query)
  } else {
    nextUrl.searchParams.delete("q")
  }

  window.history.replaceState(null, "", `${nextUrl.pathname}${nextUrl.search}`)
}

