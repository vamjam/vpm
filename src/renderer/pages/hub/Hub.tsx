import { Fragment, useRef } from 'react'
import { useResizeObserver } from 'usehooks-ts'
import Toolbar from '~/components/toolbar/Toolbar.tsx'
import { HubCell } from '~/components/views/Cell.tsx'
import Grid from '~/components/views/Grid.tsx'
import List from '~/components/views/List.tsx'
import useIPC from '~/hooks/useIPC.ts'
import useStore from '~/hooks/useStore.ts'
import Page from '~/pages/Page.tsx'
import styles from '~/pages/assets/Assets.module.css'

export default function Hub() {
  const { data, isLoading, error } = useIPC(
    'hub.list',
    1,
    28,
    'Free',
    'Latest Update',
  )
  const ref = useRef<HTMLDivElement>(null!)
  const { width, height } = useResizeObserver({ ref })
  const view = useStore((state) => state['toolbar.view'])
  const gap = 10

  return (
    <Page
      titlebar={
        <Fragment>
          <h1>Hub</h1>
          <Toolbar />
        </Fragment>
      }>
      <div ref={ref} className={styles.container}>
        {isLoading && <div>Loading...</div>}
        {error && <div>{error?.message}</div>}
        {view === 'grid' ? (
          <Grid
            data={data}
            width={width ? width - 8 : width}
            height={height}
            gap={gap}
            cell={HubCell}
          />
        ) : (
          <List
            data={data}
            width={width ? width - 8 : width}
            height={height}
            gap={gap}
            cell={HubCell}
          />
        )}
      </div>
    </Page>
  )
}
