import TaskComment from '#models/task_comment'
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import AuditLog from '#models/audit_log'

type CommentData = {
  id: string | number
  comment: string
}

@inject()
export default class UpdateTaskComment {
  constructor(protected ctx: HttpContext) {}

  async handle({ data }: { data: CommentData }) {
    const user = this.ctx.auth.user!
    // Tìm bình luận cần cập nhật
    const comment = await TaskComment.query().where('id', data.id).firstOrFail()
    // Kiểm tra quyền cập nhật (chỉ người tạo bình luận)
    if (comment.user_id !== user.id) {
      throw new Error('Bạn không có quyền cập nhật bình luận này')
    }
    // Lưu dữ liệu cũ để ghi log
    const oldData = comment.toJSON()
    // Cập nhật bình luận
    comment.comment = data.comment
    await comment.save()
    // Ghi log hành động
    await AuditLog.create({
      user_id: user.id,
      action: 'update',
      entity_type: 'task_comment',
      entity_id: comment.id.toString(),
      old_values: oldData,
      new_values: comment.toJSON(),
      ip_address: this.ctx.request.ip(),
      user_agent: this.ctx.request.header('user-agent'),
    })
    return comment
  }
}
