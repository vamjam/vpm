import { HTMLAttributes, forwardRef } from 'react'
import styled from 'styled-components'
import { Link, View } from '~/components'
import { Button, ButtonGroup, TextBox } from '~/components/inputs'
import useStore, { State } from '~/store/useStore'
import ViewToggle from './ViewToggle'

const menuSelector = ({
  isScanning,
  scan,
  abortScan,
  vamInstallPaths,
  setVamInstallPaths,
}: State) => ({
  isScanning,
  scan,
  abortScan,
  vamInstallPath: vamInstallPaths[0],
  setVamInstallPaths,
})

const Menu = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  (props, ref) => {
    const { isScanning, vamInstallPath, setVamInstallPaths, scan, abortScan } =
      useStore(menuSelector)

    const handleSetVamPath = async () => {
      const dir = await window.api?.selectFolder()

      if (typeof dir === 'string' && dir.length > 0) {
        setVamInstallPaths(dir)
      }
    }

    const handleScan = () => {
      if (!isScanning) {
        scan()
      }
    }

    return (
      <Container ref={ref} {...props}>
        <Section>
          <ViewToggle />
        </Section>
        <Section>
          <ButtonGroup>
            <Button
              onClick={handleScan}
              disabled={isScanning || !vamInstallPath}
            >
              Scan
            </Button>
            <Button onClick={abortScan} disabled={!isScanning}>
              Cancel Scan
            </Button>
          </ButtonGroup>
        </Section>
        <Section>
          <ButtonGroup>
            <TextBox readOnly={true} value={vamInstallPath ?? ''} />
            <Button onClick={handleSetVamPath}>Set VaM Path</Button>
          </ButtonGroup>
        </Section>
      </Container>
    )
  }
)

Menu.displayName = 'Menu'

export default Menu

const Container = styled(View).attrs({
  $dir: 'column',
})`
  padding: 8px;
`

const Section = styled.div`
  display: flex;
`
