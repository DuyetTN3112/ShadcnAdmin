import Task from '#models/task'
import User from '#models/user'
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import AuditLog from '#models/audit_log'
import { DateTime } from 'luxon'
import CreateNotification from '#actions/common/create_notification'

type TaskData = {
  title: string
  description: string
  status_id: number
  label_id: number
  priority_id: number
  assigned_to?: string
  due_date: string | DateTime
}

@inject()
export default class CreateTask {
  constructor(
    protected ctx: HttpContext,
    private createNotification: CreateNotification
  ) {}

  async handle({ data }: { data: TaskData }) {
    const user = this.ctx.auth.user!

    // Tạo task mới
    const task = await Task.create({
      ...data,
      creator_id: user.id,
      due_date: typeof data.due_date === 'string' ? DateTime.fromISO(data.due_date) : data.due_date,
    })

    // Ghi log hành động
    await AuditLog.create({
      user_id: user.id,
      action: 'create',
      entity_type: 'task',
      entity_id: task.id,
      new_values: task.toJSON(),
      ip_address: this.ctx.request.ip(),
      user_agent: this.ctx.request.header('user-agent'),
    })

    // Gửi thông báo cho người được giao task
    if (data.assigned_to) {
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

    return task
  }
}
