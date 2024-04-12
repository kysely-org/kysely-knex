import type {QueryResult} from 'kysely'
import type {ResultsParser} from '../results-parser.js'

export class BetterSQLite3ResultsParser implements ResultsParser<any> {
  parseResults(results: any): QueryResult<any> {
    if (Array.isArray(results)) {
      return {rows: results}
    }

    const parsedResults: Partial<Record<keyof QueryResult<any>, any>> = {
      rows: [],
    }

    const {changes, lastInsertRowid} = results

    if (changes !== undefined) {
      parsedResults.numAffectedRows = BigInt(changes)
    }

    if (lastInsertRowid !== undefined) {
      parsedResults.insertId = BigInt(lastInsertRowid)
    }

    return parsedResults as QueryResult<any>
  }
}
