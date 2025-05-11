import User from '#models/user'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import limiter from '@adonisjs/limiter/services/main'

type LoginData = {
  email: string
  password: string
  remember: boolean
}

@inject()
export default class Login {
  constructor(protected ctx: HttpContext) {}

  get limit() {
    return limiter.use({
      requests: 5,
      duration: '1 hour',
      blockDuration: '12 hours',
    })
  }

  async handle({ data }: { data: LoginData }) {
    const key = this.getRateKey(data.email)

    const [error, user] = await this.limit.penalize(key, () => {
      return User.verifyCredentials(data.email, data.password)
    })

    if (error) {
      this.ctx.session.flashAll()
      this.ctx.session.flashErrors({
        E_TOO_MANY_REQUESTS: 'Quá nhiều lần đăng nhập thất bại, vui lòng thử lại sau',
      })
      return null
    }

    await this.ctx.auth.use('web').login(user, data.remember)
    return user
  }

  getRateKey(email: string) {
    return `login_${this.ctx.request.ip()}_${email}`
  }

  async clearRateLimits(email: string) {
    return this.limit.delete(this.getRateKey(email))
  }
}
