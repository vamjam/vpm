import { useMemo, useState } from 'react'
import useIPC from './useIPC.ts'
import useIPCEvent from './useIPCEvent.ts'

export default function useLibraries() {
  const libraryList = useIPC('library.list')
  const [createdLibraries, setCreatedLibraries] = useState(
    () => libraryList?.data ?? [],
  )

  useIPCEvent('library.created', (library) =>
    setCreatedLibraries((prev) => [...prev, library]),
  )

  const libraries = useMemo(() => {
    const baseLibraries = libraryList?.data ?? []
    const combined = [...baseLibraries, ...createdLibraries]

    return combined
  }, [libraryList?.data, createdLibraries])

  return libraries
}
