import {
  HTMLAttributes,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import styled from 'styled-components'
import useSWR from 'swr'
import { Package } from '@shared/types'
import { SelectedPackagesContext } from '~/app/Layout'
import Loader from '~/components/Loader'
import { HubPackages, Packages as PackageStore } from '~/store'
import { useAPI } from '~/store'
import autoHideScrollbar from '~/utils/autoHideScrollbar'
import PackageComponent from './Package'

const Container = styled.div`
  display: flex;
  gap: 10px;
  ${autoHideScrollbar('y')}
  padding: 0.5rem;
  height: calc(100% - 4rem);
  width: calc(100vw - 60px - 2rem);
  position: relative;
`

export default function Library(
  props: HTMLAttributes<HTMLDivElement>
): JSX.Element {
  const { data, loading, error } = useAPI('getPackages')

  return (
    <Container {...props}>
      {loading && <Loader />}
      {/* {Object.values(data).map((pkg) => {
        return (
          <PackageComponent
            key={pkg.id}
            data={pkg}
            onChange={handleChange(pkg)}
            selected={selectedPackageKeys.includes(pkg.id)}
          />
        )
      })} */}
    </Container>
  )
}
