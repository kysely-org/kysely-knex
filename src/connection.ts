import type {Knex} from 'knex'
import type {CompiledQuery, DatabaseConnection, QueryResult, TransactionSettings} from 'kysely'
import {ResultsParser} from './cold-dialect/results-parser.js'

export class KyselyKnexConnection implements DatabaseConnection {
  #connection: unknown
  readonly #knex: Knex
  readonly #resultParser: ResultsParser
  #transaction: Knex.Transaction | undefined

  constructor(knex: Knex, connection: unknown, resultParser: ResultsParser) {
    this.#connection = connection
    this.#knex = knex
    this.#resultParser = resultParser
  }

  async beginTransaction(settings: TransactionSettings): Promise<void> {
    this.#transaction = await this.#knex.transaction({
      connection: this.#connection,
      doNotRejectOnRollback: true,
      isolationLevel: settings.isolationLevel,
    })
  }

  async commitTransaction(): Promise<void> {
    await this.#transaction!.commit()
    this.#transaction = undefined
  }

  async executeQuery<R>(compiledQuery: CompiledQuery<unknown>): Promise<QueryResult<R>> {
    const results = await this.#getRawQueryForConnection(compiledQuery)

    return this.#resultParser.parseResults(results)
  }

  async release(): Promise<void> {
    await (this.#knex.client as Knex.Client).releaseConnection(this.#connection)
    this.#connection = undefined
  }

  async rollbackTransaction(): Promise<void> {
    await this.#transaction!.rollback()
    this.#transaction = undefined
  }

  streamQuery<R>(
    compiledQuery: CompiledQuery<unknown>,
    chunkSize?: number | undefined,
  ): AsyncIterableIterator<QueryResult<R>> {
    return this.#getRawQueryForConnection(compiledQuery)
      .stream({highWaterMark: chunkSize})
      .map((results) => this.#resultParser.parseResults([results]))
      .iterator()
  }

  #getRawQueryForConnection(compiledQuery: CompiledQuery<unknown>): Knex.Raw {
    return this.#knex.raw(this.#getNormalizedSQL(compiledQuery), compiledQuery.parameters).connection(this.#connection)
  }

  #getNormalizedSQL(compiledQuery: CompiledQuery): string {
    const {sql} = compiledQuery

    return compiledQuery.parameters.length ? sql.replace(/(\W)([\$@]\d+)(\W|$)/g, '$1?$3') : sql
  }
}
