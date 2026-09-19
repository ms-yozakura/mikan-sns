'use client'

import {
  MikanPicker,
} from '@/features/mikan/components/MikanPicker'
import { Variety } from '@/features/mikan/types/Variety'

export function MikanSelector({
  varieties,
  keyword,
  setKeyword,
  selectedVariety,
  setSelectedVariety,
}: {
  varieties: Variety[]
  keyword: string
  setKeyword: (value: string) => void
  selectedVariety: string
  setSelectedVariety: (id: string) => void
}) {
  return (
    <MikanPicker
      varieties={varieties}
      keyword={keyword}
      onKeywordChange={setKeyword}
      selectedIds={[selectedVariety]}
      onSelect={(variety) => setSelectedVariety(variety.id)}
    />
  )
}
