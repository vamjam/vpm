import { RouteObject, useRoutes } from 'react-router-dom'
import { State, useStore } from '~/store'
import Layout from './Layout'
import Packages from './shared/packages'

const localPackagesSelector = ({ packages, getPackages }: State) => ({
  packages,
  getPackages,
})

const LocalPackages = () => {
  const { packages, getPackages } = useStore(localPackagesSelector)

  return <Packages data={packages} getData={getPackages} />
}

const hubPackagesSelector = ({ hubPackages, getHubPackages }: State) => ({
  packages: hubPackages,
  getPackages: getHubPackages,
})

const HubPackages = () => {
  const { packages, getPackages } = useStore(hubPackagesSelector)

  return <Packages data={packages ?? {}} getData={getPackages} />
}

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <LocalPackages />,
      },
      {
        path: '/hub',
        element: <HubPackages />,
      },
    ],
  },
]

export default function Router(): JSX.Element | null {
  const router = useRoutes(routes)

  return router
}
