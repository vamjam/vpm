import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  out: './drizzle',
  schema: './src/shared/entities.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url: 'file:./dev.db',
  },
})
