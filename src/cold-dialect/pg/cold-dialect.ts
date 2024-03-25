import {
  PostgresAdapter,
  PostgresIntrospector,
  PostgresQueryCompiler,
  type DatabaseIntrospector,
  type DialectAdapter,
  type Kysely,
  type QueryCompiler,
} from 'kysely'
import type {ColdDialect} from '../cold-dialect.js'
import type {ResultsParser} from '../results-parser.js'
import {PGResultParser} from './results-parser.js'

export class PGColdDialect implements ColdDialect {
  createAdapter(): DialectAdapter {
    return new PostgresAdapter()
  }

  createIntrospector(db: Kysely<any>): DatabaseIntrospector {
    return new PostgresIntrospector(db)
  }

  createQueryCompiler(): QueryCompiler {
    return new PostgresQueryCompiler()
  }

  createResultsParser(): ResultsParser {
    return new PGResultParser()
  }
}
