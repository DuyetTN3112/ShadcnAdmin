import Notification from '#models/notification'
import { inject } from '@adonisjs/core'

type NotificationData = {
  user_id: string
  title: string
  message: string
  type: string
  related_entity_type?: string
  related_entity_id?: string
  metadata?: Record<string, any>
  is_read?: boolean
}

@inject()
export default class CreateNotification {
  async handle(data: NotificationData) {
    // Tạo thông báo mới
    const notification = await Notification.create({
      user_id: data.user_id,
      title: data.title,
      message: data.message,
      type: data.type,
      related_entity_type: data.related_entity_type || null,
      related_entity_id: data.related_entity_id || null,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      is_read: data.is_read || false,
    })
    return notification
  }
}
