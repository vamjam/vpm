type StringifiedBool = 'true' | 'false'

type Vector3 = {
  x: string
  y: string
  z: string
}

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
export type Manifest = {
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

type Storable = {
  [key: string]: string | Record<string, string> | Record<string, string>[]
  id: string
}

type Atom = {
  id: string
  on: StringifiedBool
  type: string
  position?: Vector3
  localPosition?: Vector3
  rotation?: Vector3
  localRotation?: Vector3
  containerPosition?: Vector3
  containerLocalPosition?: Vector3
  containerLocalRotation?: Vector3
  collisionEnabled?: StringifiedBool
  storables: Storable[]
}

export type Scene = {
  playerHeightAdjust: string
  monitorCameraRotation: Vector3
  useSceneLoadPosition: StringifiedBool
  atoms: Atom[]
}

export type Subscene = {
  subScene: Record<string, unknown>
  atoms: Atom[]
}
