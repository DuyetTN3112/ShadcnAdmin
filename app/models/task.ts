import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import TaskStatus from './task_status.js'
import TaskLabel from './task_label.js'
import TaskPriority from './task_priority.js'
import TaskComment from './task_comment.js'
import TaskVersion from './task_version.js'

export default class Task extends BaseModel {
  static table = 'tasks'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare title: string

  @column()
  declare description: string

  @column()
  declare status_id: number

  @column()
  declare label_id: number

  @column()
  declare priority_id: number

  @column()
  declare assigned_to: string | null

  @column()
  declare creator_id: string

  @column.dateTime()
  declare due_date: DateTime

  @column.dateTime()
  declare deleted_at: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime

  @belongsTo(() => TaskStatus, {
    foreignKey: 'status_id',
  })
  declare status: BelongsTo<typeof TaskStatus>

  @belongsTo(() => TaskLabel, {
    foreignKey: 'label_id',
  })
  declare label: BelongsTo<typeof TaskLabel>

  @belongsTo(() => TaskPriority, {
    foreignKey: 'priority_id',
  })
  declare priority: BelongsTo<typeof TaskPriority>

  @belongsTo(() => User, {
    foreignKey: 'assigned_to',
  })
  declare assignee: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'creator_id',
  })
  declare creator: BelongsTo<typeof User>

  @hasMany(() => TaskComment)
  declare comments: HasMany<typeof TaskComment>

  @hasMany(() => TaskVersion)
  declare versions: HasMany<typeof TaskVersion>
}
