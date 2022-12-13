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
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(260deg);
    }
  }

  animation: rotator 1.4s linear infinite;
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
      stroke-dashoffset: 187;
    }
    50% {
      stroke-dashoffset: 46.75;
      transform: rotate(130deg);
    }
    100% {
      stroke-dashoffset: 186;
      transform: rotate(450deg);
    }
  }

  stroke: ${({ theme }) => theme.colors.accent};
  stroke-dasharray: 186;
  stroke-dashoffset: 0;
  transform-origin: center;
  animation: dash 1.4s ease-in-out infinite;
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
