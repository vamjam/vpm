type StringifiedBool = 'true' | 'false'

export type ManifestDependency = {
  licenseType?: string
  dependencies?: ManifestDependency
  missing?: StringifiedBool
}

type ReferenceIssue = {
  // The path to the reference
  reference: string
  // Issues typically include a prefix, in all ca pps, like "BROKEN" or "FIXABLE"
  issue: string
}

/**
 * Describes the structure of a VaM manifest file, named
 * "meta.json" which can be found at the root of a var file.
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
  dependencies?: Record<string, ManifestDependency>
  hadReferenceIssues?: StringifiedBool
  referenceIssues?: ReferenceIssue[]
  customOptions?: {
    preloadMorphs?: StringifiedBool
  }
}

export default Manifest
