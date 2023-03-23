import { AssetType } from '@shared/types'

export type AssetInfo = {
  // The relative path from the VaM root.
  paths: string[]
  // The file's extension.
  exts: string[]
  // Whether the file has dependencies. Some assets will
  // have depencencies listed in another file. If that's the
  // case, then list its extension.
  dependencies?: boolean | string
}

const AssetParserMap: Record<
  Exclude<AssetType, AssetType.Texture>,
  AssetInfo
> = {
  [AssetType.AddonPackage]: {
    paths: ['AddonPackages'],
    exts: ['.var'],
  },
  [AssetType.AppearancePreset]: {
    paths: ['Custom\\Atom\\Person\\Appearance'],
    exts: ['.vap'],
    dependencies: true,
  },
  [AssetType.AssetBundle]: {
    paths: ['Custom\\Assets'],
    exts: ['.assetbundle'],
  },
  [AssetType.BreastPreset]: {
    paths: ['Custom\\Atom\\Person\\BreastPhysics'],
    exts: ['.vap'],
  },
  [AssetType.Clothing]: {
    paths: ['Custom\\Clothing'],
    exts: ['.vam'],
    dependencies: '.vaj',
  },
  [AssetType.ClothingPreset]: {
    paths: ['Custom\\Clothing', 'Custom\\Atom\\Person\\Clothing'],
    exts: ['.vap'],
    dependencies: true,
  },
  [AssetType.GlutePreset]: {
    paths: ['Custom\\Atom\\Person\\GlutePhysics'],
    exts: ['.vap'],
  },
  [AssetType.Hair]: {
    paths: ['Custom\\Hair'],
    exts: ['.vam'],
    dependencies: '.vaj',
  },
  [AssetType.HairPreset]: {
    paths: ['Custom\\Hair', 'Custom\\Atom\\Person\\Hair'],
    exts: ['.vap'],
    dependencies: true,
  },
  [AssetType.Morph]: {
    paths: ['Custom\\Atom\\Person\\Morphs'],
    exts: ['.vmi'],
  },
  [AssetType.PosePreset]: {
    paths: ['Custom\\Atom\\Person\\Pose'],
    exts: ['.vap'],
  },
  [AssetType.Subscene]: {
    paths: ['Custom\\SubScene'],
    exts: ['.json'],
  },
  [AssetType.Scene]: {
    paths: ['Saves\\scene'],
    exts: ['.json'],
  },
  [AssetType.Script]: {
    paths: ['Custom\\Scripts'],
    exts: ['.cslist', '.cs'],
  },
  [AssetType.ScriptPreset]: {
    paths: ['Custom\\Atom\\Person\\Plugins'],
    exts: ['.vap'],
  },
  [AssetType.MorphPreset]: {
    paths: ['Custom\\Atom\\Person\\Morphs'],
    exts: ['.vap'],
  },
  [AssetType.AnimationPreset]: {
    paths: ['Custom\\Atom\\Person\\AnimationPresets'],
    exts: ['.vap'],
  },
  [AssetType.GeneralPreset]: {
    paths: ['Custom\\Atom\\Person\\General'],
    exts: ['.vap'],
  },
  [AssetType.PluginPreset]: {
    paths: ['Custom\\Atom\\Person\\Plugins'],
    exts: ['.vap'],
  },
  [AssetType.SkinPreset]: {
    paths: ['Custom\\Atom\\Person\\Skin'],
    exts: ['.vap'],
  },
}

export default AssetParserMap
