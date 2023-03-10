import { PackageType } from '@shared/types'

type Meta = {
  path: string[]
  ext: string[]
}

const FileTypeMap: Record<PackageType, Meta> = {
  APPEARANCE: {
    path: ['Custom\\Atom\\Person\\Appearance'],
    ext: ['.vap'],
  },
  ASSET: {
    path: ['Custom\\Assets'],
    ext: ['.assetbundle'],
  },
  CLOTHING: {
    path: ['Custom\\Atom\\Person\\Clothing'],
    ext: ['.vab', '.vaj', '.vam', '.vap'],
  },
  HAIR: {
    path: ['Custom\\Atom\\Person\\Hair', 'Custom\\Hair'],
    ext: ['.vab', '.vaj', '.vam', '.vap'],
  },
  MORPH: {
    path: ['Custom\\Atom\\Person\\Morphs'],
    ext: ['.vmi', '.vmb', '.vap'],
  },
  POSE: {
    path: ['Custom\\Atom\\Person\\Pose'],
    ext: ['.vap'],
  },
  SUBSCENE: {
    path: ['Custom\\SubScene'],
    ext: ['.json'],
  },
  SCRIPT: {
    path: ['Custom\\Atom\\Person\\Plugins', 'Custom\\Scripts'],
    ext: ['.cs'],
  },
  TEXTURE: {
    path: ['']
  }
}

export default FileTypeMap
