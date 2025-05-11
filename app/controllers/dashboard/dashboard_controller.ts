import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import GetDashboardData from '#actions/dashboard/get_dashboard_data'

export default class DashboardController {
  @inject()
  async index({ inertia }: HttpContext, getDashboardData: GetDashboardData) {
    const dashboardData = await getDashboardData.handle()
    return inertia.render('dashboard/index', {
      dashboardData,
    })
  }
}
