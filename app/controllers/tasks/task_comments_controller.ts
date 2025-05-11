import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import CreateTaskComment from '#actions/tasks/create_task_comment'
import UpdateTaskComment from '#actions/tasks/update_task_comment'
import DeleteTaskComment from '#actions/tasks/delete_task_comment'

export default class TaskCommentsController {
  @inject()
  async store(
    { params, request, response, session }: HttpContext,
    createTaskComment: CreateTaskComment
  ) {
    const data = {
      task_id: params.task_id,
      comment: request.input('comment'),
    }
    try {
      await createTaskComment.handle({ data })
      session.flash('success', 'Bình luận đã được thêm thành công')
    } catch (error) {
      session.flash('error', error.message || 'Có lỗi xảy ra khi thêm bình luận')
    }
    return response.redirect().back()
  }

  @inject()
  async update(
    { params, request, response, session }: HttpContext,
    updateTaskComment: UpdateTaskComment
  ) {
    const data = {
      id: params.id,
      comment: request.input('comment'),
    }
    try {
      await updateTaskComment.handle({ data })
      session.flash('success', 'Bình luận đã được cập nhật thành công')
    } catch (error) {
      session.flash('error', error.message || 'Có lỗi xảy ra khi cập nhật bình luận')
    }
    return response.redirect().back()
  }

  @inject()
  async destroy(
    { params, request, response, session }: HttpContext,
    deleteTaskComment: DeleteTaskComment
  ) {
    try {
      await deleteTaskComment.handle({ id: Number.parseInt(params.id) })

      // Kiểm tra nếu là AJAX request
      if (request.accepts(['html', 'json']) === 'json') {
        return response.json({ success: true })
      }
      session.flash('success', 'Bình luận đã được xóa thành công')
      return response.redirect().back()
    } catch (error: any) {
      if (request.accepts(['html', 'json']) === 'json') {
        return response.status(400).json({
          success: false,
          message: error.message || 'Có lỗi xảy ra khi xóa bình luận',
        })
      }
      session.flash('error', error.message || 'Có lỗi xảy ra khi xóa bình luận')
      return response.redirect().back()
    }
  }
}
