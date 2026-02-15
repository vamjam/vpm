import { useMemo } from 'react'
import { CellComponentProps, Grid as ReactWindowGrid } from 'react-window'
import { Asset } from '@shared/types.ts'
import Cell from './Cell.tsx'
// import truncateText from 'truncate-text'
import styles from './Grid.module.css'
import { ViewComponentProps } from './types.ts'

const COLUMN_WIDTH = 250
const CARD_CONTENT_HEIGHT = 60

export default function Grid({
  data,
  width = 0,
  height = 0,
  gap = 0,
}: ViewComponentProps) {
  const columnCount = Math.max(1, Math.floor(width / COLUMN_WIDTH))
  const rowHeight = COLUMN_WIDTH + gap * 2 + CARD_CONTENT_HEIGHT
  const rowCount = data ? Math.ceil(data.length / columnCount) : 0
  const totalHeight = rowCount * rowHeight

  const itemData = useMemo<CellData>(
    () => ({
      data,
      columnCount,
      gap,
    }),
    [data, columnCount],
  )

  return (
    <div style={{ height: totalHeight }}>
      <ReactWindowGrid
        className={styles.container}
        style={{
          width,
          height,
        }}
        columnCount={columnCount}
        columnWidth={width / columnCount}
        rowCount={rowCount}
        rowHeight={rowHeight}
        cellComponent={CellWrapper}
        cellProps={itemData}
        overscanCount={3}
      />
    </div>
  )
}

type CellData = {
  data?: Asset[]
  columnCount?: number
  gap?: number
}

function CellWrapper({
  data,
  rowIndex,
  columnCount = 0,
  columnIndex,
  ...props
}: CellComponentProps<CellData>) {
  const asset = data?.[rowIndex * columnCount + columnIndex] as
    | Asset
    | undefined
  if (!asset) return null

  return <Cell data={asset} {...props} />
}
