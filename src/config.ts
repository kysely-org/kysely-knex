import type {Knex} from 'knex'
import type {Dialect} from 'kysely'

export interface KyselyKnexDialectConfig {
  knex: Knex
  kyselySubDialect: KyselySubDialect
}

export type KyselySubDialect = Omit<Dialect, 'createDriver'>
