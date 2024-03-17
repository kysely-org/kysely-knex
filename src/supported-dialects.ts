export const SUPPORTED_DIALECTS = ['better-sqlite3', 'mssql', 'mysql', 'pg', 'sqlite3'] as const

export type SupportedDialect = (typeof SUPPORTED_DIALECTS)[number]

function isDialectSupported(dialect: string): dialect is SupportedDialect {
  return SUPPORTED_DIALECTS.includes(dialect as any)
}

export function assertSupportedDialect(dialect: string) {
  if (!isDialectSupported(dialect)) {
    throw new Error(`Unsupported dialect: ${dialect}!`)
  }
}
