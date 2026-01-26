import { Navigate, Route, Routes as RouterRoutes } from 'react-router'
import useLibraries from '~/hooks/useLibraries.ts'
import useStore from '~/hooks/useStore.ts'
import LibraryPage from '~/pages/libraries/Library.tsx'
import LibrarySettings from '~/pages/settings/LibrarySettings.tsx'
import Preferences from '~/pages/settings/Preferences.tsx'
import ProfileSettings from '~/pages/settings/ProfileSettings.tsx'

export default function Routes() {
  const libraries = useLibraries()
  const lastLocation = useStore((state) => state['location.last'])
  const firstLibraryId = libraries?.[0]?.id
  const defaultLibraryPath = firstLibraryId
    ? `/library/${firstLibraryId}`
    : '/settings/libraries'
  const landingPath =
    lastLocation && lastLocation !== '/' ? lastLocation : defaultLibraryPath

  return (
    <RouterRoutes>
      <Route path="/" element={<Navigate to={landingPath} replace />} />
      <Route path="/library/:id" element={<LibraryPage />} />
      <Route path="/settings/libraries" element={<LibrarySettings />} />
      <Route path="/settings/profile" element={<ProfileSettings />} />
      <Route path="/settings/preferences" element={<Preferences />} />
      <Route path="*" element={<Navigate to={landingPath} replace />} />
    </RouterRoutes>
  )
}
