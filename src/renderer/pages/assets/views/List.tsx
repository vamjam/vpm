import { useMemo } from 'react'
import { List as ReactWindowList, RowComponentProps } from 'react-window'
import { Asset } from '@shared/types.ts'
import Cell from './Cell.tsx'
import styles from './List.module.css'
import { ViewComponentProps } from './types.ts'

export default function List({
  data,
  width = 0,
  height = 0,
  gap = 0,
}: ViewComponentProps) {
  const rowData = useMemo<RowData>(
    () => ({
      data,
      gap,
    }),
    [data, gap],
  )

  return (
    <div style={{ width, height }}>
      <ReactWindowList
        className={styles.container}
        style={{ width, height }}
        rowComponent={CellWrapper}
        rowCount={data ? data.length : 0}
        rowHeight={60}
        rowProps={rowData}
      />
    </div>
  )
}

type RowData = {
  data?: Asset[]
  gap?: number
}

function CellWrapper({
  index = 0,
  data,
  style,
  gap = 0,
}: RowComponentProps<RowData>) {
  const asset = data?.[index]

  if (!asset) return null

  return <Cell data={asset} gap={gap} style={style} />
}
