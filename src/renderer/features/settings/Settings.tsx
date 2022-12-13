import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Config, ConfigKey } from '@shared/types'
import { Heading, List, ListItem, Small, Text, View } from '~/components'

const Label = styled.label`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
`

const formatPathToURL = (path?: string) => {
  return `file://${path?.replaceAll(/\\/g, '/')}`
}

export default function Settings() {
  const [config, setConfig] = useState<Config | null>(null)
  const [invalidate, setInvalidate] = useState(false)

  useEffect(() => {
    if (config == null || invalidate === true) {
      window.api?.getConfig().then(setConfig)
    }

    setInvalidate(false)
  }, [config, invalidate])

  const handleSetConfig = (key: ConfigKey) => async () => {
    const value = await window.api?.selectFolder()

    if (value != null) {
      const fileURL = formatPathToURL(value)

      console.log(key, fileURL)

      window.api?.setConfig(key, fileURL)

      setInvalidate(true)
    }
  }

  return (
    <View flexDirection="column">
      <Heading>Settings</Heading>
      <List>
        <ListItem onClick={handleSetConfig('vam.installPath')}>
          <Text>VaM install path</Text>
          <Small>{config?.vam?.installPath}</Small>
        </ListItem>
        <ListItem onClick={handleSetConfig('library.path')}>
          <Text>vpm library path</Text>
          <Small>{config?.library?.path}</Small>
        </ListItem>
      </List>
    </View>
  )
}
