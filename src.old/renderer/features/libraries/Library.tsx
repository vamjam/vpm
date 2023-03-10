import { Fragment, HTMLAttributes, useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Package } from '@shared/types'
import Loader from '~/components/Loader'
import { useAPI } from '~/store'
import { FilterState } from './Filters'
import PackageComponent from './Package'
import SortOption, { SortOptions } from './SortOption'

type LibraryProps = HTMLAttributes<HTMLDivElement> & {
  // type: LibraryType
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
  sortBy: SortOptions[0],
}

// const hubConfig: SWRConfiguration = {
//   revalidateIfStale: false,
//   revalidateOnMount: false,
//   revalidateOnFocus: false,
//   revalidateOnReconnect: false,
//   refreshInterval: 1000 * 60 * 10, // revalidate every 10 minutes
// }

// const getTime = (date?: Date | null) => date?.getTime() ?? 0

const sort = (data: Package[], by: SortOption) => {
  switch (by) {
    // case 'Date (Newest First)':
    //   return data.sort(
    //     (a, b) => getTime(b.fileUpdatedAt) - getTime(a.fileUpdatedAt)
    //   )

    // case 'Date (Oldest First)':
    //   return data.sort(
    //     (a, b) => getTime(a.fileUpdatedAt) - getTime(b.fileUpdatedAt)
    //   )

    // case 'Size':
    //   return data.sort((a, b) => (b.size ?? 0) - (a.size ?? 0))

    default:
      return data
  }
}

export default function Library({ ...props }: LibraryProps): JSX.Element {
  const [filterState, _] = useState<FilterState>(initialState)
  // const { resolvedType, config } = useMemo(() => {
  //   const resolvedType = type ?? LibraryTypes.INSTALLED
  //   const config: SWRConfiguration | undefined =
  //     resolvedType === LibraryTypes.HUB ? hubConfig : undefined

  //   return {
  //     resolvedType,
  //     config,
  //   }
  // }, [type])

  const { data, loading, error } = useAPI<Package[]>(
    'library'
    // [resolvedType],
    // config
  )

  const packages = useMemo(() => {
    return sort(data ?? [], filterState.sortBy)
  }, [data, filterState.sortBy])

  const handleChange = useCallback((pkg: Package) => {
    console.log('handleChange', pkg)
  }, [])

  // const handlers = useMemo(() => {
  //   const onThumbnailSizeChange: FilterProps['onThumbnailSizeChange'] = (
  //     value
  //   ) => {
  //     setFilterState((state) => ({ ...state, thumbnailSize: value }))
  //   }

  //   const onSearch: FilterProps['onSearch'] = (value) => {
  //     setFilterState((state) => ({ ...state, searchQuery: value }))
  //   }

  //   const onSortChange: FilterProps['onSortChange'] = (value) => {
  //     setFilterState((state) => ({
  //       ...state,
  //       sortBy: value,
  //     }))
  //   }

  //   return {
  //     onThumbnailSizeChange,
  //     onSearch,
  //     onSortChange,
  //   }
  // }, [])

  return (
    <Fragment>
      {/* <Filters state={filterState} /> */}
      <Container $size={filterState.thumbnailSize} {...props}>
        {error && <div>{error}</div>}
        {loading && <Loader />}
        {packages &&
          packages.map((pkg) => {
            return (
              <PackageComponent
                key={pkg.id}
                data={pkg}
                onChange={() => handleChange(pkg)}
              />
            )
          })}
      </Container>
    </Fragment>
  )
}
