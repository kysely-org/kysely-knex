import type {DatabaseConnection, Driver, TransactionSettings} from 'kysely'
import type {KyselyKnexDialectConfig} from './config.js'

export class KyselyKnexDriver implements Driver {
  #config: KyselyKnexDialectConfig

  constructor(config: KyselyKnexDialectConfig) {
    this.#config = config
  }

  acquireConnection(): Promise<DatabaseConnection> {
    throw new Error('Method not implemented.')
  }

  beginTransaction(connection: DatabaseConnection, settings: TransactionSettings): Promise<void> {
    throw new Error('Method not implemented.')
  }

  commitTransaction(connection: DatabaseConnection): Promise<void> {
    throw new Error('Method not implemented.')
  }

  destroy(): Promise<void> {
    throw new Error('Method not implemented.')
  }

  init(): Promise<void> {
    throw new Error('Method not implemented.')
  }

  releaseConnection(connection: DatabaseConnection): Promise<void> {
    throw new Error('Method not implemented.')
  }

  rollbackTransaction(connection: DatabaseConnection): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
