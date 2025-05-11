import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'messages'

  public async up() {
    // Create the base table first
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id')
      table.uuid('conversation_id').notNullable() // No foreign key due to partitioning
      table.uuid('sender_id').notNullable() // No foreign key due to partitioning
      table.text('message').notNullable()
      table.timestamp('read_at', { useTz: true }).nullable()
      table.timestamp('timestamp', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('created_at').defaultTo(this.now())

      // No foreign keys due to partitioning limitations
    })

    // Create partitioning using raw SQL (MySQL specific)
    this.db.rawQuery(`
      ALTER TABLE messages
      PARTITION BY RANGE (UNIX_TIMESTAMP(timestamp)) (
        PARTITION p202401 VALUES LESS THAN (UNIX_TIMESTAMP('2024-02-01 00:00:00')),
        PARTITION p202402 VALUES LESS THAN (UNIX_TIMESTAMP('2024-03-01 00:00:00')),
        PARTITION p202403 VALUES LESS THAN (UNIX_TIMESTAMP('2024-04-01 00:00:00')),
        PARTITION p202404 VALUES LESS THAN (UNIX_TIMESTAMP('2024-05-01 00:00:00')),
        PARTITION p202405 VALUES LESS THAN (UNIX_TIMESTAMP('2024-06-01 00:00:00')),
        PARTITION p202406 VALUES LESS THAN (UNIX_TIMESTAMP('2024-07-01 00:00:00')),
        PARTITION p202407 VALUES LESS THAN (UNIX_TIMESTAMP('2024-08-01 00:00:00')),
        PARTITION p202408 VALUES LESS THAN (UNIX_TIMESTAMP('2024-09-01 00:00:00')),
        PARTITION p202409 VALUES LESS THAN (UNIX_TIMESTAMP('2024-10-01 00:00:00')),
        PARTITION p202410 VALUES LESS THAN (UNIX_TIMESTAMP('2024-11-01 00:00:00')),
        PARTITION p202411 VALUES LESS THAN (UNIX_TIMESTAMP('2024-12-01 00:00:00')),
        PARTITION p202412 VALUES LESS THAN (UNIX_TIMESTAMP('2025-01-01 00:00:00')),
        PARTITION future VALUES LESS THAN MAXVALUE
      )
    `)

    // Add indexes for messages (can be created after partitioning)
    this.db.rawQuery('CREATE INDEX idx_messages_timestamp ON messages(timestamp)')
    this.db.rawQuery('CREATE INDEX idx_messages_read_at ON messages(read_at)')
    this.db.rawQuery(
      'CREATE INDEX idx_messages_conversation_timestamp ON messages(conversation_id, timestamp)'
    )

    // Add composite primary key for messages (id, timestamp)
    this.db.rawQuery('ALTER TABLE messages ADD PRIMARY KEY (id, timestamp)')
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
