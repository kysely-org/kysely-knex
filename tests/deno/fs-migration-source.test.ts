import {KyselyFsMigrationSource} from '../../dist/migrations.mjs'
import {CONFIGS} from './test-setup.ts'

// This is a minimal Deno test. The exact dialect is not important.
const dialect = 'pg'
const config = CONFIGS[dialect]

const migrationSource = new KyselyFsMigrationSource({
  kyselySubDialect: config.kyselySubDialect,
  migrationDirectories: import.meta.dirname,
})

if (!(migrationSource instanceof KyselyFsMigrationSource)) {
  console.error('deno test failed')
  Deno.exit(1)
}

console.error('local deno test passed')
