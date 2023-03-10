import { InputHTMLAttributes } from 'react'
import styled from 'styled-components'
import { input } from './styles'

export default function TextBox(
  props: InputHTMLAttributes<HTMLInputElement>
): JSX.Element {
  return <StyledTextBox {...props} />
}

const StyledTextBox = styled.input`
  ${input}
`
