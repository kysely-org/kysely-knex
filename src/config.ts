import type {Knex} from 'knex'
import type {ColdDialect} from './cold-dialect/cold-dialect.js'

export interface KyselyKnexDialectConfig {
  knex: Knex
  kyselySubDialect: ColdDialect
}
