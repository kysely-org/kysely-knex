import type {MysqlQueryResult, QueryResult} from 'kysely'
import type {ResultsParser} from '../results-parser'

export class MySQL2ResultsParser
  implements ResultsParser<[MysqlQueryResult, any]>
{
  parseResults(results: [MysqlQueryResult, any]): QueryResult<any> {
    const [rezults] = results

    if (Array.isArray(rezults)) {
      return {rows: rezults}
    }

    return {
      rows: [],
      insertId: BigInt(rezults.insertId),
      numAffectedRows: BigInt(rezults.affectedRows),
      numChangedRows: BigInt(rezults.changedRows),
    }
  }
}
