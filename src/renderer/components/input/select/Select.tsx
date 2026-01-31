import { ChevronDown16Filled as DownIcon } from '@fluentui/react-icons'
import {
  Content,
  Item,
  ItemIndicator,
  ItemText,
  Portal,
  Root,
  Trigger,
  Value,
  Viewport,
} from '@radix-ui/react-select'
import styles from './Select.module.css'

type SelectProps = {
  options: { value: string; label: string }[]
  value: string
  onChange?: (value: string) => void
}

export default function Select({ options, onChange, value }: SelectProps) {
  return (
    <Root value={value} onValueChange={onChange}>
      <Trigger className={styles.trigger}>
        <Value />
        <DownIcon />
      </Trigger>
      <Portal>
        <Content className={styles.content}>
          <Viewport className={styles.viewport}>
            {options.map((option) => (
              <Item
                key={option.value}
                value={option.value}
                className={styles.item}>
                <ItemText>{option.label}</ItemText>
                <ItemIndicator />
              </Item>
            ))}
          </Viewport>
        </Content>
      </Portal>
    </Root>
  )
}
