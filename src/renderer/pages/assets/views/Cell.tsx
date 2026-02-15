import clsx from 'clsx'
import { HTMLAttributes } from 'react'
import { Asset } from '@shared/types.ts'
import styles from './views.module.css'

export type CellData = HTMLAttributes<HTMLDivElement> & {
  data?: Asset
  columnCount?: number
  gap?: number
}

export default function Cell({ data, gap = 0, className, ...props }: CellData) {
  if (!data) return null

  const imageSrc = `vpm://image.${data.type}/${data.path}`

  return (
    <div {...props} className={clsx(styles.card, className)}>
      <img
        src={imageSrc}
        alt={data.name}
        className={styles.thumbnail}
        style={{
          margin: gap,
          width: (props.style?.width as number) - gap * 2,
        }}
      />
      <div className={styles.content}>
        <h4>{data.name}</h4>
      </div>
    </div>
  )
}
