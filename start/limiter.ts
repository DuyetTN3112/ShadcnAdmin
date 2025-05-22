/*
|--------------------------------------------------------------------------
| Define HTTP limiters
|--------------------------------------------------------------------------
|
| The "limiter.define" method creates an HTTP middleware to apply rate
| limits on a route or a group of routes. Feel free to define as many
| throttle middleware as needed.
|
*/

import limiter from '@adonisjs/limiter/services/main'
import Redis from '@adonisjs/redis/services/main'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Limiter sử dụng Redis làm storage
 * 10 requests mỗi phút cho mỗi IP
 */
export const throttle = limiter.define('global', () => {
  return (
    limiter
      .allowRequests(10)
      .every('1 minute')
      // @ts-ignore
      .usingRedis(Redis)
      .identifyRequestsUsing((req: HttpContext['request']) => {
        return req.ip()
      })
  )
})

/**
 * Limiter cho API
 * 60 requests mỗi phút cho mỗi IP
 */
export const apiThrottle = limiter.define('api', () => {
  return (
    limiter
      .allowRequests(60)
      .every('1 minute')
      // @ts-ignore
      .usingRedis(Redis)
      .identifyRequestsUsing((req: HttpContext['request']) => {
        return req.ip()
      })
  )
})

/**
 * Limiter cho login
 * 5 yêu cầu đăng nhập mỗi phút cho mỗi IP
 */
export const loginThrottle = limiter.define('login', () => {
  return (
    limiter
      .allowRequests(5)
      .every('1 minute')
      // @ts-ignore
      .usingRedis(Redis)
      .identifyRequestsUsing((req: HttpContext['request']) => {
        return req.ip()
      })
  )
})
