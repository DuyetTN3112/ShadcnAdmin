import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import CreateTaskComment from '#actions/tasks/create_task_comment'
import TaskComment from '#models/task_comment'

@inject()
export default class CommentController {
  /**
   * Tạo comment mới cho task
   */
  async store(
    { request, response, params, session }: HttpContext,
    createTaskComment: CreateTaskComment
  ) {
    try {
      await createTaskComment.handle({
        data: {
          task_id: params.task_id,
          comment: request.input('comment'),
        },
      })
      session.flash('success', 'Bình luận đã được thêm')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message || 'Có lỗi xảy ra khi thêm bình luận')
      return response.redirect().back()
    }
  }
  /**
   * Cập nhật comment
   */
  async update({ request, response, params, auth, session }: HttpContext) {
    try {
      const comment = await TaskComment.findOrFail(params.id)
      // Kiểm tra quyền chỉnh sửa comment
      if (comment.user_id !== auth.user!.id) {
        session.flash('error', 'Bạn không có quyền chỉnh sửa bình luận này')
        return response.redirect().back()
      }
      // Cập nhật comment
      await comment
        .merge({
          comment: request.input('comment'),
        })
        .save()
      session.flash('success', 'Bình luận đã được cập nhật')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message || 'Có lỗi xảy ra khi cập nhật bình luận')
      return response.redirect().back()
    }
  }

  /**
   * Xóa comment
   */
  async destroy({ response, params, auth, session }: HttpContext) {
    try {
      const comment = await TaskComment.findOrFail(params.id)

      // Kiểm tra quyền xóa comment
      if (comment.user_id !== auth.user!.id) {
        session.flash('error', 'Bạn không có quyền xóa bình luận này')
        return response.redirect().back()
      }
      // Xóa comment
      await comment.delete()
      session.flash('success', 'Bình luận đã được xóa')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message || 'Có lỗi xảy ra khi xóa bình luận')
      return response.redirect().back()
    }
  }
}
