import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import GetUserSettings from '#actions/settings/get_user_settings'
import UpdateUserSettings from '#actions/settings/update_user_settings'

export default class SettingsController {
  @inject()
  async show({ inertia }: HttpContext, getUserSettings: GetUserSettings) {
    const settings = await getUserSettings.handle()
    return inertia.render('settings/index', { settings })
  }

  @inject()
  async update(
    { request, response, session }: HttpContext,
    updateUserSettings: UpdateUserSettings
  ) {
    const data = request.only(['theme', 'notifications_enabled', 'display_mode'])
    await updateUserSettings.handle({ data })
    session.flash('success', 'Cài đặt đã được cập nhật thành công')
    return response.redirect().back()
  }
}
