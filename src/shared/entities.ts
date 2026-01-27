import { t } from '../main/db/drizzle.ts'
import AssetType from './AssetType.ts'
import * as utils from './utils.ts'

export type Asset = typeof assets.$inferSelect
export type Creator = typeof creators.$inferSelect

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

export const creators = t.sqliteTable(
  'creators',
  {
    ...utils.keys,
    name: t.text('name').notNull(),
    tags: t.text('tags', { mode: 'json' }).$type<string[]>(),
  },
  (table) => [t.uniqueIndex('ux_name').on(table.name)],
)
