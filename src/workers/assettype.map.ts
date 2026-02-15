import AssetType from '@shared/AssetType.ts'

export type AssetMeta = {
  paths: string[]
  exts: string[]
  displayName: string
}

export const presetTypes = [
  AssetType.AnimationPreset,
  AssetType.AppearancePreset,
  AssetType.ClothingPreset,
  AssetType.GeneralPreset,
  AssetType.GlutePreset,
  AssetType.HairPreset,
  AssetType.MorphPreset,
  AssetType.PosePreset,
  AssetType.ScriptPreset,
  AssetType.SkinPreset,
]

const map: Record<Exclude<AssetType, AssetType.Texture>, AssetMeta> = {
  [AssetType.AddonPackage]: {
    paths: ['AddonPackages'],
    exts: ['.var'],
    displayName: 'Addon Package',
  },
  [AssetType.AppearancePreset]: {
    paths: ['Custom/Atom/Person/Appearance'],
    exts: ['.vap'],
    displayName: 'Appearance Preset',
  },
  [AssetType.AssetBundle]: {
    paths: ['Custom/Assets'],
    exts: ['.assetbundle'],
    displayName: 'Asset Bundle',
  },
  [AssetType.BreastPreset]: {
    paths: ['Custom/Atom/Person/BreastPhysics'],
    exts: ['.vap'],
    displayName: 'Breast Preset',
  },
  [AssetType.Clothing]: {
    paths: ['Custom/Clothing'],
    exts: ['.vam'],
    displayName: 'Clothing',
  },
  [AssetType.ClothingPreset]: {
    paths: ['Custom/Clothing', 'Custom/Atom/Person/Clothing'],
    exts: ['.vap'],
    displayName: 'Clothing Preset',
  },
  [AssetType.GlutePreset]: {
    paths: ['Custom/Atom/Person/GlutePhysics'],
    exts: ['.vap'],
    displayName: 'Glute Preset',
  },
  [AssetType.Hair]: {
    paths: ['Custom/Hair'],
    exts: ['.vam'],
    displayName: 'Hair',
  },
  [AssetType.HairPreset]: {
    paths: ['Custom/Hair', 'Custom/Atom/Person/Hair'],
    exts: ['.vap'],
    displayName: 'Hair Preset',
  },
  [AssetType.Morph]: {
    paths: ['Custom/Atom/Person/Morphs'],
    exts: ['.vmi'],
    displayName: 'Morph',
  },
  [AssetType.PosePreset]: {
    paths: ['Custom/Atom/Person/Pose'],
    exts: ['.vap'],
    displayName: 'Pose Preset',
  },
  [AssetType.Subscene]: {
    paths: ['Custom/SubScene'],
    exts: ['.json'],
    displayName: 'Subscene',
  },
  [AssetType.Scene]: {
    paths: ['Saves/scene'],
    exts: ['.json'],
    displayName: 'Scene',
  },
  [AssetType.Script]: {
    paths: ['Custom/Scripts'],
    exts: ['.cslist', '.cs'],
    displayName: 'Script',
  },
  [AssetType.ScriptPreset]: {
    paths: ['Custom/Atom/Person/Plugins'],
    exts: ['.vap'],
    displayName: 'Script Preset',
  },
  [AssetType.MorphPreset]: {
    paths: ['Custom/Atom/Person/Morphs'],
    exts: ['.vap'],
    displayName: 'Morph Preset',
  },
  [AssetType.AnimationPreset]: {
    paths: ['Custom/Atom/Person/AnimationPresets'],
    exts: ['.vap'],
    displayName: 'Animation Preset',
  },
  [AssetType.GeneralPreset]: {
    paths: ['Custom/Atom/Person/General'],
    exts: ['.vap'],
    displayName: 'General Preset',
  },
  [AssetType.PluginPreset]: {
    paths: ['Custom/Atom/Person/Plugins'],
    exts: ['.vap'],
    displayName: 'Plugin Preset',
  },
  [AssetType.SkinPreset]: {
    paths: ['Custom/Atom/Person/Skin'],
    exts: ['.vap'],
    displayName: 'Skin Preset',
  },
} as const

export default map
