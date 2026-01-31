import { useRef } from 'react'
import { useParams } from 'react-router'
import { useResizeObserver } from 'usehooks-ts'
import AssetType from '@shared/AssetType.ts'
import useIPC from '~/hooks/useIPC.ts'
import useStore from '~/hooks/useStore.ts'
import Toolbar from '~/pages/libraries/toolbar/Toolbar.tsx'
import Page from '../Page.tsx'
import styles from './Assets.module.css'
import Grid from './views/Grid.tsx'

export default function Assets() {
  const { type } = useParams<{ type: AssetType | 'presets' }>()
  const assetTypes =
    type === 'presets'
      ? [
          AssetType.PosePreset,
          AssetType.HairPreset,
          AssetType.GeneralPreset,
          AssetType.ClothingPreset,
          AssetType.MorphPreset,
          AssetType.AnimationPreset,
          AssetType.ScriptPreset,
          AssetType.PluginPreset,
          AssetType.SkinPreset,
          AssetType.BreastPreset,
          AssetType.GlutePreset,
          AssetType.AppearancePreset,
        ]
      : [type!]
  const list = useIPC('assets.list', ...assetTypes)
  const ref = useRef<HTMLDivElement>(null!)
  const { width, height } = useResizeObserver({ ref })
  const view = useStore((state) => state['toolbar.view'])

  if (!type) return null

  return (
    <Page
      titlebar={{
        title: assetTypeNameMap[type as keyof typeof assetTypeNameMap],
        children: <Toolbar />,
      }}>
      <div ref={ref} className={styles.container}>
        {view === 'grid' && (
          <Grid data={list.data} width={width} height={height} />
        )}
      </div>
    </Page>
  )
}

const assetTypeNameMap = {
  [AssetType.AddonPackage]: 'Addon Packages',
  [AssetType.Scene]: 'Scenes',
  presets: 'Presets',
}
