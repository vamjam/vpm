import { HTMLAttributes } from 'react'
import styled from 'styled-components'
import { Input, Label, View } from '~/components'
import SortOption, { SortOptions } from './SortOption'

const Container = styled(View)`
  padding: var(--spacing-4) 0;
  gap: var(--spacing-7);
  border-top-left-radius: var(--spacing-8);
`

export type FilterState = {
  thumbnailSize: number
  searchQuery: string
  sortBy: SortOption
}

export type FilterProps = HTMLAttributes<HTMLDivElement> & {
  state: FilterState
  onThumbnailSizeChange: (value: number) => void
  onSearch: (value: string) => void
  onSortChange: (value: SortOption) => void
}

export default function Filters({
  state,
  onThumbnailSizeChange,
  onSearch,
  onSortChange,
  ...props
}: FilterProps) {
  return (
    <Container {...props}>
      <Label>
        Sort by:&nbsp;
        <Input.Dropdown
          onChange={(e) => onSortChange(e.currentTarget.value as SortOption)}
          options={SortOptions.map((opt) => ({
            value: opt,
            label: opt,
          }))}
        />
      </Label>
      <Input.TextBox
        type="search"
        placeholder="Search"
        value={state.searchQuery}
        onInput={(e) => onSearch(e.currentTarget.value)}
      />
      <Input.Slider
        min="100"
        max="300"
        value={state.thumbnailSize}
        onChange={(e) => onThumbnailSizeChange(e.target.valueAsNumber)}
      />
    </Container>
  )
}
