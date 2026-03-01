import { Fragment, useRef } from 'react'
import { useParams } from 'react-router'
import { useResizeObserver } from 'usehooks-ts'
import AssetType from '@shared/AssetType.ts'
import { Asset } from '@shared/entities.ts'
import Toolbar from '~/components/toolbar/Toolbar.tsx'
import { AssetCell } from '~/components/views/Cell.tsx'
import Grid from '~/components/views/Grid.tsx'
import List from '~/components/views/List.tsx'
import { SortBy } from '~/hooks/slices/toolbar.ts'
import useIPC from '~/hooks/useIPC.ts'
import useStore from '~/hooks/useStore.ts'
import Page from '~/pages/Page.tsx'
import styles from './Assets.module.css'

export default function Assets() {
  const { type } = useParams<{ type: AssetType | 'presets' }>()
  const assetTypes = type === 'presets' ? presetTypes : [type!]
  const {
    data: assets,
    isLoading,
    error,
  } = useIPC('assets.list', ...assetTypes)
  const ref = useRef<HTMLDivElement>(null!)
  const { width, height } = useResizeObserver({ ref })
  const view = useStore((state) => state['toolbar.view'])
  const sortBy = useStore((state) => state['toolbar.sortBy'])
  const gap = 10
  const data = sortDataBy(assets, sortBy)?.filter((a) => !a.isHidden)

  if (!type) return null

  return (
    <Page
      titlebar={
        <Fragment>
          <h1>{assetTypeNameMap[type as keyof typeof assetTypeNameMap]}</h1>
          <Toolbar />
        </Fragment>
      }>
      <div ref={ref} className={styles.container}>
        {isLoading && <div>Loading...</div>}
        {error && <div>{error?.message}</div>}
        {view === 'grid' ? (
          <Grid
            key={`grid-${type}-${sortBy}`}
            data={data}
            width={width ? width - 8 : width}
            height={height}
            gap={gap}
            cell={AssetCell}
          />
        ) : (
          <List
            data={data}
            width={width ? width - 8 : width}
            height={height}
            gap={gap}
            cell={AssetCell}
          />
        )}
      </div>
    </Page>
  )
}

function sortDataBy(data: Asset[] | undefined, sortBy: SortBy) {
  if (!data) return data

  switch (sortBy) {
    case 'date-desc':
      return data.sort(
        (a, b) =>
          (b.updatedAt?.getTime() ?? 0) - (a?.updatedAt?.getTime() ?? 0),
      )
    case 'date-asc':
      return data.sort(
        (a, b) => (a.updatedAt?.getTime() ?? 0) - (b.updatedAt?.getTime() ?? 0),
      )
    case 'name-asc':
      return data.sort((a, b) => a.name.localeCompare(b.name))
    case 'name-desc':
      return data.sort((a, b) => b.name.localeCompare(a.name))
    case 'size-asc':
      return data.sort((a, b) => a.size - b.size)
    case 'size-desc':
      return data.sort((a, b) => b.size - a.size)
  }
}

const presetTypes = [
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

const assetTypeNameMap = {
  [AssetType.AddonPackage]: 'Addon Packages',
  [AssetType.Scene]: 'Scenes',
  presets: 'Presets',
}
