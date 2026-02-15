import { Asset } from '@shared/entities.ts'

export type ViewComponentProps = {
  data?: Asset[]
  width?: number
  height?: number
  gap?: number
}
