import { t } from '../main/db/drizzle.ts'
import * as utils from './utils.ts'

export enum AssetType {
  AddonPackage = 'addon_package',
  AnimationPreset = 'animation_preset',
  AppearancePreset = 'appearance_preset',
  AssetBundle = 'asset_bundle',
  BreastPreset = 'breast_preset',
  Clothing = 'clothing',
  ClothingPreset = 'clothing_preset',
  GeneralPreset = 'general_preset',
  GlutePreset = 'glute_preset',
  Hair = 'hair',
  HairPreset = 'hair_preset',
  Morph = 'morph',
  MorphPreset = 'morph_preset',
  PluginPreset = 'plugin_preset',
  PosePreset = 'pose_preset',
  Scene = 'scene',
  Script = 'script',
  ScriptPreset = 'script_preset',
  SkinPreset = 'skin_preset',
  Subscene = 'subscene',
  Texture = 'texture',
}

export const assets = t.sqliteTable(
  'assets',
  {
    ...utils.keys,
    importedAt: t
      .integer('imported_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    fileCreatedAt: t.integer('file_created_at', { mode: 'timestamp' }),
    fileUpdatedAt: t.integer('file_updated_at', { mode: 'timestamp' }),
    fileName: t.text('file_name').notNull(),
    fileSize: t.integer('file_size').notNull(),
    type: t.text('type').$type<AssetType>().notNull(),
    url: t.text('url').notNull(),
    creatorId: t.integer('creator_id').references(() => creators.id),
    tags: t.text('tags', { mode: 'json' }).$type<string[]>(),
    keywords: t.text('keywords', { mode: 'json' }).$type<string[]>(),
    isHidden: t
      .integer('is_hidden', { mode: 'boolean' })
      .notNull()
      .default(false),
    isFavorite: t
      .integer('is_favorite', { mode: 'boolean' })
      .notNull()
      .default(false),
  },
  (table) => [
    t.uniqueIndex('ux_url').on(table.url),
    t.index('ix_type').on(table.type),
  ],
)

export type Asset = typeof assets.$inferSelect

export const creators = t.sqliteTable(
  'creators',
  {
    ...utils.keys,
    name: t.text('name').notNull(),
    tags: t.text('tags', { mode: 'json' }).$type<string[]>(),
  },
  (table) => [t.uniqueIndex('ux_name').on(table.name)],
)
