import clsx from 'clsx'
import { HTMLAttributes } from 'react'
import { Asset } from '@shared/entities.ts'
import { HubAsset } from '@shared/hub.ts'
import styles from './views.module.css'

export type CellData<T> = HTMLAttributes<HTMLAnchorElement> & {
  data?: T
  columnCount?: number
  gap?: number
}

export function HubCell({
  data,
  gap = 0,
  className,
  ...props
}: CellData<HubAsset>) {
  if (!data) return null

  return (
    <a {...props} className={clsx(styles.card, className)}>
      <img
        src={data.imageURL}
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
    </a>
  )
}

export function AssetCell({
  data,
  gap = 0,
  className,
  ...props
}: CellData<Asset>) {
  if (!data) return null

  console.log(props, data)

  const imageSrc = `vpm://image.${data.type}/${data.path}`

  return (
    <a
      href={`asset/${data.id}`}
      {...props}
      className={clsx(styles.card, className)}>
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
    </a>
  )
}
