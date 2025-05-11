import Task from '#models/task'
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'

@inject()
export default class GetTask {
  constructor(protected ctx: HttpContext) {}

  async handle({ id }: { id: string }) {
    const task = await Task.query()
      .where('id', id)
      .whereNull('deleted_at')
      .preload('status')
      .preload('label')
      .preload('priority')
      .preload('assignee', (query) => {
        query.select(['id', 'first_name', 'last_name', 'full_name'])
      })
      .preload('creator', (query) => {
        query.select(['id', 'first_name', 'last_name', 'full_name'])
      })
      .preload('comments', (query) => {
        query.preload('user', (userQuery) => {
          userQuery.select(['id', 'first_name', 'last_name', 'full_name'])
        })
        query.orderBy('created_at', 'asc')
      })
      .preload('versions', (query) => {
        query.orderBy('changed_at', 'desc')
      })
      .firstOrFail()

    return task
  }
}
