import { t } from '@main/db/drizzle.ts'
import * as utils from './utils.ts'

export const scenes = t.sqliteTable(
  'scenes',
  {
    ...utils.keys,
    name: t.text('name').notNull(),
    tags: t.text('tags', { mode: 'json' }).$type<string[]>(),
    keywords: t.text('keywords', { mode: 'json' }).$type<string[]>(),
  },
  (table) => [t.uniqueIndex('ux_name').on(table.name)],
)

export const addonPackages = t.sqliteTable(
  'addon_packages',
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
    type: t.text('type').notNull(),
    url: t.text('url').notNull(),
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
  (table) => [t.uniqueIndex('ux_url').on(table.url)],
)

export enum PresetType {
  Animation = 'animation',
  Appearance = 'appearance',
  Breast = 'breast',
  Clothing = 'clothing',
  General = 'general',
  Glute = 'glute',
  Hair = 'hair',
  Morph = 'morph',
  Plugin = 'plugin',
  Pose = 'pose',
  Script = 'script',
  Skin = 'skin',
}

export enum AssetType {
  AddonPackage = 'addon_package',
  AssetBundle = 'asset_bundle',
  Clothing = 'clothing',
  Hair = 'hair',
  Morph = 'morph',
  Scene = 'scene',
  Script = 'script',
  Subscene = 'subscene',
  Texture = 'texture',
}

export const presets = t.sqliteTable(
  'presets',
  {
    ...utils.keys,
    name: t.text('name').notNull(),
    type: t.text('type').$type<PresetType>().notNull(),
    url: t.text('url').notNull(),
    tags: t.text('tags', { mode: 'json' }).$type<string[]>(),
  },
  (table) => [t.uniqueIndex('ux_name').on(table.name)],
)

export const creators = t.sqliteTable(
  'creators',
  {
    ...utils.keys,
    name: t.text('name').notNull(),
    tags: t.text('tags', { mode: 'json' }).$type<string[]>(),
  },
  (table) => [t.uniqueIndex('ux_name').on(table.name)],
)
