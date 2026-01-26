import * as Icons from '~/icons.ts'
import Page from '../Page.tsx'

export default function ProfileSettings() {
  return (
    <Page
      header={{
        title: 'Profile Settings',
        icon: <Icons.ProfileSettingsIcon />,
        description: 'Update your account details.',
      }}></Page>
  )
}
