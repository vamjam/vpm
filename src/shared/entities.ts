import * as t from 'drizzle-orm/sqlite-core'
import { customAlphabet } from 'nanoid'
import AssetType from './AssetType.ts'

export type Asset = typeof assets.$inferSelect

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 10)

export const assets = t.sqliteTable(
  'assets',
  {
    id: t
      .text('id')
      .primaryKey()
      .$defaultFn(() => nanoid()),
    vamid: t.text('vamid'),
    importedAt: t
      .integer('imported_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    createdAt: t.integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: t.integer('updated_at', { mode: 'timestamp' }),
    name: t.text('name').notNull(),
    path: t.text('path').notNull(),
    size: t.integer('size').notNull(),
    type: t.text('type').$type<AssetType>().notNull(),
    isHidden: t
      .integer('is_hidden', { mode: 'boolean' })
      .notNull()
      .default(false),
    isFavorite: t
      .integer('is_favorite', { mode: 'boolean' })
      .notNull()
      .default(false),
    dependencies: t.text('dependencies', { mode: 'json' }).$type<string[]>(),
    creator: t.text('creator'),
  },
  (table) => [
    t.uniqueIndex('ux_path').on(table.path),
    t.index('ix_type').on(table.type),
    t.index('ix_name').on(table.name),
    t.index('ix_created_at').on(table.createdAt),
    t.index('ix_creator').on(table.creator),
  ],
)
