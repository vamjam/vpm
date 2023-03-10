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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  border-radius: var(--border-radius-1);
  background-color: transparent;
  color: var(--colors-text-11);
  width: 64px;
  height: 64px;
  margin: 0.5rem 1rem;
  text-decoration: none;
  font-size: smaller;
  font-weight: 600;
  transition-property: background-color, color;
  transition-duration: 100ms;
  /* transition-timing-function: ease-in-out; */
  overflow: hidden;

  ${({ $isActive }) =>
    $isActive &&
    css`
      background: var(--colors-surface-5);
      color: var(--colors-text-5);
    `}

  &:hover {
    background: var(--colors-surface-4);
    color: var(--colors-text-2);
  }
`

const transition = css`
  transform: translateY(0);
  transition-property: transform, opacity, color;
  transition-duration: 100ms;
  transition-timing-function: ease-out;
`

const Icon = styled.div<{ $isActive: boolean }>`
  display: block;
  ${transition}

  ${({ $isActive }) =>
    $isActive &&
    css`
      color: var(--colors-accent-10);
      transform: translateY(14px);
    `}
`

const Label = styled.div<{ $isActive: boolean }>`
  text-align: center;
  opacity: 1;
  ${transition}

  ${({ $isActive }) =>
    $isActive &&
    css`
      opacity: 0;
      transform: translateY(100px);
    `}
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
      <Icon $isActive={isActive}>{icon}</Icon>
      <Label $isActive={isActive}>{label}</Label>
    </Container>
  )
}
