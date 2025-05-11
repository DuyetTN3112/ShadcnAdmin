import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import App from '#models/app'
import Task from '#models/task'
import Conversation from '#models/conversation'
import Message from '#models/message'
import AuditLog from '#models/audit_log'

@inject()
export default class GetDashboardData {
  constructor(protected ctx: HttpContext) {}

  async handle() {
    const { auth } = this.ctx
    const user = auth.user!

    // Tổng số ứng dụng
    const totalApps = await App.query().count('* as total').first()

    // Tổng số task
    const totalTasks = await Task.query().count('* as total').first()
    // Số task đã hoàn thành
    const completedTasks = await Task.query()
      .where('status_id', 3) // Giả sử 3 là trạng thái hoàn thành
      .count('* as total')
      .first()
    // Số task đang thực hiện
    const inProgressTasks = await Task.query()
      .where('status_id', 2) // Giả sử 2 là trạng thái đang thực hiện
      .count('* as total')
      .first()
    // Số task chưa bắt đầu
    const pendingTasks = await Task.query()
      .where('status_id', 1) // Giả sử 1 là trạng thái chưa bắt đầu
      .count('* as total')
      .first()
    // Số task được giao cho user hiện tại
    const myTasks = await Task.query().where('assigned_to', user.id).count('* as total').first()
    // Tổng số cuộc hội thoại
    const totalConversations = await Conversation.query().count('* as total').first()
    // Tổng số tin nhắn
    const totalMessages = await Message.query().count('* as total').first()
    // Hoạt động gần đây (audit logs)
    const recentActivities = await AuditLog.query()
      .orderBy('created_at', 'desc')
      .limit(10)
      .preload('user')
    return {
      totalApps: Number(totalApps?.$extras.total || 0),
      totalTasks: Number(totalTasks?.$extras.total || 0),
      completedTasks: Number(completedTasks?.$extras.total || 0),
      inProgressTasks: Number(inProgressTasks?.$extras.total || 0),
      pendingTasks: Number(pendingTasks?.$extras.total || 0),
      myTasks: Number(myTasks?.$extras.total || 0),
      totalConversations: Number(totalConversations?.$extras.total || 0),
      totalMessages: Number(totalMessages?.$extras.total || 0),
      recentActivities,
      user: {
        id: user.id,
        name: user.full_name || `${user.first_name} ${user.last_name}`,
        email: user.email,
      },
    }
  }
}
