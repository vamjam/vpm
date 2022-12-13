import { HTMLAttributes } from 'react'
import { FaConnectdevelop } from 'react-icons/fa'
import { VscLibrary, VscSave } from 'react-icons/vsc'
import styled from 'styled-components'
import { Link, View } from '~/components'

const Container = styled(View).attrs({
  flexDirection: 'column',
  justifyContent: 'start',
})`
  background: ${({ theme }) => theme.colors.surface400};
  font-size: small;
  margin-top: 48px;

  a {
    display: block;
    text-align: center;

    svg {
      display: block;
      font-size: 2rem;
      margin: 0 auto;
    }
  }
`

const Spacer = styled.div`
  flex: 1;
`

export default function Menu(
  props: HTMLAttributes<HTMLDivElement>
): JSX.Element {
  return (
    <Container {...props}>
      <Link to="/" icon={<VscLibrary />} label="Installed" />
      <Link to="/saved" icon={<VscSave />} label="Saved" />
      <Link to="/hub" icon={<FaConnectdevelop />} label="Hub" />
      <Spacer />
      <Link to="/settings" icon={<VscSave />} label="Settings" />
    </Container>
  )
}