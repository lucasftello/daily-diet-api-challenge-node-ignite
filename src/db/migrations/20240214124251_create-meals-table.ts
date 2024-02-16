import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('meals', (table) => {
    table.uuid('id').primary()
    table.uuid('user_id').notNullable().index()
    table.string('name').notNullable()
    table.string('description').notNullable()
    table.date('date').defaultTo(knex.fn.now()).notNullable()
    table.time('time').defaultTo(knex.fn.now()).notNullable()
    table.enum('diet', ['in', 'out']).notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
    table.timestamp('updated_at')

    table.foreign('user_id').references('users.id').onDelete('CASCADE')
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('meals')
}
