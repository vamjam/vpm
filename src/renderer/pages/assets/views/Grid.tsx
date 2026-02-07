import clsx from 'clsx'
import { useState } from 'react'
import { CellComponentProps, Grid as ReactWindowGrid } from 'react-window'
import { Asset } from '@shared/types.ts'
// import truncateText from 'truncate-text'
import styles from './Grid.module.css'

const COLUMN = 200
const ROW = 260
const GAP = 2

type GridProps = {
  data?: Asset[]
  width?: number
  height?: number
}

export default function Grid({ data, width = 0, height = 0 }: GridProps) {
  const [selected, setSelected] = useState<string[]>([])
  const columnCount = Math.max(1, Math.floor((width + GAP) / (COLUMN + GAP)))

  const itemData: CellData = {
    data,
    columnCount,
    selected,
    setSelected,
  }

  return (
    <ReactWindowGrid
      className={styles.container}
      style={{ width, height, overflow: 'unset', overflowX: 'hidden' }}
      columnCount={columnCount}
      columnWidth={Math.max(COLUMN + GAP, width / columnCount)}
      rowCount={data ? Math.ceil(data.length / columnCount) : 0}
      rowHeight={ROW + GAP}
      cellComponent={Cell}
      cellProps={itemData}
      overscanCount={3}
    />
  )
}

type CellData = {
  data?: Asset[]
  columnCount: number
  selected: string[]
  setSelected: (ids: string[]) => void
}

const CARD_CONTENT_HEIGHT = 60

const THUMBNAIL_STYLE = {
  maxWidth: COLUMN,
  maxHeight: `calc(100% - ${CARD_CONTENT_HEIGHT}px)`,
}

function Cell({
  columnIndex,
  rowIndex,
  data,
  columnCount,
  style,
  selected,
  setSelected,
}: CellComponentProps<CellData>) {
  const asset = data?.[rowIndex * columnCount + columnIndex] as
    | Asset
    | undefined
  if (!asset) return <></>

  const assetURL = `vpm://${asset.type}?file=${encodeURIComponent(asset.url)}`

  return (
    <div
      className={clsx(styles.card, {
        [styles.selected]: selected.includes(asset.id),
      })}
      style={withGap(style)}
      onClick={() => {
        if (selected.includes(asset.id)) {
          setSelected(selected.filter((id) => id !== asset.id))
        } else {
          setSelected([...selected, asset.id])
        }
      }}>
      <img
        src={assetURL}
        alt={asset.fileName}
        className={styles.thumbnail}
        style={THUMBNAIL_STYLE}
      />
      <div className={styles.content}>
        <h4>{asset.fileName}</h4>
      </div>
    </div>
  )
}

function withGap(style: React.CSSProperties): React.CSSProperties {
  return {
    ...style,
    left: num(style.left, GAP / 2),
    top: num(style.top, GAP / 2),
    width: num(style.width, -GAP),
    height: num(style.height, -GAP),
  }
}

function num(value: unknown, delta: number): string | number {
  return typeof value === 'number' ? value + delta : (value as string | number)
}
