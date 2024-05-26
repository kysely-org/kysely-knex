import type {Knex} from 'knex'
// @ts-ignore
import {FsMigrations} from 'knex/lib/migrations/migrate/sources/fs-migrations.js'
import {Kysely} from 'kysely'
import type {ColdDialect} from '../cold-dialect/cold-dialect.js'
import {KyselyKnexDialect} from '../dialect.js'

export interface KyselyFsMigrationSourceProps {
  kyselySubDialect: ColdDialect
  loadExtensions?: string[]
  migrationDirectories: string | string[]
  sortDirsSeparately?: boolean
}

/**
 * A custom Knex migration source that allows running migrations with Kysely,
 * while still using Knex's migration system.
 *
 * @see {@link https://knexjs.org/guide/migrations.html#custom-migration-sources | Custom migration sources}
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
      await file[direction](
        knex,
        new Kysely({
          dialect: new KyselyKnexDialect({
            knex,
            kyselySubDialect: this.#props.kyselySubDialect,
          }),
        }),
      )
    }
  }
}
