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

      // Kiểm tra xác thực
      await ctx.auth.authenticateUsing(options.guards || ['web'], {
        loginRoute: this.redirectTo,
      })

      // Đảm bảo thông tin người dùng được truyền đến inertia
      if (ctx.auth.user) {
        // Thêm role và thông tin khác vào user
        await ctx.auth.user.load('role')
        await ctx.auth.user.load('organizations')
        // Kiểm tra vai trò và thiết lập isAdmin
        const isAdmin =
          ctx.auth.user.role?.name?.toLowerCase() === 'admin' ||
          ctx.auth.user.role?.name?.toLowerCase() === 'superadmin' ||
          [1, 2].includes(ctx.auth.user.role_id)
        // In ra log để debug
        if (this.isDevMode) {
          this.log('User Organizations:', ctx.auth.user.organizations?.length || 0)
          this.log(
            'Organization IDs:',
            ctx.auth.user.organizations?.map((org) => org.id)
          )
        }

        // Lấy current_organization_id từ session hoặc từ model user
        const currentOrganizationId =
          ctx.session.get('current_organization_id') || ctx.auth.user.current_organization_id
        // Chia sẻ thông tin người dùng với inertia
        ctx.inertia?.share({
          auth: {
            user: {
              ...ctx.auth.user?.serialize(),
              first_name: ctx.auth.user.first_name,
              last_name: ctx.auth.user.last_name,
              full_name:
                ctx.auth.user.full_name || `${ctx.auth.user.first_name} ${ctx.auth.user.last_name}`,
              email: ctx.auth.user.email,
              username: ctx.auth.user.username,
              role: ctx.auth.user.role?.serialize(),
              isAdmin,
              current_organization_id: currentOrganizationId,
              organizations: ctx.auth.user.organizations?.map((org) => ({
                id: org.id,
                name: org.name,
                logo: org.logo,
                plan: org.plan,
              })),
            },
          },
        })
      }

      if (this.isDevMode) {
        this.log('Authentication successful', {
          userId: ctx.auth.user?.id,
          userName: ctx.auth.user?.username,
          userRole: ctx.auth.user?.role?.name,
          isAdmin: ctx.auth.user?.isAdmin,
          orgCount: ctx.auth.user?.organizations?.length,
          current_organization_id: ctx.session.get('current_organization_id'),
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
