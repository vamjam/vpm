import styled from 'styled-components'
import shared from './shared'

const Textbox = styled('input')`
  ${shared}
  background: var(--color-black-a5);
  color: var(--color-fg-1);
  border: var(--border-size) solid var(--border-color);
`

export default Textbox
