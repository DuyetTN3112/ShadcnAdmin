import Logout from '#actions/auth/http/logout'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

export default class LogoutController {
  @inject()
  async handle({ response }: HttpContext, logout: Logout) {
    await logout.handle()
    return response.redirect().toRoute('auth.login')
  }
}
