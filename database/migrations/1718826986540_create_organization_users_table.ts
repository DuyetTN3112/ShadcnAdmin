import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'organization_users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table
        .integer('organization_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('organizations')
        .onDelete('CASCADE')
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.integer('role_id').unsigned().notNullable().defaultTo(3)

      table.timestamp('created_at').notNullable().defaultTo(this.now())
      table.timestamp('updated_at').notNullable().defaultTo(this.now())

      // Primary key
      table.primary(['organization_id', 'user_id'])
    })

    // Tạo chỉ mục cho trường user_id
    this.db.rawQuery('CREATE INDEX idx_organization_users_user ON organization_users(user_id)')
    // Thêm foreign key cho role_id
    this.db.rawQuery(`
      ALTER TABLE organization_users
      ADD CONSTRAINT fk_organization_users_role 
      FOREIGN KEY (role_id) REFERENCES user_roles(id)
    `)
  }

  async down() {
    // Xóa foreign key constraint trước
    this.db.rawQuery('ALTER TABLE organization_users DROP FOREIGN KEY fk_organization_users_role')
    this.schema.dropTable(this.tableName)
  }
}
