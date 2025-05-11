import router from '@adonisjs/core/services/router'
import { middleware } from '../kernel.js'

// Settings controllers
const SettingsController = () => import('#controllers/settings/settings_controller')

router
  .group(() => {
    // Settings routes
    router.get('/settings', [SettingsController, 'show']).as('settings.index')
    router.put('/settings', [SettingsController, 'update']).as('settings.update')

    // Account settings
    router
      .get('/account', async ({ inertia }) => {
        return inertia.render('settings/account')
      })
      .as('account.index')
    router
      .delete('/account', async ({ response }) => {
        // Xử lý xóa tài khoản
        return response.redirect('/login')
      })
      .as('account.destroy')
  })
  .use(middleware.auth())
