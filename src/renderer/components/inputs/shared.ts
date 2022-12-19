import { css } from 'styled-components'

export const active = css`
  background-color: rgba(200 200 200 / 1%);
  border-color: rgba(255 255 255 / 4%);
`

const shared = css`
  background: transparent;
  border-radius: var(--border-radius-2);
  border: 1px solid var(--colors-surface-6);
  color: inherit;
  display: inline-block;
  font-family: inherit;
  font-size: var(--input-font-size);
  line-height: 1;
  padding: var(--spacing-5) var(--spacing-6);
  transition-duration: 0.1s;
  transition-property: background-color, border-color;
  transition-timing-function: ease-out;
  vertical-align: middle;

  &:disabled {
    background: rgba(0 0 0 / 1%);
  }

  &:focus {
    outline: 2px solid var(--colors-accent-10);
  }
`

export default shared
