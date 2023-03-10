import styled from 'styled-components'

const Container = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
`

export default function App(): JSX.Element {
  return (
    <Container>
      <h1>I&apos;m an app</h1>
    </Container>
  )
}
