import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class UserSetting extends BaseModel {
  static table = 'user_settings'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare user_id: string

  @column()
  declare theme: string

  @column()
  declare notifications_enabled: boolean

  @column()
  declare display_mode: string

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime

  @belongsTo(() => User, {
    foreignKey: 'user_id',
  })
  declare user: BelongsTo<typeof User>
}
