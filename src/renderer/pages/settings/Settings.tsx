import {
  Folder24Regular as FolderIcon,
  LineStyleSketch24Regular as LogIcon,
  ChevronRight16Filled as RightArrowIcon,
  DocumentDatabase24Regular as UserdataStorageIcon,
} from '@fluentui/react-icons'
import {
  MouseEventHandler,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react'
import type { ConfigKey } from '@main/config/ConfigStore.ts'
import schema from '@main/config/schema.json' with { type: 'json' }
import Select from '~/components/input/select/Select.tsx'
import List, { ListItem } from '~/components/layout/list/List.tsx'
import Page from '~/pages/Page.tsx'
import styles from './Settings.module.css'

type SettingEntry = {
  key: string
  value: ReactNode
  title: string
  description: string
  icon: ReactNode
  onClick?: MouseEventHandler
}

const logLevels = [
  'Debug (& Info & Warnings & Errors)',
  'Info (& Warnings & Errors)',
  'Warning (& Errors)',
  'Error (Errors only)',
] as const

const settingsMap = {
  'log.level': {
    icon: <LogIcon />,
    value: (value: number, refresh: () => Promise<void>) => {
      const options = logLevels.map((level, index) => ({
        value: String(index),
        label: level,
      }))

      const handleClick = async (value: string) => {
        const num = Number(value)

        await window.api['config.set']('log.level', num)
        await refresh()
      }

      return (
        <Select
          options={options}
          value={String(value)}
          onChange={handleClick}
        />
      )
    },
  },
  'data.path': {
    icon: <UserdataStorageIcon />,
    onClick: (refresh: () => Promise<void>, value: string) => {
      return async () => {
        const selected = await window.api['directory.select'](value)

        if (selected && selected.length > 0) {
          await window.api['config.set']('data.path', selected)

          await refresh()
        }
      }
    },
  },
  'vam.path': {
    icon: <FolderIcon />,
    value: (value: string) => (value == undefined ? <em>Not set</em> : value),
    onClick: (refresh: () => Promise<void>, value: string) => {
      return async () => {
        const selected = await window.api['directory.select'](value)

        if (selected && selected.length > 0) {
          await window.api['config.set']('vam.path', selected)

          await refresh()
        }
      }
    },
  },
}

const editableSettings = Object.entries(schema.properties).filter(([_, p]) => {
  if ('readOnly' in p && p.readOnly) return false

  return true
})

export default function Settings() {
  const [state, setState] = useState<SettingEntry[]>([])

  const fetchSettings = useCallback(async () => {
    const settings: SettingEntry[] = await Promise.all(
      editableSettings.map(async ([key, _]) => {
        const value = await window.api['config.get'](key as ConfigKey)
        const prop = schema.properties[key as keyof typeof schema.properties]
        const mapped = settingsMap[key as keyof typeof settingsMap]!
        const mapValue =
          'value' in mapped ? mapped.value : (v: unknown) => v as ReactNode
        const onClick =
          'onClick' in mapped
            ? mapped.onClick(fetchSettings, value as any)
            : undefined

        return {
          key,
          description: prop.description,
          title: prop.title,
          value: mapValue(value as never, fetchSettings),
          icon: mapped.icon,
          onClick,
        }
      }),
    )

    setState(settings)
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  return (
    <Page
      titlebar={{
        title: 'Settings',
      }}>
      <div className={styles.container}>
        <List>
          {state.map(({ key, ...rest }) => (
            <ListItem
              key={key}
              {...rest}
              endSlot={rest.onClick && <RightArrowIcon />}
            />
          ))}
        </List>
      </div>
    </Page>
  )
}
