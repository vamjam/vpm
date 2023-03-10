import styled from 'styled-components'

export const List = styled.ul`
  display: flex;
  flex-direction: column;
  width: 100%;
`

export const ListItem = styled.li`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  border-radius: 0.25rem;
  margin: 0 2rem 0.33rem;
  background: var(--colors-surface-3);

  &:hover {
    background: var(--colors-surface-4);
  }
`
