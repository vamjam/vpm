import { HTMLAttributes, ReactNode } from 'react'
import styled from 'styled-components'

type LabelProps = HTMLAttributes<HTMLLabelElement> & {
  children?: ReactNode
}

const Container = styled.label`
  display: flex;
  align-items: center;
  font-size: var(--input-font-size);
`

export default function Label({ children, ...props }: LabelProps) {
  return <Container {...props}>{children}</Container>
}
