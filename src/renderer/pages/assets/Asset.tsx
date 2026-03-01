import { useParams } from 'react-router'
import useIPC from '~/hooks/useIPC.ts'
import Page from '~/pages/Page.tsx'
import styles from './Assets.module.css'

export default function Asset() {
  const { id } = useParams<{ id: string }>()
  const { data: asset, isLoading, error } = useIPC('asset.get', id)

  return (
    <Page titlebar={asset?.name}>
      <div className={styles.container}>
        {isLoading && <div>Loading...</div>}
        {error && <div>{error?.message}</div>}
        {asset && (
          <div>
            <p>Type: {asset.type}</p>
            <p>Size: {asset.size} bytes</p>
            <p>Created At: {asset.createdAt?.toLocaleString()}</p>
            <p>Updated At: {asset.updatedAt?.toLocaleString()}</p>
          </div>
        )}
      </div>
    </Page>
  )
}
