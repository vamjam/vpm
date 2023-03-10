import styled from 'styled-components'
import View from './View'

const Container = styled(View)`
  position: absolute;
  inset: 0;
`

const Spinner = styled.svg.attrs({
  width: 60,
  height: 60,
  viewBox: '0 0 60 60',
})`
  @keyframes rotator {
    100% {
      transform: rotate(1turn);
    }
  }
  animation: rotator 1s linear infinite;
`

const Circle = styled.circle.attrs({
  fill: 'none',
  strokeWidth: 5,
  strokeLinecap: 'round',
  cx: 30,
  cy: 30,
  r: 20,
})`
  @keyframes dash {
    0% {
      stroke-dashoffset: 360;
    }
    100% {
      stroke-dasharray: 360;
    }
  }

  stroke: var(--colors-text-9);
  stroke-dasharray: 180;
  stroke-dashoffset: 0;
  transform-origin: center;
  animation: dash 2s ease-in-out infinite;
`

export default function Loader(): JSX.Element {
  return (
    <Container>
      <Spinner>
        <Circle />
      </Spinner>
    </Container>
  )
}
