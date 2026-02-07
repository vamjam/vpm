import * as t from 'drizzle-orm/sqlite-core'
import AssetType from './AssetType.ts'

export type Asset = typeof assets.$inferSelect
export type Creator = typeof creators.$inferSelect

const key = {
  id: t
    .text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
}

export const assets = t.sqliteTable(
  'assets',
  {
    ...key,
    type: t.text('type').$type<AssetType>().notNull(),
    creatorId: t.text('creator_id').references(() => creators.id),
    name: t.text('name').notNull(),
    description: t.text('description'),
    licenseType: t.text('license_type'),
    path: t.text('path').notNull(),
    size: t.integer('size').notNull(),
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
    t.index('ix_path').on(table.path),
    t.index('ix_type').on(table.type),
  ],
)

export const dependencies = t.sqliteTable('dependencies', {
  assetId: t
    .text('asset_id')
    .notNull()
    .references(() => assets.id),
  dependencyURL: t.text('dependency_url').notNull(),
  // creatorId: t
  //   .text('creator_id')
  //   .notNull()
  //   .references(() => creators.id),
  // packageName: t.text('package_name').notNull(),
  // packageVersion: t.text('package_version').notNull(),
  // dependencyPath: t.text('dependency_path').notNull(),
})

export const creators = t.sqliteTable(
  'creators',
  {
    ...key,
    name: t.text('name').notNull(),
    tags: t.text('tags', { mode: 'json' }).$type<string[]>(),
  },
  (table) => [t.uniqueIndex('ux_name').on(table.name)],
)
