import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Task from './task.js'

export default class TaskComment extends BaseModel {
  static table = 'task_comments'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare task_id: string

  @column()
  declare user_id: string

  @column()
  declare comment: string

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime

  @belongsTo(() => Task, {
    foreignKey: 'task_id',
  })
  declare task: BelongsTo<typeof Task>

  @belongsTo(() => User, {
    foreignKey: 'user_id',
  })
  declare user: BelongsTo<typeof User>
}
