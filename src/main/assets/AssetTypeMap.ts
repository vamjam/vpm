import { AssetType } from '@shared/types'

export type AssetInfo = {
  // The relative path from the VaM root.
  path: string
  // The file's extension.
  ext: string
  // Whether the file has dependencies. Some assets will
  // have depencencies listed in another file. If that's the
  // case, then list its extension.
  dependencies?: boolean | string
}

const AssetTypeMap: Record<Exclude<AssetType, AssetType.Texture>, AssetInfo> = {
  [AssetType.AppearancePreset]: {
    path: 'Custom\\Atom\\Person\\Appearance',
    ext: '.vap',
    dependencies: true,
  },
  [AssetType.AssetBundle]: {
    path: 'Custom\\Assets',
    ext: '.assetbundle',
  },
  [AssetType.BreastPreset]: {
    path: 'Custom\\Atom\\Person\\BreastPhysics',
    ext: '.vap',
  },
  [AssetType.Clothing]: {
    path: 'Custom\\Clothing',
    ext: '.vam',
    dependencies: '.vaj',
  },
  [AssetType.ClothingPreset]: {
    path: 'Custom\\Atom\\Person\\Clothing',
    ext: '.vap',
    dependencies: true,
  },
  [AssetType.GlutePreset]: {
    path: 'Custom\\Atom\\Person\\GlutePhysics',
    ext: '.vap',
  },
  [AssetType.Hair]: {
    path: 'Custom\\Hair',
    ext: '.vam',
    dependencies: '.vaj',
  },
  [AssetType.HairPreset]: {
    path: 'Custom\\Atom\\Person\\Hair',
    ext: '.vap',
    dependencies: true,
  },
  [AssetType.Morph]: {
    path: 'Custom\\Atom\\Person\\Morphs',
    ext: '.vmi',
  },
  [AssetType.PosePreset]: {
    path: 'Custom\\Atom\\Person\\Pose',
    ext: '.vap',
  },
  [AssetType.Subscene]: {
    path: 'Custom\\SubScene',
    ext: '.json',
  },
  [AssetType.Scene]: {
    path: 'Saves\\scene',
    ext: '.json',
  },
  [AssetType.Script]: {
    path: 'Custom\\Scripts',
    ext: '.cs',
  },
  [AssetType.ScriptPreset]: {
    path: 'Custom\\Atom\\Person\\Plugins',
    ext: '.vap',
  },
  [AssetType.MorphPreset]: {
    path: 'Custom\\Atom\\Person\\Morphs',
    ext: '.vap',
  },
  [AssetType.AnimationPreset]: {
    path: 'Custom\\Atom\\Person\\AnimationPresets',
    ext: '.vap',
  },
  [AssetType.GeneralPreset]: {
    path: 'Custom\\Atom\\Person\\General',
    ext: '.vap',
  },
  [AssetType.PluginPreset]: {
    path: 'Custom\\Atom\\Person\\Plugins',
    ext: '.vap',
  },
  [AssetType.SkinPreset]: {
    path: 'Custom\\Atom\\Person\\Skin',
    ext: '.vap',
  },
}

export default AssetTypeMap
