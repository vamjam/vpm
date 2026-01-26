import { ReactNode } from 'react'
import { type Library } from '@filejam/shared/types'
import Stack from '~/components/layout/stack/Stack.tsx'
import useLibraries from '~/hooks/useLibraries.ts'
import * as Icons from '~/icons.ts'
import EditLibrary from '~/pages/libraries/edit-library/EditLibrary.tsx'
import Page from '../Page.tsx'

export default function LibrarySettings() {
  const libraries = useLibraries()
  const Content = libraries.length ? LibraryList : NoLibraries

  return (
    <Page
      header={{
        title: 'Library Settings',
        icon: <Icons.LibrarySettingsIcon />,
        description: 'Manage your libraries and their settings.',
      }}>
      <Stack gap="var(--space-3)">
        <Content libraries={libraries || []}>
          <EditLibrary />
        </Content>
      </Stack>
    </Page>
  )
}

function LibraryList({
  libraries,
  children,
}: {
  libraries: Library[]
  children?: ReactNode
}) {
  return (
    <>
      {libraries.map((library) => (
        <EditLibrary key={library.id} data={library} mode="edit" />
      ))}
      {children}
    </>
  )
}

function NoLibraries({ children }: { children?: ReactNode }) {
  return (
    <>
      <h3>No Libraries Found</h3>
      {children}
    </>
  )
}
