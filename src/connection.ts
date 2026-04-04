import type {Knex} from 'knex'
import type {
  CompiledQuery,
  DatabaseConnection,
  QueryResult,
  TransactionSettings,
} from 'kysely'
import type {ResultsParser} from './cold-dialect/results-parser.js'

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
    await this.#transaction!.executionPromise
    this.#transaction = undefined
  }

  async executeQuery<R>(
    compiledQuery: CompiledQuery<unknown>,
  ): Promise<QueryResult<R>> {
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
      .map((row) => this.#resultParser.parseResults([row]), {
        concurrency: chunkSize,
      })
      .iterator()
  }

  #getRawQueryForConnection(compiledQuery: CompiledQuery<unknown>): Knex.Raw {
    return this.#knex
      .raw(compiledQuery.sql, compiledQuery.parameters)
      .connection(this.#connection)
  }
}
