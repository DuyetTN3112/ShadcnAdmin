import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import ListConversations from '#actions/conversations/list_conversations'
import GetConversation from '#actions/conversations/get_conversation'
import CreateConversation from '#actions/conversations/create_conversation'
import SendMessage from '#actions/conversations/send_message'
import MarkMessagesAsRead from '#actions/conversations/mark_messages_as_read'
import GetUserMetadata from '#actions/users/get_user_metadata'

export default class ConversationsController {
  @inject()
  async index({ request, inertia }: HttpContext, listConversations: ListConversations) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 15)
    const search = request.input('search')
    const options = { page, limit, search }
    const conversations = await listConversations.handle(options)
    return inertia.render('conversations/index', { conversations })
  }

  @inject()
  async create({ inertia }: HttpContext, getUserMetadata: GetUserMetadata) {
    const metadata = await getUserMetadata.handle()
    return inertia.render('conversations/create', { metadata })
  }

  @inject()
  async store({ request, response, session }: HttpContext, createConversation: CreateConversation) {
    try {
      const data = {
        title: request.input('title'),
        participants: request.input('participants', []),
        initial_message: request.input('initial_message'),
      }
      const conversation = await createConversation.handle({ data })
      session.flash('success', 'Cuộc trò chuyện đã được tạo thành công')
      return response.redirect().toRoute('conversations.show', { id: conversation.id })
    } catch (error) {
      session.flash('error', error.message || 'Có lỗi xảy ra khi tạo cuộc trò chuyện')
      return response.redirect().back()
    }
  }

  @inject()
  async show(
    { params, request, inertia }: HttpContext,
    getConversation: GetConversation,
    markMessagesAsRead: MarkMessagesAsRead
  ) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 50)
    // Lấy thông tin cuộc trò chuyện và tin nhắn
    const { conversation, messages } = await getConversation.handle({
      id: params.id,
      options: { page, limit },
    })
    // Đánh dấu tin nhắn đã đọc
    await markMessagesAsRead.handle({ conversation_id: params.id })
    return inertia.render('conversations/show', {
      conversation,
      messages,
      pagination: {
        page,
        limit,
        hasMore: messages.meta && messages.meta.current_page < messages.meta.last_page,
      },
    })
  }

  @inject()
  async sendMessage({ params, request, response, session }: HttpContext, sendMessage: SendMessage) {
    try {
      const data = {
        conversation_id: params.id,
        message: request.input('message'),
      }

      await sendMessage.handle({ data })
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message || 'Có lỗi xảy ra khi gửi tin nhắn')
      return response.redirect().back()
    }
  }

  @inject()
  async markAsRead({ params, response }: HttpContext, markMessagesAsRead: MarkMessagesAsRead) {
    await markMessagesAsRead.handle({ conversation_id: params.id })
    return response.json({ success: true })
  }
}
