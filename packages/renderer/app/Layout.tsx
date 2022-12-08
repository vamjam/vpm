import { createContext, useState } from 'react'
import { Outlet } from 'react-router-dom'
import styled from 'styled-components'
import { Package } from '@shared/types'
import Console from '~/features/Console/Console'
import Menu from '~/features/Menu'

type SelectedPackageContextType = [
  Record<string, Package>,
  (prev: Record<string, Package>) => void
]

export const SelectedPackagesContext =
  createContext<SelectedPackageContextType>({} as never)

export default function Layout(): JSX.Element {
  const [selectedPackages, setSelectedPackages] = useState({})

  return (
    <SelectedPackagesContext.Provider
      value={[selectedPackages, setSelectedPackages]}
    >
      <Container>
        <MenuContainer />
        <PackagesContainer>
          <DragHandle />
          <Outlet />
        </PackagesContainer>
        <ConsoleContainer />
      </Container>
    </SelectedPackagesContext.Provider>
  )
}

const Container = styled.div`
  display: grid;
  grid-template-areas:
    'menu packages'
    'menu console';
  grid-template-rows: 80% 1fr;
  grid-template-columns: 60px 1fr;
  grid-row-gap: 1rem;
  grid-column-gap: 1rem;
  height: 100vh;
  margin: 0;
`

const MenuContainer = styled(Menu)`
  grid-area: menu;
`

const PackagesContainer = styled.div`
  background: ${({ theme }) => theme.colors.primary800};
  grid-area: packages;
`

const DragHandle = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  -webkit-app-region: drag;
  width: 100vw;
  height: 48px;
`

const ConsoleContainer = styled(Console)`
  grid-area: console;
`
