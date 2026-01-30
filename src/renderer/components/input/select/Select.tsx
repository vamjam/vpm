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
}

export default function Select({ options, value }: SelectProps) {
  return (
    <Root value={value}>
      <Trigger className={styles.trigger}>
        <Value />
        <DownIcon />
      </Trigger>
      <Portal>
        <Content className={styles.content}>
          <Viewport>
            {options.map((option) => (
              <Item key={option.value} value={option.value}>
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
