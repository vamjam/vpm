import { Allotment } from 'allotment'
import 'allotment/dist/style.css'
import { createContext, useState } from 'react'
import { Outlet } from 'react-router-dom'
import styled from 'styled-components'
import { Package } from '@shared/entities'
import { Menu } from '~/features'

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
          {/* <Allotment.Pane minSize={100}>
            <Console />
          </Allotment.Pane> */}
        </Allotment>
      </Container>
    </SelectedPackagesContext.Provider>
  )
}
