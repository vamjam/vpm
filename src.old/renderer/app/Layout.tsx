import { Allotment } from 'allotment'
import 'allotment/dist/style.css'
import { Outlet } from 'react-router-dom'
import styled from 'styled-components'
import { Menu } from '~/features'

const Container = styled.div`
  display: flex;
  flex-direction: row;
  height: 100vh;
  margin: 0;
`

const PackagesContainer = styled(Allotment.Pane)`
  display: flex;
  flex-direction: column;
  background: var(--colors-surface-3);
  height: 100%;
`

const DragHandle = styled.div`
  background-color: var(--colors-surface-2);
  -webkit-app-region: drag;
  width: 100vw;
  height: 48px;
`

export default function Layout(): JSX.Element {
  return (
    <Container>
      <Menu />
      <Allotment vertical={true} defaultSizes={[70, 30]} snap={true}>
        <PackagesContainer>
          <DragHandle />
          <Outlet />
        </PackagesContainer>
      </Allotment>
    </Container>
  )
}
