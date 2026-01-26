import * as Icons from '~/icons.ts'
import Page from '../Page.tsx'

export default function Preferences() {
  return (
    <Page
      header={{
        title: 'Preferences',
        icon: <Icons.PreferencesSettingsIcon />,
        description: 'Manage your account preferences.',
      }}></Page>
  )
}
