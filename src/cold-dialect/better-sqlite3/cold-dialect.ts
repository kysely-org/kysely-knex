import {
  SqliteAdapter,
  SqliteIntrospector,
  SqliteQueryCompiler,
  type DatabaseIntrospector,
  type DialectAdapter,
  type Kysely,
  type QueryCompiler,
} from 'kysely'
import type {ColdDialect} from '../cold-dialect.js'
import type {ResultsParser} from '../results-parser.js'
import {BetterSQLite3ResultsParser} from './results-parser.js'

export class BetterSQLite3ColdDialect implements ColdDialect {
  createAdapter(): DialectAdapter {
    return new SqliteAdapter()
  }

  createIntrospector(db: Kysely<any>): DatabaseIntrospector {
    return new SqliteIntrospector(db)
  }

  createQueryCompiler(): QueryCompiler {
    return new SqliteQueryCompiler()
  }

  createResultsParser(): ResultsParser {
    return new BetterSQLite3ResultsParser()
  }
}
