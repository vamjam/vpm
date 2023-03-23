import { ReactNode } from 'react'
import styled from 'styled-components'
import { Box, BoxProps } from '~/components/Layout'
import shared from './shared'

export type SegmentedControlOption = {
  label: ReactNode
  value: string
}

export type SegmentedControlProps = Omit<BoxProps, 'onChange'> & {
  value: string
  options: SegmentedControlOption[]
  onChange: (value: string) => void
}

const Container = styled(Box)`
  background: var(--color-bg-3);
  padding: var(--spacing-2);
  flex-direction: row;
  border-radius: var(--spacing-9);
`

const ActiveButton = styled('button')`
  ${shared}
  background: var(--color-bg-5);
`

const InActiveButton = styled('button')`
  ${shared}
  color: var(--color-fg-4);
`

export default function SegmentedControl({
  value,
  options,
  onChange,
  ...props
}: SegmentedControlProps) {
  return (
    <Container {...props}>
      {options.map((option) => {
        const isActive = option.value === value

        return isActive ? (
          <ActiveButton key={option.value} value={option.value}>
            {option.label}
          </ActiveButton>
        ) : (
          <InActiveButton
            key={option.value}
            value={option.value}
            onClick={(e) => onChange(e.currentTarget.value)}
          >
            {option.label}
          </InActiveButton>
        )
      })}
    </Container>
  )
}
