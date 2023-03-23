import { Search20Regular as SearchIcon } from '@fluentui/react-icons'
import { HTMLAttributes } from 'react'
import styled from 'styled-components'
import { Box } from '~/components/Layout'
import shared from './shared'

export type SearchProps = Omit<HTMLAttributes<HTMLElement>, 'onInput'> & {
  value: string
  onInput: (value: string) => void
}

const Container = styled(Box)`
  ${shared}

  flex-direction: row;
  gap: var(--spacing-4);
  border: var(--border-size) solid var(--border-color);
`

const SearchInput = styled('input').attrs({
  type: 'search',
})`
  background: none;
  border: none;
  color: var(--color-fg-1);
  font: inherit;

  &:focus {
    outline: none;
  }
`

export default function Search({ value, onInput, ...props }: SearchProps) {
  return (
    <Container {...props}>
      <SearchIcon />
      <SearchInput
        type="search"
        value={value}
        onInput={(e) => onInput(e.currentTarget.value)}
      />
    </Container>
  )
}
