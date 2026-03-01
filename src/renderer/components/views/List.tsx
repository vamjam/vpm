import { useMemo } from 'react'
import { List as ReactWindowList, RowComponentProps } from 'react-window'
import styles from './List.module.css'
import { CellWrapperData, ViewComponentProps } from './types.ts'

export default function List<T extends object>({
  data,
  width = 0,
  height = 0,
  gap = 0,
  cell,
}: ViewComponentProps<T>) {
  const rowData = useMemo<Omit<CellWrapperData<T>, 'style'>>(
    () => ({
      data,
      gap,
      cell,
    }),
    [data, gap, cell],
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

function CellWrapper<T extends object>({
  index = 0,
  data,
  style,
  gap = 0,
  cell,
}: RowComponentProps<CellWrapperData<T>>) {
  const asset = data?.[index]

  if (!asset) return null

  const Cell = cell

  return <Cell data={asset} gap={gap} style={style} />
}
