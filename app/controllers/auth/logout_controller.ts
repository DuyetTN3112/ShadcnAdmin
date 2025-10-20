import { LogoutUserCommand } from '#actions/auth/commands/index'
import { LogoutUserDTO } from '#actions/auth/dtos/index'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * LogoutController
 *
 * Handles user logout via web interface.
 * This is a thin controller that delegates to LogoutUserCommand.
 *
 * Routes:
 * - POST /logout - Process logout
 * - GET /logout - Process logout
 */
export default class LogoutController {
  /**
   * Handle logout request
   * Uses LogoutUserCommand for business logic
   */
  async handle({ request, response, inertia, session, auth }: HttpContext) {
    console.log('[LogoutController] Logout request received')
    console.log('[LogoutController] Method:', request.method())
    console.log('[LogoutController] URL:', request.url())
    console.log('[LogoutController] Authenticated:', auth.isAuthenticated)

    try {
      // Only logout if user is authenticated
      if (!auth.isAuthenticated) {
        console.log('[LogoutController] User not authenticated, redirecting to login')
        return this.redirectToLogin(request, response, inertia)
      }

      const user = auth.user!
      console.log('[LogoutController] Logging out user:', user.id)

      // 1. Build DTO
      const dto = new LogoutUserDTO({
        userId: user.id,
        sessionId: session.sessionId,
        ipAddress: request.ip(),
      })

      // 2. Execute command
      console.log('[LogoutController] Executing LogoutUserCommand')
      const command = new LogoutUserCommand({ request, response, inertia, session, auth } as any)
      await command.handle(dto)
      console.log('[LogoutController] Command executed successfully')

      // 3. Clear additional session data
      session.forget('show_organization_required_modal')
      session.forget('intended_url')

      // 4. Set success message
      session.flash('success', 'Đã đăng xuất thành công')
      console.log('[LogoutController] Session cleared, redirecting to login')

      // 5. Redirect to login
      return this.redirectToLogin(request, response, inertia)
    } catch (error) {
      console.error('[LogoutController] Error during logout:', error)
      session.flash('error', 'Có lỗi xảy ra khi đăng xuất')
      return this.redirectToLogin(request, response, inertia)
    }
  }

  /**
   * Redirect to login page
   * Supports both Inertia and regular redirects
   */
  private redirectToLogin(request: any, response: any, inertia: any) {
    const isInertia = request.header('X-Inertia')
    if (isInertia) {
      return inertia.location('/login')
    }
    return response.redirect().toPath('/login')
  }
}
