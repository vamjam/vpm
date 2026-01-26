import * as sqlite from 'drizzle-orm/sqlite-core'

export { sqlite as t }
export const { sqliteTable: table, foreignKey, primaryKey } = sqlite
