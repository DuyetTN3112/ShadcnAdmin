import Conversation from '#models/conversation'
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

@inject()
export default class MarkMessagesAsRead {
  constructor(protected ctx: HttpContext) {}

  async handle({ conversation_id }: { conversation_id: string }) {
    const user = this.ctx.auth.user!
    // Kiểm tra người dùng có quyền truy cập cuộc trò chuyện này không
    await Conversation.query()
      .where('id', conversation_id)
      .whereNull('deleted_at')
      .whereHas('participants', (builder) => {
        builder.where('user_id', user.id)
      })
      .firstOrFail()
    // Đánh dấu tất cả tin nhắn từ người khác là đã đọc
    const result = await db
      .from('messages')
      .where('conversation_id', conversation_id)
      .where('sender_id', '!=', user.id)
      .whereNull('read_at')
      .update({ read_at: new Date() })
    return {
      success: true,
      updated_count: typeof result === 'number' ? result : 0,
    }
  }
}
