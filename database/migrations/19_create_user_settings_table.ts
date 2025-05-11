import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_settings'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table
        .uuid('user_id')
        .notNullable()
        .unique()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .onUpdate('CASCADE')

      // Using enum type for theme and display_mode (MySQL specific)
      this.db.rawQuery(`
        ALTER TABLE user_settings
        ADD COLUMN theme ENUM('light', 'dark', 'system') DEFAULT 'light',
        ADD COLUMN notifications_enabled BOOLEAN DEFAULT TRUE,
        ADD COLUMN display_mode ENUM('grid', 'list') DEFAULT 'grid'
      `)

      table.timestamp('created_at').defaultTo(this.now())
      table.timestamp('updated_at').defaultTo(this.now())
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
