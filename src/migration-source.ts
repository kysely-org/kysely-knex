import type {Knex} from 'knex'
// @ts-ignore
import {FsMigrations} from 'knex/lib/migrations/migrate/sources/fs-migrations.js'
import type {Kysely} from 'kysely'

export interface KyselyFsMigrationSourceOptions {
  migrationDirectories: string | string[]
  sortDirsSeparately?: boolean
  loadExtensions?: string[]
  knex?: Knex
  kysely: Kysely<any>
}

export class KyselyFsMigrationSource extends FsMigrations {
  readonly #knex?: Knex
  readonly #kysely: Kysely<any>

  constructor(options: KyselyFsMigrationSourceOptions) {
    super(
      options.migrationDirectories,
      options.sortDirsSeparately,
      options.loadExtensions,
    )
    this.#knex = options.knex
    this.#kysely = options.kysely
  }

  async getMigration(migrationInfo: any) {
    const file = await super.getMigration(migrationInfo)

    return {
      ...file,
      up: async (knex: Knex.Client) => {
        await file.up(this.#knex || knex, this.#kysely)
      },
      down: async (knex: Knex.Client) => {
        await file.down(this.#knex || knex, this.#kysely)
      },
    }
  }
}
