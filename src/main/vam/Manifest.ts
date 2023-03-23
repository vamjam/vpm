import { StringifiedBool } from './JSON'

type ManifestDependency = {
  // The id (Creator.Name.Version format) of the dependency
  [id: string]: {
    licenseType?: string
    dependencies?: ManifestDependency
    missing?: StringifiedBool
  }
}

type ReferenceIssue = {
  // The path to the reference
  reference: string
  // Issues typically include a prefix, in all caps, like "BROKEN" or "FIXABLE"
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
  dependencies?: ManifestDependency
  hadReferenceIssues?: StringifiedBool
  referenceIssues?: ReferenceIssue[]
  customOptions?: {
    preloadMorphs?: StringifiedBool
  }
}

export default Manifest
