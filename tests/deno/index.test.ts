import knex from 'knex'
import {Kysely} from 'kysely'
import {KyselyKnexDialect} from '../../dist/index.mjs'
import {CONFIGS} from './test-setup.ts'

// This is a minimal Deno test. The exact dialect is not important.
const dialect = 'pg'
const config = CONFIGS[dialect]

const kneks = knex(config.knexConfig)

const kysely = new Kysely({
  dialect: new KyselyKnexDialect({
    knex: kneks,
    kyselySubDialect: config.kyselySubDialect,
  }),
})

if (!(kysely instanceof Kysely)) {
  console.error('deno test failed')
  Deno.exit(1)
}

console.error('local deno test passed')
