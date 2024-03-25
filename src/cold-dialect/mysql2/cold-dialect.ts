import {
  MysqlAdapter,
  MysqlIntrospector,
  MysqlQueryCompiler,
  type DatabaseIntrospector,
  type DialectAdapter,
  type Kysely,
  type QueryCompiler,
} from 'kysely'
import type {ColdDialect} from '../cold-dialect.js'
import type {ResultsParser} from '../results-parser.js'
import {MySQL2ResultsParser} from './results-parser.js'

export class MySQL2ColdDialect implements ColdDialect {
  createAdapter(): DialectAdapter {
    return new MysqlAdapter()
  }

  createIntrospector(db: Kysely<any>): DatabaseIntrospector {
    return new MysqlIntrospector(db)
  }

  createQueryCompiler(): QueryCompiler {
    return new MysqlQueryCompiler()
  }

  createResultsParser(): ResultsParser {
    return new MySQL2ResultsParser()
  }
}
