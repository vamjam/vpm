import {
  AppsList20Regular,
  AppsListDetail20Regular,
  Grid20Regular,
} from '@fluentui/react-icons'
import { useCallback, useState } from 'react'
import styled from 'styled-components'
import { Search, SegmentedControl } from '~/components/Input'
import { Box } from '~/components/Layout'

type View = 'grid' | 'list' | 'list-compact'

const segmentedControlOptions = [
  {
    label: <Grid20Regular />,
    value: 'grid',
  },
  {
    label: <AppsList20Regular />,
    value: 'list',
  },
  {
    label: <AppsListDetail20Regular />,
    value: 'list-compact',
  },
]

const useViewControl = () => {
  const [view, setView] = useState<View>(
    segmentedControlOptions[0].value as View
  )

  const handleViewChange = useCallback((value: string) => {
    setView(value as View)
  }, [])

  return {
    options: segmentedControlOptions,
    value: view,
    onChange: handleViewChange,
  }
}

const useSearch = () => {
  const [value, setValue] = useState('')

  const handleSearch = useCallback((value: string) => {
    setValue(value)
  }, [])

  return {
    value,
    onInput: handleSearch,
  }
}

const Container = styled(Box)`
  flex-direction: row;
  justify-content: space-between;
`

export default function Toolbar() {
  const segmentedControlProps = useViewControl()
  const searchProps = useSearch()

  return (
    <Container>
      <SegmentedControl {...segmentedControlProps} />
      <Search {...searchProps} />
    </Container>
  )
}
