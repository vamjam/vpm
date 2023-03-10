import { HTMLAttributes } from 'react'
import styled from 'styled-components'
import { input } from './styles'

type Option = {
  label: string
  value?: string | number
}

type DropdownProps = HTMLAttributes<HTMLSelectElement> & {
  options: Option[]
}

const Container = styled.select`
  ${input}

  padding-top: 10px;
  padding-left: 8px;

  option {
    background: var(--colors-surface-3);
    color: var(--colors-text-9);
    padding: var(--spacing-8) !important;
    min-height: 80px !important;
  }
`

export default function Dropdown({ options, ...props }: DropdownProps) {
  return (
    <Container {...props}>
      {options.map((option) => (
        <option key={option.label} value={option.value}>
          {option.label}
        </option>
      ))}
    </Container>
  )
}
