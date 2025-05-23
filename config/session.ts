import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { defineConfig, stores } from '@adonisjs/session'

export default defineConfig({
  age: '2h',
  enabled: true,
  cookieName: 'adonis-session',
  clearWithBrowser: false,

  cookie: {
    path: '/',
    httpOnly: true,
    secure: app.inProduction,
    sameSite: 'lax',
  },

  store: env.get('SESSION_DRIVER', 'redis'),
  stores: {
    cookie: stores.cookie(),
    redis: stores.redis({
      connection: 'main',
    }),
    file: stores.file({
      location: app.tmpPath('sessions'),
    }),
  },
})
