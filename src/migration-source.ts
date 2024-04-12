import type {Knex} from 'knex'
// @ts-ignore
import {FsMigrations} from 'knex/lib/migrations/migrate/sources/fs-migrations.js'
import {Kysely} from 'kysely'
import {BetterSQLite3ColdDialect} from './cold-dialect/better-sqlite3/cold-dialect.js'
import type {ColdDialect} from './cold-dialect/cold-dialect.js'
import {MSSQLColdDialect} from './cold-dialect/mssql/cold-dialect.js'
import {MySQL2ColdDialect} from './cold-dialect/mysql2/cold-dialect.js'
import {PGColdDialect} from './cold-dialect/pg/cold-dialect.js'
import {KyselyKnexDialect} from './dialect.js'

export interface KyselyFsMigrationSourceProps {
  kyselySubDialect?: ColdDialect
  loadExtensions?: string[]
  migrationDirectories: string | string[]
  sortDirsSeparately?: boolean
}

/**
 * A custom Knex migration source that allows running migrations with Kysely,
 * while still using Knex's migration system.
 *
 * @see {@link https://knexjs.org/#Migrations-API}
 */
export class KyselyFsMigrationSource extends FsMigrations {
  readonly #props: KyselyFsMigrationSourceProps

  constructor(props: KyselyFsMigrationSourceProps) {
    super(
      props.migrationDirectories,
      props.sortDirsSeparately,
      props.loadExtensions,
    )
    this.#props = props
  }

  async getMigration(migrationInfo: any) {
    const file = await super.getMigration(migrationInfo)

    return {
      ...file,
      up: this.#getMigrationWithKysely(file, 'up'),
      down: this.#getMigrationWithKysely(file, 'down'),
    }
  }

  #getMigrationWithKysely(file: any, direction: 'up' | 'down') {
    return async (knex: Knex) => {
      await file[direction](knex, this.#resolveKysely(knex))
    }
  }

  #resolveKysely(knex: Knex) {
    return new Kysely({
      dialect: new KyselyKnexDialect({
        knex,
        kyselySubDialect:
          this.#props.kyselySubDialect || this.#resolveKyselySubDialect(knex),
      }),
    })
  }

  #resolveKyselySubDialect(knex: Knex): ColdDialect {
    const knexDialect = knex.client.config.client as string

    const subDialectConstructor = {
      'better-sqlite3': BetterSQLite3ColdDialect,
      mssql: MSSQLColdDialect,
      mysql: MySQL2ColdDialect,
      pg: PGColdDialect,
      postgres: PGColdDialect,
      sqlite3: BetterSQLite3ColdDialect,
    }[knexDialect]

    if (!subDialectConstructor) {
      throw new Error(
        `Could not resolve Kysely cold dialect for "${knexDialect}", please provide one manually.`,
      )
    }

    return new subDialectConstructor()
  }
}
