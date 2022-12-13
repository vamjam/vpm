import { RouteObject, useRoutes } from 'react-router-dom'
import { Library, Settings } from '~/features'
import Layout from './Layout'

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Library />,
      },
      {
        path: '/hub',
        element: <Library />,
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
