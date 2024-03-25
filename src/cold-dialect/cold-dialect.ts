import {type Dialect} from 'kysely'
import type {ResultsParser} from './results-parser.js'

export type ColdDialect = Omit<Dialect, 'createDriver'> & {
  createResultsParser(): ResultsParser
}
