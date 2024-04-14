import type {Knex} from 'knex'
import type {Kysely} from 'kysely'

export async function up(_: Knex, kysely: Kysely<any>): Promise<void> {
  await kysely.schema
    .alterTable('dog_walker')
    .addColumn('email', 'varchar(512)')
    .execute()
}

export async function down(_: Knex, kysely: Kysely<any>): Promise<void> {
  await kysely.schema.alterTable('dog_walker').dropColumn('email').execute()
}
