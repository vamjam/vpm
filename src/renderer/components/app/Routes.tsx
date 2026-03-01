import { Navigate, Route, Routes as RoutesContainer } from 'react-router'
import useStore from '~/hooks/useStore.ts'
import AssetPage from '~/pages/assets/Asset.tsx'
import AssetsPage from '~/pages/assets/Assets.tsx'
import Hub from '~/pages/hub/Hub.tsx'
import Settings from '~/pages/settings/Settings.tsx'

export default function Routes() {
  const lastLocation = useStore((state) => state['location.last'])
  const landingPath =
    lastLocation && lastLocation !== '/' ? lastLocation : '/assets'

  return (
    <RoutesContainer>
      <Route path="/" element={<Navigate to={landingPath} replace />} />
      <Route path="/asset/:id" element={<AssetPage />} />
      <Route path="/assets/:type" element={<AssetsPage />} />
      <Route path="/hub" element={<Hub />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<Navigate to={landingPath} replace />} />
    </RoutesContainer>
  )
}
