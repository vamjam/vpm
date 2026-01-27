import AssetType from '@shared/AssetType.ts'
import clsx from 'clsx'
import { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from 'react'
import { Link, useLocation } from 'react-router'
import {
  AddonsIcon,
  HubIcon,
  PresetsIcon,
  ScenesIcon,
  SettingsIcon,
} from '~/ui/icons.ts'
import styles from './Sidebar.module.css'

type SidebarProps = HTMLAttributes<HTMLDivElement>

export default function Sidebar({ className, ...props }: SidebarProps) {
  return (
    <div className={clsx(styles.container, className)} {...props}>
      <div className={styles.logo}>vpm</div>
      <nav>
        <ul>
          <NavLink to={assetLink(AssetType.Scene)}>
            <ScenesIcon /> Scenes
          </NavLink>
          <NavLink to={assetLink(AssetType.AddonPackage)}>
            <AddonsIcon />
            <span>Addons</span>
          </NavLink>
          <NavLink to={assetLink('presets')}>
            <PresetsIcon />
            <span>Presets</span>
          </NavLink>
        </ul>
        <ul>
          <NavLink to="/hub">
            <HubIcon /> <span>Hub</span>
          </NavLink>
        </ul>
        <ul>
          <NavLink to="/settings">
            <SettingsIcon /> <span>Settings</span>
          </NavLink>
        </ul>
      </nav>
    </div>
  )
}

type NavItemProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode
  to: string
}

function NavLink({ to, children, ...anchorProps }: NavItemProps) {
  const location = useLocation()
  const isActive = location.pathname === to
  const className = isActive ? styles.active : ''

  return (
    <li>
      <Link to={to} {...anchorProps} className={className}>
        {children}
      </Link>
    </li>
  )
}

function assetLink(assetType: AssetType | string) {
  return `/assets/${assetType}`
}
