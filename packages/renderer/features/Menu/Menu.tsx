import { HTMLAttributes } from 'react'
import { FaConnectdevelop } from 'react-icons/fa'
import { VscLibrary, VscSave } from 'react-icons/vsc'
import styled from 'styled-components'
import { Link, View } from '~/components'

const Container = styled(View)`
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

export default function Menu(
  props: HTMLAttributes<HTMLDivElement>
): JSX.Element {
  return (
    <Container flexDirection="column" {...props}>
      <View flexDirection="column" alignItems="center" justifyContent="center">
        <Link to="/" icon={<VscLibrary />} label="Installed" />
        <Link to="/saved" icon={<VscSave />} label="Saved" />
        <Link to="/hub" icon={<FaConnectdevelop />} label="Hub" />
      </View>
    </Container>
  )
}
