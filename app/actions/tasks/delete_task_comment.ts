import TaskComment from '#models/task_comment'
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import AuditLog from '#models/audit_log'

@inject()
export default class DeleteTaskComment {
  constructor(protected ctx: HttpContext) {}

  async handle({ id }: { id: string | number }) {
    const user = this.ctx.auth.user!
    // Tìm bình luận cần xóa
    const comment = await TaskComment.query().where('id', id).firstOrFail()
    // Kiểm tra quyền xóa (chỉ người tạo bình luận hoặc admin)
    if (comment.user_id !== user.id && user.role_id !== 1) {
      throw new Error('Bạn không có quyền xóa bình luận này')
    }
    // Lưu dữ liệu cũ để ghi log
    const oldData = comment.toJSON()
    // Xóa bình luận
    await comment.delete()
    // Ghi log hành động
    await AuditLog.create({
      user_id: user.id,
      action: 'delete',
      entity_type: 'task_comment',
      entity_id: id.toString(),
      old_values: oldData,
      ip_address: this.ctx.request.ip(),
      user_agent: this.ctx.request.header('user-agent'),
    })
    return { success: true }
  }
}
