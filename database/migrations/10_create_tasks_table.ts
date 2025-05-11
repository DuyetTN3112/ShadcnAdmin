import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tasks'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id', 20).primary()
      table.string('title', 255).notNullable()
      table.text('description').notNullable()
      table
        .integer('status_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('task_status')
        .onUpdate('CASCADE')
      table
        .integer('label_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('task_labels')
        .onUpdate('CASCADE')
      table
        .integer('priority_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('task_priorities')
        .onUpdate('CASCADE')
      table
        .uuid('assigned_to')
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
        .onUpdate('CASCADE')
      table
        .uuid('creator_id')
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
      table.dateTime('due_date').notNullable()

      table.timestamp('deleted_at', { useTz: true }).nullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
    })

    // Creating indexes for optimized queries
    this.db.rawQuery('CREATE INDEX idx_tasks_status ON tasks(status_id)')
    this.db.rawQuery('CREATE INDEX idx_tasks_priority ON tasks(priority_id)')
    this.db.rawQuery('CREATE INDEX idx_tasks_label ON tasks(label_id)')
    this.db.rawQuery('CREATE INDEX idx_tasks_deleted_at ON tasks(deleted_at)')
    this.db.rawQuery('CREATE INDEX idx_tasks_assigned_status ON tasks(assigned_to, status_id)')

    // Create trigger to auto-generate task ID
    this.db.rawQuery(`
      CREATE TRIGGER before_task_insert
      BEFORE INSERT ON tasks
      FOR EACH ROW
      BEGIN
          IF NEW.id IS NULL OR NEW.id = '' THEN
              SET NEW.id = CONCAT('TASK-', LPAD(FLOOR(RAND() * 10000), 4, '0'));
          END IF;
      END
    `)
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
