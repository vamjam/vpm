import { Root, Scrollbar, Thumb, Viewport } from '@radix-ui/react-scroll-area'
import { type ReactNode } from 'react'

export default function ScrollArea({ children }: { children: ReactNode }) {
  return (
    <Root>
      <Viewport>{children}</Viewport>
      <Scrollbar orientation="vertical">
        <Thumb />
      </Scrollbar>
    </Root>
  )
}
