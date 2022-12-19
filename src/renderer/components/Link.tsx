import {
  Link as RouterLink,
  LinkProps as RouterLinkProps,
  useMatch,
  useResolvedPath,
} from 'react-router-dom'
import styled, { css } from 'styled-components'

type LinkProps = Omit<RouterLinkProps, 'children'> & {
  icon: React.ReactNode
  label: string
}

const Container = styled(RouterLink)<{ $isActive: boolean }>`
  @keyframes move {
    from {
      flex: 1;
    }
    to {
      flex: 2;
    }
  }

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  border-radius: var(--border-radius-1);
  background-color: transparent;
  color: var(--colors-text-11);
  width: 64px;
  height: 64px;
  margin: 0.5rem 1rem;
  text-decoration: none;
  font-size: smaller;
  font-weight: 600;
  transition-property: background, color;
  transition-duration: 200ms;
  transition-timing-function: ease-in-out;

  ${({ $isActive }) =>
    $isActive &&
    css`
      background: var(--colors-surface-5);
      color: var(--colors-text-5);
      justify-content: center;
    `}
  > * {
    /* flex: auto; */
  }

  &:hover {
    /* > * {
      animation: move 300ms alternate;
    } */

    background: var(--colors-surface-4);
    color: var(--colors-text-2);
    /* justify-content: center; */
  }
`

export default function Link({
  to,
  icon,
  label,
  ...props
}: LinkProps): JSX.Element {
  const resolved = useResolvedPath(to)
  const isActive = useMatch({ path: resolved.pathname, end: true }) != null

  return (
    <Container to={to} {...props} $isActive={isActive}>
      {icon}
      {!isActive && label}
    </Container>
  )
}
