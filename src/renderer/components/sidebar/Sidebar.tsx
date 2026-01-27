import { AssetType } from '@shared/types.ts'
import { AnchorHTMLAttributes, ReactNode } from 'react'
import { Link as RouterLink, useLocation } from 'react-router'
import {
  AddonsIcon,
  HubIcon,
  PresetsIcon,
  ScenesIcon,
  SettingsIcon,
} from '~/ui/icons.ts'
import styles from './Sidebar.module.css'

export default function Sidebar() {
  return (
    <div className={styles.container}>
      <div className={styles.logo}>vpm</div>
      <nav>
        <ul>
          <NavItem to={assetLink(AssetType.Scene)}>
            <ScenesIcon />
            Scenes
          </NavItem>
          <NavItem to={assetLink(AssetType.AddonPackage)}>
            <AddonsIcon />
            Addons
          </NavItem>
          <NavItem to="/assets/presets">
            <PresetsIcon />
            Presets
          </NavItem>
        </ul>
        <ul>
          <NavItem to="/hub">
            <HubIcon />
            Hub
          </NavItem>
        </ul>
        <ul>
          <NavItem to="/settings/libraries">
            <SettingsIcon />
            Settings
          </NavItem>
        </ul>
      </nav>
    </div>
  )
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode
  to: string
}

function NavItem({ to, children, ...anchorProps }: LinkProps) {
  const location = useLocation()
  const isActive = location.pathname === to
  const className = isActive ? styles.active : ''

  return (
    <li>
      <RouterLink to={to} {...anchorProps} className={className}>
        {children}
      </RouterLink>
    </li>
  )
}

function assetLink(assetType: AssetType) {
  return `/assets/${assetType}`
}
