import User from '#models/user'
import UserDetail from '#models/user_detail'
import UserProfile from '#models/user_profile'
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import AuditLog from '#models/audit_log'
import hash from '@adonisjs/core/services/hash'
import { DateTime } from 'luxon'

type UserData = {
  first_name?: string
  last_name?: string
  username?: string
  email?: string
  password?: string
  role_id?: number
  status_id?: number
  phone_number?: string
  bio?: string
  date_of_birth?: string
  language?: string
}

@inject()
export default class UpdateUser {
  constructor(protected ctx: HttpContext) {}

  async handle({ id, data }: { id: string; data: UserData }) {
    const user = this.ctx.auth.user!
    return await db.transaction(async (trx) => {
      // Tìm user cần cập nhật
      const userToUpdate = await User.findOrFail(id)
      const oldData = {
        ...userToUpdate.toJSON(),
        password: '[redacted]',
      }
      // Cập nhật user
      if (data.first_name) userToUpdate.first_name = data.first_name
      if (data.last_name) userToUpdate.last_name = data.last_name
      if (data.username) userToUpdate.username = data.username
      if (data.email) userToUpdate.email = data.email
      if (data.password) userToUpdate.password = await hash.make(data.password)
      if (data.role_id) userToUpdate.role_id = data.role_id
      if (data.status_id) userToUpdate.status_id = data.status_id
      await userToUpdate.save()

      // Cập nhật thông tin chi tiết
      let userDetail = await UserDetail.findBy('user_id', id)
      if (userDetail) {
        if (data.phone_number !== undefined) userDetail.phone_number = data.phone_number
        if (data.bio !== undefined) userDetail.bio = data.bio
        await userDetail.save()
      }

      // Cập nhật profile
      let userProfile = await UserProfile.findBy('user_id', id)
      if (userProfile) {
        if (data.language) userProfile.language = data.language
        if (data.date_of_birth) userProfile.date_of_birth = DateTime.fromISO(data.date_of_birth)
        await userProfile.save()
      }
      // Ghi log hành động
      await AuditLog.create(
        {
          user_id: user.id,
          action: 'update',
          entity_type: 'user',
          entity_id: userToUpdate.id,
          old_values: oldData,
          new_values: {
            ...userToUpdate.toJSON(),
            password: '[redacted]',
          },
          ip_address: this.ctx.request.ip(),
          user_agent: this.ctx.request.header('user-agent'),
        },
        { client: trx }
      )

      return userToUpdate
    })
  }
}
