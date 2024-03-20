import {Knex} from 'knex'
import type {DatabaseConnection, Driver, TransactionSettings} from 'kysely'
import type {KyselyKnexDialectConfig} from './config.js'
import {KyselyKnexConnection} from './connection.js'

export class KyselyKnexDriver implements Driver {
  readonly #config: KyselyKnexDialectConfig

  constructor(config: KyselyKnexDialectConfig) {
    this.#config = config
  }

  async acquireConnection(): Promise<DatabaseConnection> {
    const connection = await (this.#config.knex.client as Knex.Client).acquireConnection()

    return new KyselyKnexConnection(this.#config.knex, connection)
  }

  async beginTransaction(connection: KyselyKnexConnection, settings: TransactionSettings): Promise<void> {
    await connection.beginTransaction(settings)
  }

  async commitTransaction(connection: KyselyKnexConnection): Promise<void> {
    await connection.commitTransaction()
  }

  async destroy(): Promise<void> {
    await this.#config.knex.destroy()
  }

  async init(): Promise<void> {
    // noop
  }

  async releaseConnection(connection: KyselyKnexConnection): Promise<void> {
    connection.release()
  }

  async rollbackTransaction(connection: KyselyKnexConnection): Promise<void> {
    await connection.rollbackTransaction()
  }
}
