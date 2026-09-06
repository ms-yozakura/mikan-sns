'use client'

import {
  MikanPicker,
  type MikanPickerVariety,
} from '@/features/mikan/components/MikanPicker'

export function MikanSelector({
  varieties,
  keyword,
  setKeyword,
  selectedVariety,
  setSelectedVariety,
}: {
  varieties: MikanPickerVariety[]
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
