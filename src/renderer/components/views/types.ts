import { CellData } from './Cell.tsx'

export type ViewComponentProps<T extends object = object> = {
  data?: T[]
  width?: number
  height?: number
  gap?: number
  cell: React.ComponentType<CellData<T>>
}

export type CellWrapperData<T extends object> = Omit<CellData<T>, 'data'> & {
  data?: T[]
  cell: React.ComponentType<CellData<T>>
}
