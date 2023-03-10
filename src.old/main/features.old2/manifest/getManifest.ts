import Zip from 'adm-zip'
import isValidString from '@shared/lib/isValidString'
import Manifest from '~/features/manifest/Manifest'

export default function getManifest(zip: Zip): Promise<Manifest> {
  return new Promise((resolve, reject) => {
    zip.getEntry('meta.json')?.getDataAsync((data, err) => {
      if (err) {
        return reject(err)
      }

      const manifest = data?.toString('utf8')

      if (!isValidString(manifest)) {
        return reject(new Error('Invalid meta.json'))
      }

      try {
        const parsed = JSON.parse(manifest) as Manifest

        resolve(parsed)
      } catch (err) {
        reject(err)
      }
    })
  })
}
