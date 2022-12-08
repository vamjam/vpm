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

const Container = styled(RouterLink)<{ $match: boolean }>`
  border-radius: ${({ theme }) => theme.borderRadius};
  background-color: ${({ theme, $match }) =>
    $match ? theme.colors.primary700 : theme.colors.surface};
  color: ${({ theme, $match }) =>
    $match ? theme.colors.accent : theme.colors.primary};
  width: 60px;
  height: 56px;
  margin: 0 0 1rem 1rem;
  text-decoration: none;
  font-size: 10px;

  ${({ $match }) =>
    $match &&
    css`
      svg {
        height: 100%;
      }
    `}
`

export default function Link({
  to,
  icon,
  label,
  ...props
}: LinkProps): JSX.Element {
  const resolved = useResolvedPath(to)
  const match = useMatch({ path: resolved.pathname, end: true }) != null

  return (
    <Container to={to} {...props} $match={match}>
      {icon}
      {!match && label}
    </Container>
  )
}
