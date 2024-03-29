import type {MysqlOkPacket, MysqlQueryResult, QueryResult} from 'kysely'
import {isObject} from '../../util.js'
import type {ResultsParser} from '../results-parser.js'

export class MySQL2ResultsParser
  implements ResultsParser<[MysqlQueryResult, any]>
{
  parseResults(
    results: [MysqlQueryResult] | MysqlQueryResult | Record<string, unknown>,
  ): QueryResult<any> {
    if (Array.isArray(results)) {
      results = results[0]
    }

    if (this.#isOKPacket(results)) {
      return {
        rows: [],
        insertId: BigInt(results.insertId),
        numAffectedRows: BigInt(results.affectedRows),
        numChangedRows: BigInt(results.changedRows),
      }
    }

    return {rows: Array.isArray(results) ? results : [results]}
  }

  #isOKPacket(results: unknown): results is MysqlOkPacket {
    return (
      isObject(results) &&
      'affectedRows' in results &&
      'changedRows' in results &&
      'insertId' in results
    )
  }
}
