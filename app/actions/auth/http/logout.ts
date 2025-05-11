import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import AuditLogging, { ActionType, EntityType } from '#actions/common/audit_logging'

@inject()
export default class Logout {
  constructor(
    private ctx: HttpContext,
    private auditLogging: AuditLogging
  ) {}

  async handle() {
    const user = this.ctx.auth.user!

    // Ghi log đăng xuất
    await this.auditLogging.log({
      action: ActionType.LOGOUT,
      entity_type: EntityType.USER,
      entity_id: user.id,
      metadata: {
        timestamp: new Date(),
      },
    })

    // Đăng xuất
    await this.ctx.auth.use('web').logout()
    this.ctx.session.forget('auth')
  }
}
