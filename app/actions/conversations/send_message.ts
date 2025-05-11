import Conversation from '#models/conversation'
import Message from '#models/message'
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { v4 as uuidv4 } from 'uuid'
import { DateTime } from 'luxon'

type MessageData = {
  conversation_id: string
  message: string
}

@inject()
export default class SendMessage {
  constructor(protected ctx: HttpContext) {}

  async handle({ data }: { data: MessageData }) {
    const user = this.ctx.auth.user!
    // Kiểm tra người dùng có quyền truy cập cuộc trò chuyện này không
    const conversation = await Conversation.query()
      .where('id', data.conversation_id)
      .whereNull('deleted_at')
      .whereHas('participants', (builder) => {
        builder.where('user_id', user.id)
      })
      .firstOrFail()
    // Tạo tin nhắn mới
    const message = await Message.create({
      id: uuidv4(),
      conversation_id: data.conversation_id,
      sender_id: user.id,
      message: data.message,
      timestamp: DateTime.now(),
    })
    // Cập nhật thời gian cập nhật của cuộc trò chuyện
    await conversation.merge({ updated_at: DateTime.now() }).save()
    return message
  }
}
