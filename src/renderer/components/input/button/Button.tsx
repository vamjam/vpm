import clsx from 'clsx'
import { ButtonHTMLAttributes, PropsWithChildren } from 'react'
import styles from './Button.module.css'

export * from './Button.module.css'

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement>
> & {
  primary?: boolean
  active?: boolean
}

export default function Button({
  children,
  primary,
  active,
  className,
  ...props
}: ButtonProps) {
  const type = props.type || 'button'
  const classNames = clsx(className, {
    [styles.active]: active,
    [styles.primary]: primary,
  })

  return (
    <button {...props} className={classNames} type={type}>
      {children}
    </button>
  )
}
