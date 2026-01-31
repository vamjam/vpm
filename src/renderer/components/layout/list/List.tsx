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
  title: string
  description: string
  icon?: ReactNode
  value?: ReactNode
  onClick?: MouseEventHandler
  endSlot?: ReactNode
}

export function ListItem({
  icon,
  value,
  onClick,
  endSlot,
  title,
  description,
  ...props
}: ListItemProps) {
  const innerContent = (
    <Fragment>
      {icon ? <span className={styles.icon}>{icon}</span> : null}
      <div className={styles.linkContent}>
        <h4>{title}</h4>
        <span className={styles.description}>{description}</span>
      </div>
      {value}
      {endSlot}
    </Fragment>
  )
  const content = onClick ? (
    <button onClick={onClick}>{innerContent}</button>
  ) : (
    <div>{innerContent}</div>
  )

  return (
    <li {...props} className={styles.listitem}>
      {content}
    </li>
  )
}
