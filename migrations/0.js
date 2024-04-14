/**
 * @param {import('knex').Knex} knex
 */
exports.up = async (knex) => {
  if (!(await knex.schema.hasTable('dog_walker'))) {
    await knex.schema.createTable('dog_walker', (table) => {
      table.increments('id').primary()
      table.string('name').notNullable()
      table.string('phone')
    })
  }
}

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async (knex) => {
  if (await knex.schema.hasTable('dog_walker')) {
    await knex.schema.dropTable('dog_walker')
  }
}
