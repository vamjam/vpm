import {
  Grid20Regular as GridIcon,
  List20Regular as ListIcon,
  Search16Regular as SearchIcon,
} from '@fluentui/react-icons'
import clsx from 'clsx'
import { useCallback } from 'react'
import buttonGroupStyles from '~/components/input/button-group/ButtonGroup.module.css'
import ButtonGroup from '~/components/input/button-group/ButtonGroup.tsx'
import Button from '~/components/input/button/Button.tsx'
import Textbox from '~/components/input/textbox/Textbox.tsx'
import Stack from '~/components/layout/stack/Stack.tsx'
import { ToolbarView } from '~/hooks/slices/toolbar.ts'
import useStore from '~/hooks/useStore.ts'
import styles from './Toolbar.module.css'

export default function Toolbar() {
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
      <ButtonGroup>
        <Button {...viewButtonProps('grid')}>
          <GridIcon />
        </Button>
        <Button {...viewButtonProps('list')}>
          <ListIcon />
        </Button>
      </ButtonGroup>
      <Search />
    </Stack>
  )
}

function Search() {
  return <Textbox icons={[{ position: 'start', element: <SearchIcon /> }]} />
}
