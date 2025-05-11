import { HttpContext } from '@adonisjs/core/http'
import { NextFn } from '@adonisjs/core/types/http'
import type { Authenticators } from '@adonisjs/auth/types'
import env from '#start/env'

/**
 * Middleware kiểm tra người dùng đã đăng nhập hay chưa
 * Sử dụng middleware này cho các route cần xác thực
 */
export default class AuthMiddleware {
  public redirectTo = '/login'
  private isDevMode = env.get('NODE_ENV') === 'development'

  private log(...args: any[]) {
    if (this.isDevMode) {
      console.log(...args)
    }
  }

  private logError(...args: any[]) {
    if (this.isDevMode) {
      console.error(...args)
    }
  }

  public async handle(
    ctx: HttpContext,
    next: NextFn,
    options: { guards?: (keyof Authenticators)[] } = {}
  ) {
    const startTime = this.isDevMode ? Date.now() : 0

    try {
      this.log('--- [AUTH MIDDLEWARE] ---')
      this.log('Request URL:', ctx.request.url())
      // Chỉ log thông tin cơ bản để tránh tràn RAM
      if (this.isDevMode) {
        this.log('Session ID:', ctx.session.sessionId)
        // Không log toàn bộ session data và cookies nữa
      }

      await ctx.auth.authenticateUsing(options.guards || ['web'], {
        loginRoute: this.redirectTo,
      })
      if (this.isDevMode) {
        this.log('Authentication successful', {
          userId: ctx.auth.user?.id,
          duration: `${Date.now() - startTime}ms`,
        })
      }

      return next()
    } catch (error) {
      this.logError('Auth error:', error.message)
      if (this.isDevMode) {
        this.logError('Auth failure details:', {
          url: ctx.request.url(),
          sessionId: ctx.session.sessionId,
        })
      }

      // Lưu URL hiện tại để chuyển hướng sau khi đăng nhập
      ctx.session.put('intended_url', ctx.request.url())

      // Lưu log lỗi vào session - chỉ lưu thông tin cần thiết
      ctx.session.flash('authError', {
        timestamp: new Date().toISOString(),
        attemptedUrl: ctx.request.url(),
      })

      if (ctx.request.header('x-inertia')) {
        this.log('Inertia redirect to login')
        return ctx.inertia.location(this.redirectTo)
      }

      this.log('HTTP redirect to login')
      return ctx.response.redirect().toPath(this.redirectTo)
    } finally {
      if (this.isDevMode) {
        this.log('--- [AUTH MIDDLEWARE END] --- Duration:', Date.now() - startTime, 'ms')
      }
    }
  }
}
