import type {QueryResult} from 'kysely'
import type {ResultsParser} from '../results-parser.js'

export class MSSQLResultsParser implements ResultsParser<any> {
  parseResults(results: any): QueryResult<any> {
    return {rows: results}
  }
}
