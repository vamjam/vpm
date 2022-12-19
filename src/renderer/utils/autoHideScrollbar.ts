import { css } from 'styled-components'

export default function autoHideScrollbar(dir: 'x' | 'y' | 'both') {
  return css`
    overflow-y: ${dir === 'x' ? 'hidden' : 'auto'};
    overflow-x: ${dir === 'y' ? 'hidden' : 'auto'};

    &::-webkit-scrollbar-thumb {
      background-color: var(--colors-surface-1);
    }

    &:hover::-webkit-scrollbar-thumb {
      background-color: var(--colors-text-5);
    }
  `
}
