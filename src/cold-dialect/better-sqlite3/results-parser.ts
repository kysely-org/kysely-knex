import type {QueryResult} from 'kysely'
import type {ResultsParser} from '../results-parser.js'

export class BetterSQLite3ResultsParser implements ResultsParser<any> {
  parseResults(results: any): QueryResult<any> {
    if (Array.isArray(results)) {
      return {
        rows: results,
      }
    }

    return {
      insertId: BigInt(results.lastInsertRowid),
      numAffectedRows: BigInt(results.changes),
      rows: [],
    }
  }
}
