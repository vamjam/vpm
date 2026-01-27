import Page from '~/pages/Page.tsx'
import { SettingsIcon } from '~/ui/icons.ts'

export default function Settings() {
  return (
    <Page
      header={{
        title: 'Settings',
        icon: <SettingsIcon />,
        description: 'Manage your settings.',
      }}></Page>
  )
}
