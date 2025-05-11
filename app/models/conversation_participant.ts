import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Conversation from './conversation.js'

export default class ConversationParticipant extends BaseModel {
  static table = 'conversation_participants'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare conversation_id: string

  @column()
  declare user_id: string

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @belongsTo(() => Conversation, {
    foreignKey: 'conversation_id',
  })
  declare conversation: BelongsTo<typeof Conversation>

  @belongsTo(() => User, {
    foreignKey: 'user_id',
  })
  declare user: BelongsTo<typeof User>
}
