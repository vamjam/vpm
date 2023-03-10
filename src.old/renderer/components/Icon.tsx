import { HTMLAttributes, ReactNode } from 'react'
import styled from 'styled-components'

type IconProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode
  src?: string
}

const Container = styled.div`
  display: flex;
`

export default function Icon({ src, ...props }: IconProps) {
  return (
    <Container {...props}>
      <img src={src} />
    </Container>
  )
}
