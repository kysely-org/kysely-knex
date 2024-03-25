import type {QueryResult} from 'kysely'

export interface ResultsParser<R = unknown> {
  parseResults(results: R): QueryResult<any>
}
