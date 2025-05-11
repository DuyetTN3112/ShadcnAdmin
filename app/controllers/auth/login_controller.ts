import Login from '#actions/auth/http/login'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

export default class LoginController {
  async show({ inertia }: HttpContext) {
    return inertia.render('auth/login')
  }

  @inject()
  async store({ request, response }: HttpContext, login: Login) {
    const data = request.only(['email', 'password', 'remember'])

    const user = await login.handle({ data })

    if (!user) {
      return response.redirect().back()
    }

    return response.redirect().toRoute('dashboard.index')
  }
}
