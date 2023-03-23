import { HTMLAttributes } from 'react'
import styled from 'styled-components'

const Box = styled.div`
  display: flex;
  flex-direction: column;
`

export default Box

export type BoxProps = HTMLAttributes<HTMLDivElement>
