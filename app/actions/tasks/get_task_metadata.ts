import TaskStatus from '#models/task_status'
import TaskLabel from '#models/task_label'
import TaskPriority from '#models/task_priority'
import User from '#models/user'
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'

@inject()
export default class GetTaskMetadata {
  constructor(protected ctx: HttpContext) {}

  async handle() {
    const statuses = await TaskStatus.all()
    const labels = await TaskLabel.all()
    const priorities = await TaskPriority.all()
    // Lấy danh sách người dùng để gán task
    const users = await User.query()
      .whereNull('deleted_at')
      .select(['id', 'first_name', 'last_name', 'full_name'])
      .orderBy('full_name', 'asc')
    return {
      statuses,
      labels,
      priorities,
      users,
    }
  }
}
