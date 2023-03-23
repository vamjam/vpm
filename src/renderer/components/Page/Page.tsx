import { ReactNode } from 'react'
import styled from 'styled-components'
import { Box } from '~/components/Layout'
import { Toolbar } from '~/components/Menu'

const Header = styled(Box)`
  width: 100%;
  position: sticky;
  top: 0;
  backdrop-filter: blur(20px) saturate(180%);

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0.2;
    z-index: -1;
  }
`

const DragRegion = styled('div')`
  height: var(--spacing-11);
  -webkit-app-region: drag;
`

export default function Page({ children }: { children?: ReactNode }) {
  return (
    <Header>
      <DragRegion />
      <Toolbar />
      {children}
    </Header>
  )
}
