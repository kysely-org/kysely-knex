import type {PostgresQueryResult, QueryResult} from 'kysely'
import type {ResultsParser} from '../results-parser'

export class PGResultParser implements ResultsParser<PostgresQueryResult<any>> {
  parseResults(results: PostgresQueryResult<any>): QueryResult<any> {
    const {command} = results

    const rows = results.rows ?? []

    if (
      command === 'INSERT' ||
      command === 'UPDATE' ||
      command === 'DELETE' ||
      command === 'MERGE'
    ) {
      return {
        rows,
        numAffectedRows: BigInt(results.rowCount),
      }
    }

    return {rows}
  }
}
