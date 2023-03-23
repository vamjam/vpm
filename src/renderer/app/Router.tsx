import { RouteObject, useRoutes } from 'react-router-dom'
import Layout from '~/app/Layout'
import Page, { AddonsPage } from '~/components/Page'

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/addons',
        element: <AddonsPage />,
      },
      {
        path: '/scenes',
        element: <Page />,
      },
      {
        path: '/presets',
        element: <Page />,
      },
      {
        path: '/collections',
        element: <Page />,
      },
    ],
  },
]

export default function Router(): JSX.Element | null {
  const router = useRoutes(routes)

  return router
}
