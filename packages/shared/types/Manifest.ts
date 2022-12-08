type StringifiedBool = 'true' | 'false'

type ManifestDependency = {
  [id: string]: {
    licenseType?: string
    dependencies?: ManifestDependency
  }
}

/**
 * Describes the structure of a VaM manifest file, named
 * "manifest.json" which can be found at the root of a var file.
 */
type Manifest = {
  licenseType?: string
  creatorName?: string
  packageName?: string
  standardReferenceVersionOption?: 'Latest' | string
  scriptReferenceVersionOption?: 'Exact' | string
  includeVersionsInReferences?: StringifiedBool
  description?: string
  credits?: string
  instructions?: string
  promotionalLink?: string
  programVersion?: string
  // An array of paths (file and/or folder) to the content
  // contained in this var file.
  contentList?: string[]
  dependencies?: ManifestDependency
  hadReferenceIssues?: StringifiedBool
  referenceIssues?: string[]
  customOptions?: {
    preloadMorphs?: StringifiedBool
  }
}

export default Manifest
