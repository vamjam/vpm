import { Fragment, HTMLAttributes, useCallback, useState } from 'react'
import styled from 'styled-components'
import { SWRConfiguration } from 'swr'
import { Package } from '@shared/entities'
import { LibraryType, LibraryTypes } from '@shared/enums'
import Loader from '~/components/Loader'
import { useAPI } from '~/store'
import Filters, { FilterState } from './Filters'
import PackageComponent from './Package'

type LibraryProps = HTMLAttributes<HTMLDivElement> & {
  type: LibraryType
}

const Container = styled.div<{ $size: number }>`
  display: grid;
  gap: var(--spacing-3);
  padding: var(--spacing-5);
  grid-template-columns: repeat(
    auto-fill,
    minmax(${({ $size }) => $size}px, 1fr)
  );
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
`

const initialState: FilterState = {
  thumbnailSize: 200,
  searchQuery: '',
  sortBy: 'Date (Newest First)',
}

export default function Library({ type, ...props }: LibraryProps): JSX.Element {
  const [filterState, setFilterState] = useState<FilterState>(initialState)
  const resolvedType = type ?? LibraryTypes.INSTALLED
  const config: SWRConfiguration | undefined =
    resolvedType === LibraryTypes.HUB
      ? {
          revalidateIfStale: false,
          revalidateOnMount: false,
          revalidateOnFocus: false,
          revalidateOnReconnect: false,
          refreshInterval: 1000 * 60 * 10, // revalidate every 10 minutes
        }
      : undefined

  const { data, loading, error } = useAPI<Package[]>(
    `getLibrary`,
    [resolvedType],
    config
  )

  const handleChange = useCallback((pkg: Package) => {
    console.log('handleChange', pkg)
  }, [])

  const handleThumbnailSizeChange = useCallback((value: number) => {
    setFilterState((state) => ({ ...state, thumbnailSize: value }))
  }, [])

  const handleSearch = useCallback((value: string) => {
    setFilterState((state) => ({ ...state, searchQuery: value }))
  }, [])

  const handleSortChange = useCallback((value: string) => {
    setFilterState((state) => ({
      ...state,
      sortBy: value as FilterState['sortBy'],
    }))
  }, [])

  return (
    <Fragment>
      <Filters
        state={filterState}
        onThumbnailSizeChange={handleThumbnailSizeChange}
        onSearch={handleSearch}
        onSortChange={handleSortChange}
      />
      <Container $size={filterState.thumbnailSize} {...props}>
        {error && <div>{error}</div>}
        {loading && <Loader />}
        {data &&
          data.map((pkg) => {
            return (
              <PackageComponent
                key={`${pkg.name}@${pkg.version}`}
                data={pkg}
                onChange={() => handleChange(pkg)}
              />
            )
          })}
      </Container>
    </Fragment>
  )
}
