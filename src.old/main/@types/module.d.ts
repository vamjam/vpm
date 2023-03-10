declare module 'unique-slug' {
  export default function slug(str?: string): string
}

declare module '*.sql?raw' {
  const sql: string
  export default sql
}
