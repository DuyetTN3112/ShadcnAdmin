import { BaseSeeder } from '@adonisjs/lucid/seeders'
import UserRole from '#models/user_role'
import UserStatus from '#models/user_status'
import User from '#models/user'
import { v4 as uuidv4 } from 'uuid'

export default class extends BaseSeeder {
  async run() {
    // Tạo các role cơ bản nếu chưa tồn tại
    const adminRole = await UserRole.firstOrCreate(
      { name: 'Admin' },
      {
        name: 'Admin',
        description: 'Quản trị viên với toàn quyền truy cập',
      }
    )

    const userRole = await UserRole.firstOrCreate(
      { name: 'User' },
      {
        name: 'User',
        description: 'Người dùng thông thường',
      }
    )

    const managerRole = await UserRole.firstOrCreate(
      { name: 'Manager' },
      {
        name: 'Manager',
        description: 'Quản lý với quyền hạn cao hơn người dùng thông thường',
      }
    )

    // Tạo các trạng thái người dùng nếu chưa tồn tại
    const activeStatus = await UserStatus.firstOrCreate(
      { name: 'Active' },
      {
        name: 'Active',
        description: 'Tài khoản đang hoạt động',
      }
    )

    const inactiveStatus = await UserStatus.firstOrCreate(
      { name: 'Inactive' },
      {
        name: 'Inactive',
        description: 'Tài khoản đã bị vô hiệu hóa',
      }
    )

    const pendingStatus = await UserStatus.firstOrCreate(
      { name: 'Pending' },
      {
        name: 'Pending',
        description: 'Tài khoản đang chờ xác nhận',
      }
    )

    // Tạo tài khoản admin mặc định nếu chưa tồn tại
    const adminUser = await User.firstOrCreate(
      { username: 'admin' },
      {
        id: uuidv4(),
        first_name: 'Admin',
        last_name: 'User',
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123', // Password sẽ được hash tự động
        role_id: adminRole.id,
        status_id: activeStatus.id,
      }
    )

    // Tạo tài khoản demo nếu chưa tồn tại
    const demoUser = await User.firstOrCreate(
      { username: 'demo' },
      {
        id: uuidv4(),
        first_name: 'Demo',
        last_name: 'User',
        username: 'demo',
        email: 'demo@example.com',
        password: 'demo123', // Password sẽ được hash tự động
        role_id: userRole.id,
        status_id: activeStatus.id,
      }
    )

    console.log('Database đã được seeded thành công!')
  }
}
