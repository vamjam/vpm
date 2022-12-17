import { useCallback } from 'react'
import { ConfigKey } from '@shared/types'
import { Heading, List, ListItem, Small, Text, View } from '~/components'
import useConfig from '~/hooks/useConfig'

const formatPathToURL = (path?: string) => {
  return `file://${path?.replaceAll(/\\/g, '/')}`
}

export default function Settings() {
  const { config, invalidateConfig } = useConfig()

  const handleSetConfig = useCallback(
    (key: ConfigKey) => async () => {
      const value = await window.api?.selectFolder()

      if (value != null) {
        const fileURL = formatPathToURL(value)

        await window.api?.setConfig(key, fileURL)

        invalidateConfig()
      }
    },
    [invalidateConfig]
  )

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
