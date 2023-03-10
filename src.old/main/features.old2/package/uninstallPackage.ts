import Repository from '~/db/Repository'
import { manifestService } from '~/features/manifest'
import tokenize, { VamInstallPathToken } from '~/utils/tokenize'
import parseFileName from './parseFileName'

export default async function uninstallPackage(id: number) {
  const pkg = await Repository.packages().findOne({
    where: {
      id,
    },
  })

  if (pkg == null) {
    throw new Error(`Unable to find a package with "${id}"`)
  }

  // Is package installed?
  if (pkg.isInstalled == false) {
    throw new Error(`Package "${pkg.name}" is not installed`)
  }

  // Get the manifest file
  const file = tokenize.decodePath(pkg.url, VamInstallPathToken)
  const zip = new Zip(file)
  const manifest = await manifestService.getManifest(zip)

  for await (const [key, depMeta] of Object.entries(
    manifest.dependencies ?? {}
  )) {
    const { creatorName, name } = parseFileName(key)
    const dep = await Repository.findPackageByNameAndCreator(name, creatorName)
  }
}
