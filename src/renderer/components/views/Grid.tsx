import { useMemo } from 'react'
import { CellComponentProps, Grid as ReactWindowGrid } from 'react-window'
import styles from './Grid.module.css'
import { CellWrapperData, ViewComponentProps } from './types.ts'

const COLUMN_WIDTH = 250
const CARD_CONTENT_HEIGHT = 60

export default function Grid<T extends object>({
  data,
  width = 0,
  height = 0,
  gap = 0,
  cell,
}: ViewComponentProps<T>) {
  const columnCount = Math.max(1, Math.floor(width / COLUMN_WIDTH))
  const rowHeight = COLUMN_WIDTH + gap * 2 + CARD_CONTENT_HEIGHT
  const rowCount = data ? Math.ceil(data.length / columnCount) : 0
  const totalHeight = rowCount * rowHeight

  const itemData = useMemo<Omit<CellWrapperData<T>, 'style'>>(
    () => ({
      data,
      columnCount,
      gap,
      cell,
    }),
    [data, columnCount, gap, cell],
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

function CellWrapper<T extends object>({
  data,
  rowIndex,
  columnCount = 0,
  columnIndex,
  cell,
  ...props
}: CellComponentProps<CellWrapperData<T>>) {
  const item = data?.[rowIndex * columnCount + columnIndex] as T | undefined
  if (!item) return null

  const Cell = cell

  return <Cell data={item} {...props} />
}
