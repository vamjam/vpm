import {
  AppFolder28Regular,
  Apps28Regular,
  Library28Regular,
  Settings28Regular,
} from '@fluentui/react-icons'
import { HTMLAttributes } from 'react'
import styled from 'styled-components'
import { View } from '~/components'
import Link from './Link'

const Container = styled(View)`
  align-items: center;
  flex-direction: column;
  justify-content: center;
  background: var(--colors-surface-2);
  font-size: small;
  padding-top: var(--spacing-11);
`

const Spacer = styled.div`
  flex: 1;
`

export default function Menu(
  props: HTMLAttributes<HTMLDivElement>
): JSX.Element {
  return (
    <Container {...props}>
      <Link to="/" icon={<Apps28Regular />} label="Installed" />
      <Link to="/library" icon={<Library28Regular />} label="Library" />
      <Link to="/hub" icon={<AppFolder28Regular />} label="Hub" />
      <Spacer />
      <Link to="/settings" icon={<Settings28Regular />} label="Settings" />
    </Container>
  )
}
