import type {Knex} from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTableIfNotExists('dog_walker', (table) => {
    table.increments('id').primary()
    table.string('name').notNullable()
    table.string('phone')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('dog_walker')
}
