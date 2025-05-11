import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'conversation_participants'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .uuid('conversation_id')
        .notNullable()
        .references('id')
        .inTable('conversations')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
      table
        .uuid('user_id')
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')

      table.timestamp('created_at').defaultTo(this.now())
    })

    // Add a unique constraint to prevent duplicate participants
    this.db.rawQuery(
      'ALTER TABLE conversation_participants ADD CONSTRAINT unique_participant UNIQUE (conversation_id, user_id)'
    )
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
