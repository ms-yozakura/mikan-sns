import { MikanCalendarClient } from '@/features/calendar/pages/MikanCalendarClient'
import { getMikanCalendarData } from '@/features/calendar/actions/getMikanCalendarData'

function currentJstMonth() {
  const jst = new Date(Date.now() + 9 * 60 * 60 * 1000)
  return {
    year: jst.getUTCFullYear(),
    month: jst.getUTCMonth() + 1,
  }
}

function parseMonthParam(value: string | undefined, fallback: number) {
  const parsed = Number(value)
  return Number.isInteger(parsed) ? parsed : fallback
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>
}) {
  const params = await searchParams
  const current = currentJstMonth()
  const requestedYear = parseMonthParam(params.year, current.year)
  const requestedMonth = parseMonthParam(params.month, current.month)
  const normalized = new Date(Date.UTC(requestedYear, requestedMonth - 1, 1))
  const year = normalized.getUTCFullYear()
  const month = normalized.getUTCMonth() + 1
  const data = await getMikanCalendarData(year, month)

  return <MikanCalendarClient key={`${year}-${month}`} data={data} />
}
