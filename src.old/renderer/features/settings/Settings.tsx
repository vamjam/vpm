import { useCallback } from 'react'
import { Config, ConfigKey } from '@shared/types'
import { Heading, List, ListItem, Small, Text, View } from '~/components'
import { useAPI } from '~/store'

// import useConfig from '~/hooks/useConfig'

const formatPathToURL = (path?: string) => {
  return `file://${path?.replaceAll(/\\/g, '/')}`
}

export default function Settings() {
  const { data: config } = useAPI<Config>('config')
  // const { config, invalidateConfig } = useConfig()

  const handleSetConfig = useCallback(
    (key: ConfigKey) => async () => {
      const value = await window.api?.selectFolder()

      if (value != null) {
        const fileURL = formatPathToURL(value)

        await window.api?.config.set(key, fileURL)
      }
    },
    []
  )

  return (
    <View flexDirection="column">
      <Heading>Settings</Heading>
      <List>
        <ListItem onClick={handleSetConfig('path.vam')}>
          <Text>VaM install path</Text>
          <Small>{config?.path.vam}</Small>
        </ListItem>
        <ListItem onClick={handleSetConfig('path.library')}>
          <Text>vpm library path</Text>
          <Small>{config?.path.library}</Small>
        </ListItem>
      </List>
    </View>
  )
}
