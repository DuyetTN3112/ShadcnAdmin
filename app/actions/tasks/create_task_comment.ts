import Task from '#models/task'
import TaskComment from '#models/task_comment'
import User from '#models/user'
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import CreateNotification from '#actions/common/create_notification'

type CommentData = {
  task_id: string
  comment: string
}

@inject()
export default class CreateTaskComment {
  constructor(
    protected ctx: HttpContext,
    private createNotification: CreateNotification
  ) {}

  async handle({ data }: { data: CommentData }) {
    const user = this.ctx.auth.user!
    // Kiểm tra task có tồn tại không
    const task = await Task.query().where('id', data.task_id).whereNull('deleted_at').firstOrFail()
    // Tạo bình luận mới
    const comment = await TaskComment.create({
      task_id: data.task_id,
      user_id: user.id,
      comment: data.comment,
    })
    // Thông báo cho người tạo task nếu không phải người bình luận
    if (task.creator_id !== user.id) {
      await this.createNotification.handle({
        user_id: task.creator_id,
        title: 'Bình luận mới',
        message: `${user.full_name} đã bình luận về task: ${task.title}`,
        type: 'task_comment',
        related_entity_type: 'task',
        related_entity_id: task.id,
      })
    }
    // Thông báo cho người được giao task nếu có và không phải người bình luận
    if (task.assigned_to && task.assigned_to !== user.id && task.assigned_to !== task.creator_id) {
      const assignee = await User.find(task.assigned_to)
      if (assignee) {
        await this.createNotification.handle({
          user_id: assignee.id,
          title: 'Bình luận mới',
          message: `${user.full_name} đã bình luận về task: ${task.title}`,
          type: 'task_comment',
          related_entity_type: 'task',
          related_entity_id: task.id,
        })
      }
    }
    return comment
  }
}
