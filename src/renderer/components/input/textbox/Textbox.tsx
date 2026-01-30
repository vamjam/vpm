import clsx from 'clsx'
import { HTMLInputTypeAttribute, InputHTMLAttributes } from 'react'
import styles from './Textbox.module.css'

export type TextboxType =
  | 'text'
  | 'password'
  | 'email'
  | 'search'
  | 'tel'
  | 'url'

type TextboxIcon = {
  position: 'start' | 'end'
  element: React.ReactNode
}

type TextboxProps = InputHTMLAttributes<HTMLInputElement> & {
  type?: TextboxType | HTMLInputTypeAttribute
  icons?: TextboxIcon[]
}

export default function Textbox(props: TextboxProps) {
  const type = props.type || 'text'
  const startIcons = props.icons?.filter((icon) => icon.position === 'start')
  const endIcons = props.icons?.filter((icon) => icon.position === 'end')
  const inputClassName = clsx(styles.textbox, {
    [styles.withStartIcon]: startIcons && startIcons.length > 0,
    [styles.withEndIcon]: endIcons && endIcons.length > 0,
  })

  return (
    <div className={styles.container}>
      {startIcons?.map((icon, index) => (
        <div key={index} className={styles.icon}>
          {icon.element}
        </div>
      ))}

      <input type={type} className={inputClassName} {...props} />

      {endIcons
        ?.filter((icon) => icon.position === 'end')
        .map((icon, index) => (
          <div key={index} className={styles.icon}>
            {icon.element}
          </div>
        ))}
    </div>
  )
}
