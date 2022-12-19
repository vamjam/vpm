import { RouteObject, useRoutes } from 'react-router-dom'
import { LibraryTypes } from '~/../shared/enums'
import { Library, Settings } from '~/features'
import Layout from './Layout'

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Library type={LibraryTypes.INSTALLED} />,
      },
      {
        path: '/saved',
        element: <Library type={LibraryTypes.SAVED} />,
      },
      {
        path: '/hub',
        element: <Library type={LibraryTypes.HUB} />,
      },
      {
        path: '/settings',
        element: <Settings />,
      },
    ],
  },
]

export default function Router(): JSX.Element | null {
  const router = useRoutes(routes)

  return router
}
