import Task from '#models/task'
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import AuditLog from '#models/audit_log'
import { DateTime } from 'luxon'

@inject()
export default class DeleteTask {
  constructor(protected ctx: HttpContext) {}

  async handle({ id }: { id: string }) {
    const user = this.ctx.auth.user!

    // Tìm task cần xóa
    const task = await Task.findOrFail(id)

    // Soft delete bằng cách đặt deleted_at
    task.deleted_at = DateTime.now()
    await task.save()

    // Ghi log hành động
    await AuditLog.create({
      user_id: user.id,
      action: 'delete',
      entity_type: 'task',
      entity_id: task.id,
      old_values: task.toJSON(),
      ip_address: this.ctx.request.ip(),
      user_agent: this.ctx.request.header('user-agent'),
    })

    return true
  }
}
