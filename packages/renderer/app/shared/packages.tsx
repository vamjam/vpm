import {
  HTMLAttributes,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import styled from 'styled-components'
import { Package } from '@shared/types'
import { SelectedPackagesContext } from '~/app/Layout'
import Loader from '~/components/Loader'
import { HubPackages, Packages as PackageStore } from '~/store'
import autoHideScrollbar from '~/utils/autoHideScrollbar'
import PackageComponent from './package'

type PackagesContainerProps = HTMLAttributes<HTMLDivElement> & {
  data: PackageStore | HubPackages
  getData: (take?: number, skip?: number) => void
}

const Container = styled.div`
  box-sizing: content-box;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
  ${autoHideScrollbar('y')}
  padding: 0.5rem;
  height: calc(100% - 4rem);
  width: calc(100vw - 60px - 2rem);
  position: relative;
`

export default function Packages({
  data,
  getData,
  ...props
}: PackagesContainerProps): JSX.Element {
  const [selectedPackages, setSelectedPackages] = useContext(
    SelectedPackagesContext
  )

  const selectedPackageKeys = useMemo(
    () => Object.keys(selectedPackages),
    [selectedPackages]
  )

  const [loading, setIsLoading] = useState(true)

  useEffect(() => {
    if (Object.keys(data).length === 0) {
      getData()
    } else {
      setIsLoading(false)
    }
  }, [getData, data])

  const handleChange = useCallback(
    (pkg: Package) => (selected: boolean) => {
      if (selected === true) {
        setSelectedPackages({ ...selectedPackages, [pkg.id]: pkg })
      } else if (selected === false) {
        const pkgs = { ...selectedPackages }

        delete pkgs[pkg.id]

        setSelectedPackages(pkgs)
      }
    },
    [selectedPackages, setSelectedPackages]
  )

  return (
    <Container {...props}>
      {loading && <Loader />}
      {Object.values(data).map((pkg) => {
        return (
          <PackageComponent
            key={pkg.id}
            data={pkg}
            onChange={handleChange(pkg)}
            selected={selectedPackageKeys.includes(pkg.id)}
          />
        )
      })}
    </Container>
  )
}
