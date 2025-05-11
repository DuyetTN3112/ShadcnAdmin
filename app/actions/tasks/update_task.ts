import Task from '#models/task'
import User from '#models/user'
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import AuditLog from '#models/audit_log'
import { DateTime } from 'luxon'
import CreateNotification from '#actions/common/create_notification'

type TaskData = {
  title?: string
  description?: string
  status_id?: number
  label_id?: number
  priority_id?: number
  assigned_to?: string
  due_date?: string | DateTime
}

@inject()
export default class UpdateTask {
  constructor(
    protected ctx: HttpContext,
    private createNotification: CreateNotification
  ) {}

  async handle({ id, data }: { id: string; data: TaskData }) {
    const user = this.ctx.auth.user!

    // Lấy dữ liệu cũ của task
    const task = await Task.findOrFail(id)
    const oldData = JSON.stringify(task.toJSON())
    const oldAssignedTo = task.assigned_to

    // Xử lý dữ liệu trước khi cập nhật
    const updateData: Record<string, any> = {}
    if (data.title) updateData.title = data.title
    if (data.description) updateData.description = data.description
    if (data.status_id) updateData.status_id = data.status_id
    if (data.label_id) updateData.label_id = data.label_id
    if (data.priority_id) updateData.priority_id = data.priority_id
    if (data.assigned_to) updateData.assigned_to = data.assigned_to
    // Cập nhật dueDate nếu có
    if (data.due_date) {
      updateData.due_date =
        typeof data.due_date === 'string' ? DateTime.fromISO(data.due_date) : data.due_date
    }

    // Cập nhật task
    task.merge(updateData)
    await task.save()

    // Ghi log hành động
    await AuditLog.create({
      user_id: user.id,
      action: 'update',
      entity_type: 'task',
      entity_id: task.id,
      old_values: JSON.parse(oldData),
      new_values: task.toJSON(),
      ip_address: this.ctx.request.ip(),
      user_agent: this.ctx.request.header('user-agent'),
    })

    // Nếu người được giao việc thay đổi, gửi thông báo
    if (data.assigned_to && data.assigned_to !== oldAssignedTo) {
      const assignee = await User.find(data.assigned_to)

      if (assignee) {
        await this.createNotification.handle({
          user_id: assignee.id,
          title: 'Bạn có nhiệm vụ mới',
          message: `${user.full_name} đã giao cho bạn nhiệm vụ: ${task.title}`,
          type: 'task_assigned',
          related_entity_type: 'task',
          related_entity_id: task.id,
        })
      }
    }

    // Nếu trạng thái thay đổi, thông báo cho người tạo
    if (data.status_id && data.status_id !== task.$original.status_id) {
      // Tìm người tạo
      if (task.creator_id !== user.id) {
        await this.createNotification.handle({
          user_id: task.creator_id,
          title: 'Cập nhật nhiệm vụ',
          message: `${user.full_name} đã cập nhật trạng thái nhiệm vụ: ${task.title}`,
          type: 'task_status_updated',
          related_entity_type: 'task',
          related_entity_id: task.id,
        })
      }
    }

    return task
  }
}
