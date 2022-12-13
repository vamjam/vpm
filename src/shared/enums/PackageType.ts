import { enumify } from './Enumify'

const Enumify = enumify()

export default class PackageType extends Enumify {
  static readonly UNKNOWN = new PackageType('Unknown', 0)
  static readonly ADDON_PACKAGE = new PackageType('Addon Package', 1)
  static readonly HUB_PACKAGE = new PackageType('Hub Package', 2)
  static readonly APPEARANCE = new PackageType('Appearance', 3)
  static readonly ASSET_BUNDLE = new PackageType('Asset Bundle', 4)
  static readonly CLOTHING = new PackageType('Clothing', 5)
  static readonly FAVORITE = new PackageType('Favorite', 6)
  static readonly HAIR = new PackageType('Hair', 7)
  static readonly LEGACY_SCENE = new PackageType('Legacy Scene', 8)
  static readonly MANIFEST = new PackageType('Manifest', 9)
  static readonly MORPH = new PackageType('Morph', 10)
  static readonly POSE = new PackageType('Pose', 11)
  static readonly PRESET = new PackageType('Preset', 12)
  static readonly SCENE = new PackageType('Scene', 13)
  static readonly SCRIPT = new PackageType('Script', 14)
}
