import { useRef } from 'react'
import { useParams } from 'react-router'
import { useResizeObserver } from 'usehooks-ts'
import useIPC from '~/hooks/useIPC.ts'
import useLibraries from '~/hooks/useLibraries.ts'
import useStore from '~/hooks/useStore.ts'
import Toolbar from '~/pages/libraries/toolbar/Toolbar.tsx'
import Page from '../Page.tsx'
import styles from './Library.module.css'
import Grid from './views/Grid.tsx'

export default function Library() {
  const libraries = useLibraries()
  const { id } = useParams<{ id: string }>()
  const library = libraries.find((lib) => lib.id === id)

  return (
    <Page>
      <Toolbar>{library?.name}</Toolbar>
      <em>{library?.description}</em>
      {id && <Assets libraryId={id} />}
    </Page>
  )
}

type AssetsProps = {
  libraryId: string
}

function Assets({ libraryId }: AssetsProps) {
  const { data } = useIPC('assets.list', libraryId)
  const assets = data ?? []
  const ref = useRef<HTMLDivElement>(null!)
  const { width } = useResizeObserver({ ref })
  const view = useStore((state) => state['toolbar.view'])

  return (
    <div ref={ref} className={styles.container}>
      {view === 'grid' && <Grid data={assets} width={width} />}
    </div>
  )
}
