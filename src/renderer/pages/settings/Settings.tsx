import * as Icons from '~/icons.ts'
import Page from '../Page.tsx'

export default function Settings() {
  return (
    <Page
      header={{
        title: 'Settings',
        icon: <Icons.PreferencesSettingsIcon />,
        description: 'Manage your settings.',
      }}></Page>
  )
}
