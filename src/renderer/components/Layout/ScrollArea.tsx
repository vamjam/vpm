import * as ScrollField from '@radix-ui/react-scroll-area'
import { ReactNode } from 'react'
import styled from 'styled-components'

const Root = styled(ScrollField.Root)`
  overflow: hidden;
  --scrollbar-size: 10px;
`

const Viewport = styled(ScrollField.Viewport)`
  width: 100%;
  height: 100%;
`

const Scrollbar = styled(ScrollField.Scrollbar)`
  display: flex;
  user-select: none;
  touch-action: none;
  padding: 2px;
  background: var(--color-black-a6);
  transition: background 160ms ease-out;

  :hover {
    background: var(--color-black-a8);
  }

  &[data-orientation='vertical'] {
    width: var(--scrollbar-size);
  }

  &[data-orientation='horizontal'] {
    flex-direction: column;
    height: var(--scrollbar-size);
  }
`

const ScrollThumb = styled(ScrollField.Thumb)`
  flex: 1;
  background: var(--color-fg-4);
  border-radius: var(--scrollbar-size);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    min-width: 44px;
    min-height: 44px;
  }
`

const ScrollCorner = styled(ScrollField.Corner)`
  background: var(--color-black-a8);
`

type ScrollAreaProps = {
  children: ReactNode
}

export default function ScrollArea({ children }: ScrollAreaProps) {
  return (
    <Root>
      <Viewport>{children}</Viewport>
      <Scrollbar orientation="vertical">
        <ScrollThumb />
      </Scrollbar>
      <Scrollbar orientation="horizontal">
        <ScrollThumb />
      </Scrollbar>
      <ScrollCorner />
    </Root>
  )
}
