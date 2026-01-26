import * as entity from './entities.ts'

export type Scene = typeof entity.scenes.$inferSelect

export type AddonPackage = typeof entity.addonPackages.$inferSelect

export type Preset = typeof entity.presets.$inferSelect

export type Creator = typeof entity.creators.$inferSelect

export { PresetType, AssetType } from './entities.ts'
