import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, belongsTo, hasOne, hasMany, manyToMany, beforeCreate } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import type { BelongsTo, HasOne, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import { DbRememberMeTokensProvider } from '@adonisjs/auth/session'
import UserRole from './user_role.js'
import UserStatus from './user_status.js'
import UserDetail from './user_detail.js'
import UserProfile from './user_profile.js'
import UserUrl from './user_url.js'
import Task from './task.js'
import TaskComment from './task_comment.js'
import Conversation from './conversation.js'
import UserApp from './user_app.js'
import UserSetting from './user_setting.js'
import AuditLog from './audit_log.js'
import Notification from './notification.js'
import { v4 as uuidv4 } from 'uuid'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email', 'username'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  static rememberMeTokens = DbRememberMeTokensProvider.forModel(User)

  static table = 'users'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare first_name: string

  @column()
  declare last_name: string

  @column()
  declare username: string

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare status_id: number

  @column()
  declare role_id: number

  @column()
  declare full_name: string

  @column.dateTime()
  declare deleted_at: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updated_at: DateTime

  @beforeCreate()
  static generateUUID(user: User) {
    user.id = uuidv4()
  }

  @belongsTo(() => UserRole, {
    foreignKey: 'role_id',
  })
  declare role: BelongsTo<typeof UserRole>

  @belongsTo(() => UserStatus, {
    foreignKey: 'status_id',
  })
  declare status: BelongsTo<typeof UserStatus>

  @hasOne(() => UserDetail)
  declare user_detail: HasOne<typeof UserDetail>

  @hasOne(() => UserProfile)
  declare user_profile: HasOne<typeof UserProfile>

  @hasMany(() => UserUrl)
  declare user_urls: HasMany<typeof UserUrl>

  @hasMany(() => Task, {
    foreignKey: 'creator_id',
  })
  declare created_tasks: HasMany<typeof Task>

  @hasMany(() => Task, {
    foreignKey: 'assigned_to',
  })
  declare assigned_tasks: HasMany<typeof Task>

  @hasMany(() => TaskComment)
  declare task_comments: HasMany<typeof TaskComment>

  @manyToMany(() => Conversation, {
    pivotTable: 'conversation_participants',
  })
  declare conversations: ManyToMany<typeof Conversation>

  @hasMany(() => UserApp)
  declare user_apps: HasMany<typeof UserApp>

  @hasOne(() => UserSetting)
  declare user_setting: HasOne<typeof UserSetting>

  @hasMany(() => AuditLog)
  declare audit_logs: HasMany<typeof AuditLog>

  @hasMany(() => Notification)
  declare notifications: HasMany<typeof Notification>
}
