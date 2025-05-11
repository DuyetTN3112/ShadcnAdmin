import router from '@adonisjs/core/services/router'
import { middleware } from '../kernel.js'

// Dashboard controller
const DashboardController = () => import('#controllers/dashboard/dashboard_controller')

router
  .group(() => {
    // Dashboard route - được sử dụng làm trang chủ cho người dùng đã đăng nhập
    router.get('/', async ({ inertia }) => {
      return inertia.render('dashboard/index')
    })

    // Dashboard route với tên cụ thể
    router.get('/dashboard', [DashboardController, 'index']).as('dashboard.index')
  })
  .use(middleware.auth())
