import * as t from 'drizzle-orm/sqlite-core'
import { crypto } from '~/core/node.ts'

export const timestamps = {
  createdAt: t
    .integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: t.integer('updated_at', { mode: 'timestamp' }),
}

export const keys = {
  id: t
    .text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
}
