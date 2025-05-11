import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'task_comments'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .string('task_id', 20)
        .notNullable()
        .references('id')
        .inTable('tasks')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
      table
        .uuid('user_id')
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
      table.text('comment').notNullable()
      table.timestamp('created_at').defaultTo(this.now())
      table.timestamp('updated_at').defaultTo(this.now())
    })
    // Creating indexes for optimized queries
    this.db.rawQuery('CREATE INDEX idx_task_comments_task ON task_comments(task_id)')
    this.db.rawQuery('CREATE INDEX idx_task_comments_user ON task_comments(user_id)')
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
