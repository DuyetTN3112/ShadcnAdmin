import User from '#models/user'
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import AuditLog from '#models/audit_log'
import { DateTime } from 'luxon'

@inject()
export default class DeleteUser {
  constructor(protected ctx: HttpContext) {}

  async handle({ id }: { id: string }) {
    const currentUser = this.ctx.auth.user!
    // Kiểm tra không thể xóa chính mình
    if (currentUser.id === id) {
      return {
        success: false,
        message: 'Bạn không thể xóa tài khoản của chính mình',
      }
    }
    // Tìm user cần xóa
    const user = await User.findOrFail(id)
    // Soft delete bằng cách đặt deleted_at
    user.deleted_at = DateTime.now()
    await user.save()
    // Ghi log hành động
    await AuditLog.create({
      user_id: currentUser.id,
      action: 'delete',
      entity_type: 'user',
      entity_id: user.id,
      old_values: {
        ...user.toJSON(),
        password: '[redacted]',
      },
      ip_address: this.ctx.request.ip(),
      user_agent: this.ctx.request.header('user-agent'),
    })

    return {
      success: true,
      message: 'Người dùng đã được xóa thành công',
    }
  }
}
