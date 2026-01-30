import {
  Fragment,
  HTMLAttributes,
  MouseEventHandler,
  PropsWithChildren,
  ReactNode,
} from 'react'
import styles from './List.module.css'

export default function List({
  children,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLUListElement>>) {
  return (
    <ul {...props} className={styles.list}>
      {children}
    </ul>
  )
}

type ListItemProps = PropsWithChildren<HTMLAttributes<HTMLLIElement>> & {
  icon?: ReactNode
  value?: ReactNode
  onClick?: MouseEventHandler
  endSlot?: ReactNode
}

export function ListItem({
  children,
  icon,
  value,
  onClick,
  endSlot,
  ...props
}: ListItemProps) {
  const iconRendered = icon ? <span className={styles.icon}>{icon}</span> : null
  const content = (
    <Fragment>
      {iconRendered}
      <div className={styles.linkContent}>{children}</div>
      {value}
      {endSlot}
    </Fragment>
  )
  const rendered = onClick ? (
    <button onClick={onClick}>{content}</button>
  ) : (
    <div>{content}</div>
  )

  return (
    <li {...props} className={styles.listitem}>
      {rendered}
    </li>
  )
}
