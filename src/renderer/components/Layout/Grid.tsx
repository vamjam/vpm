import styled from 'styled-components'

const Grid = styled('div')`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
  grid-gap: var(--spacing-5);
  padding: var(--spacing-5);
`

export default Grid
