import { Allotment } from 'allotment'
import 'allotment/dist/style.css'
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

const Container = styled.div`
  display: flex;
  flex-direction: row;
  height: 100vh;
  margin: 0;
`

const PackagesContainer = styled(Allotment.Pane)`
  background: ${({ theme }) => theme.colors.primary800};
  height: 100%;
`

const DragHandle = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  -webkit-app-region: drag;
  width: 100vw;
  height: 48px;
`

export default function Layout(): JSX.Element {
  const [selectedPackages, setSelectedPackages] = useState({})

  return (
    <SelectedPackagesContext.Provider
      value={[selectedPackages, setSelectedPackages]}
    >
      <Container>
        <Menu />
        <Allotment vertical={true} defaultSizes={[70, 30]} snap={true}>
          <PackagesContainer>
            <DragHandle />
            <Outlet />
          </PackagesContainer>
          <Allotment.Pane minSize={100}>
            <Console />
          </Allotment.Pane>
        </Allotment>
      </Container>
    </SelectedPackagesContext.Provider>
  )
}
