import {
  AppFolder24Regular,
  Apps24Regular,
  Box24Regular,
  Collections24Regular,
  MoviesAndTv24Regular,
  Options24Regular,
  Settings24Regular,
} from '@fluentui/react-icons'
import { NavLink } from 'react-router-dom'
import styled, { css } from 'styled-components'
import { Box } from '~/components/Layout'

const item = css`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 58px;
  justify-content: center;
  width: 58px;
`

const Title = styled('span')`
  display: block;
  font-size: small;
  font-weight: 500;
`

const NavItem = styled(NavLink)`
  ${item}
  color: var(--color-fg-4);
  margin: var(--spacing-6) 0;
  text-decoration: none;
  width: 70%;

  &.active {
    background: var(--color-bg-2);
    border-radius: var(--spacing-4);
    color: var(--color-fg-1);
    outline: var(--border-size) solid var(--border-color);
    pointer-events: none;
  }
`

const NavContainer = styled(Box).attrs({
  as: 'nav',
})`
  background-color: var(--color-bg-1);
  height: 100%;
  width: 90px;
  align-items: center;

  ${NavItem}:last-of-type {
    margin-top: auto;
  }
`

const Divider = styled('div')`
  height: 1px;
  width: 50%;
  background: var(--color-fg-5);
`

const Logo = styled('div')`
  ${item}
  -webkit-app-region: drag;
  padding: var(--spacing-11) 0 var(--spacing-6);
`

const NavItems = {
  '/scenes': {
    icon: MoviesAndTv24Regular,
    title: 'Scenes',
  },
  '/addons': {
    icon: Apps24Regular,
    title: 'Addons',
  },
  '/presets': {
    icon: Options24Regular,
    title: 'Presets',
  },
  '/collections': {
    icon: Collections24Regular,
    title: 'Collections',
  },
  '/hub': {
    icon: AppFolder24Regular,
    title: 'Hub',
  },
  '/settings': {
    icon: Settings24Regular,
    title: 'Settings',
  },
}

export default function Navbar() {
  return (
    <NavContainer>
      <Logo>
        <Box24Regular />
      </Logo>

      <Divider />

      {Object.entries(NavItems).map(([path, { icon, title }]) => {
        const Icon = icon

        return (
          <NavItem key={title} to={path}>
            <Icon />
            <Title>{title}</Title>
          </NavItem>
        )
      })}
    </NavContainer>
  )
}
