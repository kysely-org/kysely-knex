import type {Knex} from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('dog_walker', (tb) => {
    tb.boolean('is_active').defaultTo(true)
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('dog_walker', (tb) => {
    tb.dropColumn('is_active')
  })
}
