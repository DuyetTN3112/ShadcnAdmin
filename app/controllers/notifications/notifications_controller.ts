import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import ListNotifications from '#actions/notifications/list_notifications'
import MarkNotificationAsRead from '#actions/notifications/mark_notification_as_read'
import DeleteNotification from '#actions/notifications/delete_notification'

export default class NotificationsController {
  @inject()
  async index({ request, inertia }: HttpContext, listNotifications: ListNotifications) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 15)
    const is_read = request.input('is_read')
    const type = request.input('type')
    const options = {
      page,
      limit,
      is_read: is_read === 'true' ? true : is_read === 'false' ? false : undefined,
      type,
    }
    const notifications = await listNotifications.handle(options)
    return inertia.render('notifications/index', {
      notifications,
      filters: options,
    })
  }

  @inject()
  async latest({ request, response }: HttpContext, listNotifications: ListNotifications) {
    const limit = request.input('limit', 5)
    const options = {
      page: 1,
      limit,
      is_read: false,
    }
    const notifications = await listNotifications.handle(options)
    return response.json({
      notifications: notifications.data,
      unreadCount: notifications.meta.total,
    })
  }

  @inject()
  async markAsRead(
    { params, response }: HttpContext,
    markNotificationAsRead: MarkNotificationAsRead
  ) {
    try {
      await markNotificationAsRead.handle({ id: Number.parseInt(params.id) })
      return response.json({ success: true })
    } catch (error: any) {
      return response.status(404).json({
        success: false,
        message: error.message || 'Thông báo không tồn tại',
      })
    }
  }

  @inject()
  async markAllAsRead({ response }: HttpContext, markNotificationAsRead: MarkNotificationAsRead) {
    await markNotificationAsRead.markAllAsRead()
    return response.json({ success: true })
  }

  @inject()
  async destroy({ params, response }: HttpContext, deleteNotification: DeleteNotification) {
    try {
      await deleteNotification.handle({ id: Number.parseInt(params.id) })
      return response.json({ success: true })
    } catch (error: any) {
      return response.status(404).json({
        success: false,
        message: error.message || 'Thông báo không tồn tại',
      })
    }
  }

  @inject()
  async destroyAllRead({ response }: HttpContext, deleteNotification: DeleteNotification) {
    await deleteNotification.deleteAllRead()
    return response.json({ success: true })
  }
}
