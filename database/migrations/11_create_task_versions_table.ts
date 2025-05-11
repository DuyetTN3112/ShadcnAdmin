import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'task_versions'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.bigIncrements('version_id').primary()
      table
        .string('task_id', 20)
        .notNullable()
        .references('id')
        .inTable('tasks')
        .onDelete('CASCADE')
      table.string('title', 255).notNullable()
      table.text('description').nullable()
      table.integer('status_id').unsigned().notNullable().references('id').inTable('task_status')
      table.integer('label_id').unsigned().notNullable().references('id').inTable('task_labels')
      table
        .integer('priority_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('task_priorities')
      table.uuid('assigned_to').nullable().references('id').inTable('users').onDelete('SET NULL')
      table.uuid('changed_by').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.timestamp('changed_at').defaultTo(this.now())
    })
    // Create trigger for versioning tasks
    this.db.rawQuery(`
      CREATE TRIGGER task_version_trigger
      BEFORE UPDATE ON tasks
      FOR EACH ROW
      BEGIN
          INSERT INTO task_versions (
              task_id, title, description, status_id, 
              label_id, priority_id, assigned_to, changed_by
          ) VALUES (
              OLD.id, OLD.title, OLD.description, OLD.status_id,
              OLD.label_id, OLD.priority_id, OLD.assigned_to, OLD.creator_id
          );
      END
    `)
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
