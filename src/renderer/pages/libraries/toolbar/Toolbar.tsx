import clsx from 'clsx'
import { useCallback } from 'react'
import buttonGroupStyles from '~/components/input/button-group/ButtonGroup.module.css'
// import ButtonGroup from '~/components/input/button-group/ButtonGroup.tsx'
// import Button from '~/components/input/button/Button.tsx'
import Stack from '~/components/layout/stack/Stack.tsx'
import { ToolbarView } from '~/hooks/slices/toolbar.ts'
import useStore from '~/hooks/useStore.ts'
import styles from './Toolbar.module.css'

export default function Toolbar({ children }: { children?: React.ReactNode }) {
  const view = useStore((state) => state['toolbar.view'])
  const setView = useStore((state) => state['toolbar.setView'])

  const viewButtonProps = useCallback(
    (myView: ToolbarView) => ({
      active: view === myView,
      className: clsx({ [buttonGroupStyles.active]: view === myView }),
      onClick: () => setView(myView),
    }),
    [view, setView],
  )

  return (
    <Stack direction="row" justify="space-between" className={styles.container}>
      children woot
      {/* <ButtonGroup>
        <Button>
          <ChevronLeftIcon />
        </Button>
        <Button>
          <ChevronRightIcon />
        </Button>
      </ButtonGroup>
      <span className={styles.title}>{children}</span>
      <ButtonGroup inverse>
        <Button {...viewButtonProps('grid')}>
          <GridIcon />
        </Button>
        <Button {...viewButtonProps('list')}>
          <ListIcon />
        </Button>
        <Button {...viewButtonProps('column')}>
          <ColumnIcon />
        </Button>
        <Button {...viewButtonProps('gallery')}>
          <GalleryIcon />
        </Button>
      </ButtonGroup> */}
    </Stack>
  )
}
