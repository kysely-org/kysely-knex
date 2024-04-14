import type {PostgresQueryResult, QueryResult} from 'kysely'
import type {ResultsParser} from '../results-parser.js'

export class PGResultParser implements ResultsParser<PostgresQueryResult<any>> {
  parseResults(
    results: PostgresQueryResult<any> | Record<string, unknown>[],
  ): QueryResult<any> {
    if (Array.isArray(results)) {
      return {rows: results}
    }

    const {command} = results

    const rows = results.rows ?? []

    if (
      command === 'INSERT' ||
      command === 'UPDATE' ||
      command === 'DELETE' ||
      command === 'MERGE'
    ) {
      return {
        numAffectedRows: BigInt(results.rowCount),
        rows,
      }
    }

    return {rows}
  }
}
