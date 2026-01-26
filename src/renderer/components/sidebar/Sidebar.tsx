import { AnchorHTMLAttributes, ReactNode } from 'react'
import { Link as RouterLink, useLocation } from 'react-router'
import BookIcon from 'symbols/BookIcon'
import useLibraries from '~/hooks/useLibraries.ts'
import * as Icons from '~/icons.ts'
import styles from './Sidebar.module.css'

export default function Sidebar() {
  const libraries = useLibraries()

  return (
    <div className={styles.container}>
      <nav>
        {(libraries?.length ?? 0) > 0 && (
          <>
            <h5>Libraries</h5>
            <ul>
              {libraries?.map((library) => (
                <NavItem key={library.id} to={`/library/${library.id}`}>
                  <BookIcon />
                  {library.name}
                </NavItem>
              ))}
            </ul>
          </>
        )}
        <h5>Settings</h5>
        <ul>
          <NavItem to="/settings/libraries">
            <Icons.LibrarySettingsIcon />
            Libraries
          </NavItem>
          <NavItem to="/settings/profile">
            <Icons.ProfileSettingsIcon />
            Profile
          </NavItem>
          <NavItem to="/settings/preferences">
            <Icons.PreferencesSettingsIcon />
            Preferences
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
