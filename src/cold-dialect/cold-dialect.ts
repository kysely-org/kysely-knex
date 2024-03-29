import type {Dialect} from 'kysely'
import type {ResultsParser} from './results-parser.js'

export interface ColdDialect extends Omit<Dialect, 'createDriver'> {
  createResultsParser(): ResultsParser
}
