import type {Knex} from 'knex'
import type {CompiledQuery, DatabaseConnection, QueryResult, TransactionSettings} from 'kysely'
import {KnexWriteResult} from './types'

export class KyselyKnexConnection implements DatabaseConnection {
  #connection: unknown
  readonly #knex: Knex
  #transaction: Knex.Transaction | undefined

  constructor(knex: Knex, connection: unknown) {
    this.#connection = connection
    this.#knex = knex
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
    const results = await this.#knex.raw(compiledQuery.sql, compiledQuery.parameters).connection(this.#connection)

    console.log('results', results)

    if (Array.isArray(results)) {
      return {
        rows: results,
      }
    }

    return {
      insertId: BigInt((results as KnexWriteResult).lastInsertRowid),
      numAffectedRows: BigInt((results as KnexWriteResult).changes),
      rows: [],
    }
  }

  release(): void {
    ;(this.#knex.client as Knex.Client).releaseConnection(this.#connection)
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
    return this.#knex
      .raw(compiledQuery.sql, compiledQuery.parameters)
      .stream({
        // TODO: chunk size???
      })
      .map((data) => {
        console.log('data', data)

        throw new Error('Method not implemented.')
      })
      .iterator()
  }
}
