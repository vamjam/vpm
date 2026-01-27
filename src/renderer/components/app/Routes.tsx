import { Navigate, Route, Routes as RouterRoutes } from 'react-router'
import useStore from '~/hooks/useStore.ts'
import AssetsPage from '~/pages/assets/Assets.tsx'
import Settings from '~/pages/settings/Settings.tsx'

export default function Routes() {
  const lastLocation = useStore((state) => state['location.last'])
  const landingPath =
    lastLocation && lastLocation !== '/' ? lastLocation : '/assets'

  return (
    <RouterRoutes>
      <Route path="/" element={<Navigate to={landingPath} replace />} />
      <Route path="/assets/:type" element={<AssetsPage />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<Navigate to={landingPath} replace />} />
    </RouterRoutes>
  )
}
