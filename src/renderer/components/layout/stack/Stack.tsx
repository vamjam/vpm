import clsx from 'clsx'
import { CSSProperties, JSX, ReactNode } from 'react'
import styles from './Stack.module.css'

type StackProps = {
  children: ReactNode
  gap?: number | string
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?:
    | 'start'
    | 'center'
    | 'end'
    | 'stretch'
    | 'space-between'
    | 'space-around'
    | 'space-evenly'
  direction?: 'row' | 'column'
  style?: CSSProperties
  as?: keyof JSX.IntrinsicElements
  className?: string
}

export default function Stack({
  children,
  gap = 'var(--space-5)',
  align = 'stretch',
  justify = 'start',
  direction = 'column',
  as: Component = 'div',
  style,
  className,
}: StackProps) {
  return (
    <Component
      className={clsx(styles.stack, className)}
      style={{
        ...style,
        gap,
        alignItems: align,
        justifyContent: justify,
        flexDirection: direction,
      }}>
      {children}
    </Component>
  )
}
