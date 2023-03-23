import { Outlet } from 'react-router-dom'
import styled from 'styled-components'
import { Box } from '~/components/Layout'
import { Navbar } from '~/components/Menu'

const Container = styled(Box)`
  height: 100%;
  margin: 0;
  flex-direction: row;
`

const Content = styled('div')`
  height: 100%;
  width: 100%;
  overflow: auto;
`

export default function Layout() {
  return (
    <Container>
      <Navbar />
      <Content>
        <Outlet />
      </Content>
    </Container>
  )
}
