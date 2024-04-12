import type {Knex} from 'knex'

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable('dog_walker'))) {
    await knex.schema.createTable('dog_walker', (table) => {
      table.increments('id').primary()
      table.string('name').notNullable()
      table.string('phone')
    })
  }
}

export async function down(knex: Knex): Promise<void> {
  if (await knex.schema.hasTable('dog_walker')) {
    await knex.schema.dropTable('dog_walker')
  }
}
