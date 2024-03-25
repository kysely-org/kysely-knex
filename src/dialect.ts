import type {DatabaseIntrospector, Dialect, DialectAdapter, Driver, Kysely, QueryCompiler} from 'kysely'
import type {KyselyKnexDialectConfig} from './config.js'
import {KyselyKnexDriver} from './driver.js'

export class KyselyKnexDialect implements Dialect {
  readonly #config: KyselyKnexDialectConfig

  constructor(config: KyselyKnexDialectConfig) {
    this.#config = config
  }

  createAdapter(): DialectAdapter {
    return this.#config.kyselySubDialect.createAdapter()
  }

  createDriver(): Driver {
    return new KyselyKnexDriver(this.#config)
  }

  createIntrospector(db: Kysely<any>): DatabaseIntrospector {
    return this.#config.kyselySubDialect.createIntrospector(db)
  }

  createQueryCompiler(): QueryCompiler {
    return this.#config.kyselySubDialect.createQueryCompiler()
  }
}
