import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import UserRole from '#models/user_role'
import UserStatus from '#models/user_status'
import CreateUser from '#actions/users/create_user'
import UpdateUser from '#actions/users/update_user'
import DeleteUser from '#actions/users/delete_user'
import db from '@adonisjs/lucid/services/db'

@inject()
export default class UserController {
  /**
   * Hiển thị danh sách người dùng
   */
  async index({ inertia, request, auth }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    const search = request.input('search', '')
    const currentOrganizationId = auth.user?.current_organization_id

    if (search) {
      // Sử dụng stored procedure để tìm kiếm người dùng
      const result = await db.rawQuery('CALL search_users(?)', [search])
      // Kết quả từ stored procedure MySQL thường nằm ở phần tử đầu tiên của mảng
      const searchResults = result && Array.isArray(result) && result[0] ? result[0] : []

      // Lấy thông tin về vai trò trong tổ chức cho mỗi người dùng
      if (currentOrganizationId) {
        for (const user of searchResults) {
          const orgUserRole = await db
            .from('organization_users as ou')
            .join('user_roles as ur', 'ou.role_id', 'ur.id')
            .where('ou.organization_id', currentOrganizationId)
            .where('ou.user_id', user.id)
            .select('ou.role_id as id', 'ur.name')
            .first()
          if (orgUserRole) {
            user.organization_role = orgUserRole
          }
        }
      }

      const roles = await UserRole.all()
      const statuses = await UserStatus.all()
      return inertia.render('users/index', {
        users: {
          data: searchResults,
          meta: {
            total: searchResults.length,
            per_page: limit,
            current_page: 1,
            last_page: 1,
          },
        },
        roles,
        statuses,
        filters: { search },
      })
    } else {
      // Sử dụng truy vấn thông thường nếu không có tìm kiếm
      const usersQuery = User.query().preload('role').preload('status').whereNull('deleted_at')
      // Nếu có tổ chức hiện tại, lấy tất cả người dùng của tổ chức đó
      if (currentOrganizationId) {
        usersQuery.whereHas('organizations', (query) => {
          query.where('organizations.id', currentOrganizationId)
        })
      }
      const users = await usersQuery.paginate(page, limit)
      // Lấy thông tin vai trò trong tổ chức cho mỗi người dùng
      if (currentOrganizationId) {
        for (const user of users.all()) {
          const orgUserRole = await db
            .from('organization_users as ou')
            .join('user_roles as ur', 'ou.role_id', 'ur.id')
            .where('ou.organization_id', currentOrganizationId)
            .where('ou.user_id', user.id)
            .select('ou.role_id as id', 'ur.name')
            .first()
          if (orgUserRole) {
            user.$extras.organization_role = orgUserRole
          }
        }
      }
      const roles = await UserRole.all()
      const statuses = await UserStatus.all()
      return inertia.render('users/index', {
        users,
        roles,
        statuses,
        filters: { search },
      })
    }
  }

  /**
   * Hiển thị thông tin chi tiết người dùng
   */
  async show({ inertia, params }: HttpContext) {
    const user = await User.query()
      .where('id', params.id)
      .preload('role')
      .preload('status')
      .preload('user_detail')
      .preload('user_profile')
      .preload('user_urls')
      .preload('user_setting')
      .firstOrFail()
    return inertia.render('users/show', { user })
  }

  /**
   * Hiển thị form tạo người dùng mới
   */
  async create({ inertia }: HttpContext) {
    const roles = await UserRole.all()
    const statuses = await UserStatus.all()

    return inertia.render('users/create', { roles, statuses })
  }

  /**
   * Lưu người dùng mới vào database
   */
  @inject()
  async store({ request, response, session }: HttpContext, createUser: CreateUser) {
    try {
      const data = {
        first_name: request.input('first_name'),
        last_name: request.input('last_name'),
        username: request.input('username'),
        email: request.input('email'),
        password: request.input('password'),
        role_id: Number(request.input('role_id')),
        status_id: Number(request.input('status_id')),
        phone_number: request.input('phone_number'),
        bio: request.input('bio'),
        date_of_birth: request.input('date_of_birth'),
        language: request.input('language', 'vi'),
      }
      await createUser.handle({ data })
      session.flash('success', 'Người dùng đã được tạo thành công')
      return response.redirect().toRoute('users.index')
    } catch (error: any) {
      session.flash('error', error.message || 'Có lỗi xảy ra khi tạo người dùng')
      return response.redirect().back()
    }
  }

  /**
   * Hiển thị form chỉnh sửa người dùng
   */
  async edit({ inertia, params }: HttpContext) {
    const user = await User.query()
      .where('id', params.id)
      .preload('user_detail')
      .preload('user_profile')
      .firstOrFail()
    const roles = await UserRole.all()
    const statuses = await UserStatus.all()

    return inertia.render('users/edit', { user, roles, statuses })
  }

  /**
   * Cập nhật thông tin người dùng
   */
  @inject()
  async update({ request, response, params, session }: HttpContext, updateUser: UpdateUser) {
    try {
      const data = {
        first_name: request.input('first_name'),
        last_name: request.input('last_name'),
        username: request.input('username'),
        email: request.input('email'),
        password: request.input('password'),
        role_id: request.input('role_id') ? Number(request.input('role_id')) : undefined,
        status_id: request.input('status_id') ? Number(request.input('status_id')) : undefined,
        phone_number: request.input('phone_number'),
        bio: request.input('bio'),
        date_of_birth: request.input('date_of_birth'),
        language: request.input('language'),
      }
      await updateUser.handle({ id: params.id, data })
      session.flash('success', 'Thông tin người dùng đã được cập nhật')
      return response.redirect().toRoute('users.show', { id: params.id })
    } catch (error: any) {
      session.flash('error', error.message || 'Có lỗi xảy ra khi cập nhật người dùng')
      return response.redirect().back()
    }
  }

  /**
   * Xóa người dùng (soft delete)
   */
  @inject()
  async destroy({ params, response, session }: HttpContext, deleteUser: DeleteUser) {
    try {
      const result = await deleteUser.handle({ id: params.id })
      if (result.success) {
        session.flash('success', result.message)
        return response.redirect().toRoute('users.index')
      } else {
        session.flash('error', result.message)
        return response.redirect().back()
      }
    } catch (error: any) {
      session.flash('error', error.message || 'Có lỗi xảy ra khi xóa người dùng')
      return response.redirect().back()
    }
  }

  /**
   * Phê duyệt người dùng
   */
  async approve({ params, response, auth, session }: HttpContext) {
    try {
      const currentUser = auth.user!
      const targetUserId = params.id
      // Chỉ cho phép superadmin phê duyệt người dùng
      const currentOrgId = currentUser.current_organization_id
      if (!currentOrgId) {
        throw new Error('Không tìm thấy thông tin tổ chức hiện tại')
      }
      // Kiểm tra người dùng hiện tại có phải superadmin trong tổ chức không
      const isSuperAdmin = await db
        .from('organization_users')
        .where('organization_id', currentOrgId)
        .where('user_id', currentUser.id)
        .where('role_id', 1) // role_id = 1 là superadmin
        .first()
      if (!isSuperAdmin) {
        throw new Error('Chỉ superadmin mới có thể phê duyệt người dùng')
      }
      // Cập nhật trạng thái người dùng trong tổ chức từ 'pending' thành 'approved'
      const updated = await db
        .from('organization_users')
        .where('organization_id', currentOrgId)
        .where('user_id', targetUserId)
        .where('status', 'pending')
        .update({
          status: 'approved',
          updated_at: new Date(),
        })
      if (!updated) {
        throw new Error(
          'Không tìm thấy yêu cầu phê duyệt người dùng này hoặc người dùng đã được phê duyệt'
        )
      }
      // Thêm ghi chú về việc phê duyệt vào bảng audit_logs
      try {
        await db.table('audit_logs').insert({
          user_id: currentUser.id,
          action: 'approve_user',
          entity_type: 'user',
          entity_id: targetUserId,
          new_values: JSON.stringify({ status: 'approved' }),
          ip_address: '::1', // Placeholder
          created_at: new Date(),
        })
      } catch (error) {
        // Không làm gì nếu không thể ghi log
        console.error('Không thể ghi log phê duyệt:', error)
      }
      return response.json({ success: true, message: 'Người dùng đã được phê duyệt thành công' })
    } catch (error: any) {
      return response.status(403).json({
        success: false,
        message: error.message || 'Có lỗi xảy ra khi phê duyệt người dùng',
      })
    }
  }

  /**
   * Cập nhật vai trò người dùng
   */
  async updateRole({ params, request, response, auth, session }: HttpContext) {
    try {
      const currentUser = auth.user!
      const targetUserId = params.id
      const newRoleId = request.input('role_id')
      // Sử dụng stored procedure để cập nhật vai trò
      await db.rawQuery('CALL change_user_role_with_permission(?, ?, ?)', [
        currentUser.id,
        targetUserId,
        newRoleId,
      ])
      session.flash('success', 'Vai trò người dùng đã được cập nhật')
      return response.redirect().back()
    } catch (error: any) {
      session.flash('error', error.message || 'Chỉ superadmin mới có thể thay đổi vai trò')
      return response.redirect().back()
    }
  }
}
