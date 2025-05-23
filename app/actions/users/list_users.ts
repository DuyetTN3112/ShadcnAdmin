import User from '#models/user'
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'

type FilterOptions = {
  page?: number
  limit?: number
  role_id?: number
  status_id?: number
  search?: string
  organization_id?: number
}

@inject()
export default class ListUsers {
  constructor(protected ctx: HttpContext) {}

  async handle({ options }: { options: FilterOptions }) {
    const page = options.page || 1
    const limit = options.limit || 10
    const currentUser = this.ctx.auth.user
    const organizationId = options.organization_id || currentUser?.current_organization_id
    const query = User.query()
      .whereNull('deleted_at')
      .preload('role')
      .preload('status')
      .preload('user_detail')
      .preload('user_profile')
    // Lọc theo tổ chức hiện tại
    if (organizationId) {
      query.whereHas('organization_users', (builder) => {
        builder.where('organization_id', organizationId)
      })
    }
    if (options.role_id) {
      query.where('role_id', options.role_id)
    }
    if (options.status_id) {
      query.where('status_id', options.status_id)
    }
    if (options.search) {
      query.where((builder) => {
        builder
          .where('first_name', 'LIKE', `%${options.search}%`)
          .orWhere('last_name', 'LIKE', `%${options.search}%`)
          .orWhere('full_name', 'LIKE', `%${options.search}%`)
          .orWhere('email', 'LIKE', `%${options.search}%`)
          .orWhere('username', 'LIKE', `%${options.search}%`)
      })
    }
    return await query.orderBy('created_at', 'desc').paginate(page, limit)
  }
}
